// Server-side authorization code flow — the token exchange happens in
// src/app/api/integrations/meta/callback/route.ts using META_APP_SECRET, so
// the popup here only ever sees an authorization code, never a token.

const FB_API_VERSION = "v21.0";

export function buildMetaAuthorizeUrl() {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appId) throw new Error("NEXT_PUBLIC_META_APP_ID is not configured");
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is not configured");

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: `${appUrl}/api/integrations/meta/callback`,
    response_type: "code",
    scope: "ads_read",
    state: "meta-ads",
  });

  return `https://www.facebook.com/${FB_API_VERSION}/dialog/oauth?${params.toString()}`;
}
