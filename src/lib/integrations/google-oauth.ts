// Server-side authorization code flow — the token exchange happens in
// src/app/api/integrations/google/callback/route.ts using GOOGLE_CLIENT_SECRET,
// so the popup here only ever sees an authorization code, never a token.

// Calendar uses the events-only (not full "calendar") scope: it can
// create/edit/delete events without also being able to manage or delete
// the calendars themselves.
// Drive uses the file-scoped (not "readonly", which Google classifies as a
// restricted scope requiring a security assessment to verify) drive.file
// scope: it can only see files the user explicitly hands over via the Drive
// Picker (see the "Select files" flow on the Integrations page), not their
// whole Drive.
export const GOOGLE_SCOPES = {
  "google-calendar": "https://www.googleapis.com/auth/calendar.events email",
  "google-drive": "https://www.googleapis.com/auth/drive.file email",
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
