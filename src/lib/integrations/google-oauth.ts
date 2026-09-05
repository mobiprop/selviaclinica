const GSI_SRC = "https://accounts.google.com/gsi/client";

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleTokenClient = {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (error: { type: string; message?: string }) => void;
          }) => GoogleTokenClient;
        };
      };
    };
  }
}

let gsiLoadPromise: Promise<void> | null = null;

function loadGoogleIdentityServices(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Not in a browser"));
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gsiLoadPromise) return gsiLoadPromise;

  gsiLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
  return gsiLoadPromise;
}

/**
 * Opens Google's own consent popup (via Google Identity Services' token
 * client model) and resolves with a short-lived (~1 hour) access token.
 * Client-ID only — no client secret involved, since this app has no backend
 * yet to hold one. There's no refresh token in this flow, so the connection
 * needs to be re-authorized once the token expires.
 */
export async function requestGoogleAccessToken(scope: string): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured");
  }

  await loadGoogleIdentityServices();

  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope,
      callback: (response) => {
        if (response.access_token) resolve(response.access_token);
        else reject(new Error(response.error_description ?? response.error ?? "Google sign-in failed"));
      },
      error_callback: (error) => {
        reject(new Error(error.message ?? error.type ?? "Google sign-in was cancelled"));
      },
    });
    client.requestAccessToken();
  });
}

// "email" is included alongside each scope so fetchGoogleAccountEmail() can
// show which Google account got connected.
export const GOOGLE_SCOPES = {
  calendar: "https://www.googleapis.com/auth/calendar.readonly email",
  drive: "https://www.googleapis.com/auth/drive.readonly email",
};

export async function fetchGoogleAccountEmail(accessToken: string): Promise<string | undefined> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return undefined;
  const data = await res.json();
  return data.email;
}
