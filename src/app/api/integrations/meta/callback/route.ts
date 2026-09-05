import { createServerSupabaseClient } from "@/lib/supabase/server";
import { storeIntegrationConnection, popupResultHtml } from "@/lib/integrations/store-connection";

const FB_API_VERSION = "v21.0";

function html(body: string) {
  return new Response(body, { headers: { "content-type": "text/html" } });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  if (oauthError) {
    return html(popupResultHtml({ success: false, error: oauthError }));
  }
  if (!code || state !== "meta-ads") {
    return html(popupResultHtml({ success: false, error: "Missing or invalid authorization response" }));
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return html(popupResultHtml({ success: false, error: "Not signed in" }));
    }

    const appId = process.env.NEXT_PUBLIC_META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appId || !appSecret || !appUrl) {
      return html(popupResultHtml({ success: false, error: "Meta integration is not fully configured" }));
    }
    const redirectUri = `${appUrl}/api/integrations/meta/callback`;

    const exchangeParams = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    });
    const shortLivedRes = await fetch(
      `https://graph.facebook.com/${FB_API_VERSION}/oauth/access_token?${exchangeParams.toString()}`
    );
    const shortLivedData = await shortLivedRes.json();
    if (!shortLivedRes.ok) {
      return html(popupResultHtml({ success: false, error: shortLivedData.error?.message ?? "Token exchange failed" }));
    }

    // Exchange the short-lived (~1-2hr) user token for a long-lived one
    // (~60 days) — Meta has no refresh_token; re-authorizing before this
    // expires is currently a manual "Connect" again.
    const longLivedParams = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortLivedData.access_token,
    });
    const longLivedRes = await fetch(
      `https://graph.facebook.com/${FB_API_VERSION}/oauth/access_token?${longLivedParams.toString()}`
    );
    const longLivedData = await longLivedRes.json();
    const accessToken = longLivedRes.ok ? longLivedData.access_token : shortLivedData.access_token;
    const expiresIn = longLivedRes.ok ? longLivedData.expires_in : shortLivedData.expires_in;

    let accountLabel: string | undefined;
    try {
      const meRes = await fetch(
        `https://graph.facebook.com/${FB_API_VERSION}/me?fields=name&access_token=${encodeURIComponent(accessToken)}`
      );
      if (meRes.ok) accountLabel = (await meRes.json()).name;
    } catch {
      // Non-fatal — the connection still works without a display label.
    }

    await storeIntegrationConnection({
      kind: "meta-ads",
      userId: user.id,
      accountLabel,
      accessToken,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : undefined,
    });

    return html(popupResultHtml({ success: true }));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return html(popupResultHtml({ success: false, error: message }));
  }
}
