// Server-side authorization code flow — the token exchange happens in
// src/app/api/integrations/google/callback/route.ts using GOOGLE_CLIENT_SECRET,
// so the popup here only ever sees an authorization code, never a token.

export const GOOGLE_SCOPES = {
  "google-calendar": "https://www.googleapis.com/auth/calendar.readonly email",
  "google-drive": "https://www.googleapis.com/auth/drive.readonly email",
};

export function buildGoogleAuthorizeUrl(kind: "google-calendar" | "google-drive") {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!clientId) throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured");
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is not configured");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${appUrl}/api/integrations/google/callback`,
    response_type: "code",
    scope: GOOGLE_SCOPES[kind],
    access_type: "offline",
    prompt: "consent",
    state: kind,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
