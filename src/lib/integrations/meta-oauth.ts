const FB_SDK_SRC = "https://connect.facebook.net/en_US/sdk.js";
const FB_API_VERSION = "v21.0";

type FacebookAuthResponse = {
  accessToken: string;
};

type FacebookLoginResponse = {
  status: "connected" | "not_authorized" | "unknown";
  authResponse?: FacebookAuthResponse;
};

declare global {
  interface Window {
    FB?: {
      init: (config: { appId: string; version: string; xfbml?: boolean }) => void;
      login: (
        callback: (response: FacebookLoginResponse) => void,
        options?: { scope: string }
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

let fbLoadPromise: Promise<void> | null = null;

function loadFacebookSdk(appId: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Not in a browser"));
  if (window.FB) return Promise.resolve();
  if (fbLoadPromise) return fbLoadPromise;

  fbLoadPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB!.init({ appId, version: FB_API_VERSION, xfbml: false });
      resolve();
    };
    const script = document.createElement("script");
    script.src = FB_SDK_SRC;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Failed to load the Facebook SDK"));
    document.head.appendChild(script);
  });
  return fbLoadPromise;
}

/**
 * Opens Meta's own Facebook Login popup and resolves with a short-lived user
 * access token. This is Meta's officially supported client-only flow — no
 * app secret needed. Works immediately for the developer's own ad account in
 * an app still in Development mode; extending access to other users' ad
 * accounts requires Meta App Review for the ads_read permission.
 */
export async function requestMetaAccessToken(scope = "ads_read"): Promise<string> {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  if (!appId) {
    throw new Error("NEXT_PUBLIC_META_APP_ID is not configured");
  }

  await loadFacebookSdk(appId);

  return new Promise((resolve, reject) => {
    window.FB!.login((response) => {
      if (response.status === "connected" && response.authResponse?.accessToken) {
        resolve(response.authResponse.accessToken);
      } else {
        reject(new Error("Meta sign-in was cancelled or not authorized"));
      }
    }, { scope });
  });
}

export async function fetchMetaAccountName(accessToken: string): Promise<string | undefined> {
  const res = await fetch(
    `https://graph.facebook.com/${FB_API_VERSION}/me?fields=name&access_token=${encodeURIComponent(accessToken)}`
  );
  if (!res.ok) return undefined;
  const data = await res.json();
  return data.name;
}
