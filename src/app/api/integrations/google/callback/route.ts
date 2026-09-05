import { createServerSupabaseClient } from "@/lib/supabase/server";
import { storeIntegrationConnection, popupResultHtml } from "@/lib/integrations/store-connection";

function html(body: string) {
  return new Response(body, { headers: { "content-type": "text/html" } });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return html(popupResultHtml({ success: false, error: oauthError }));
  }
  if (!code || (state !== "google-calendar" && state !== "google-drive")) {
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

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!clientId || !clientSecret || !appUrl) {
      return html(popupResultHtml({ success: false, error: "Google integration is not fully configured" }));
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${appUrl}/api/integrations/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return html(
        popupResultHtml({ success: false, error: tokenData.error_description ?? "Token exchange failed" })
      );
    }

    let accountLabel: string | undefined;
    try {
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (userInfoRes.ok) accountLabel = (await userInfoRes.json()).email;
    } catch {
      // Non-fatal — the connection still works without a display label.
    }

    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : undefined;

    await storeIntegrationConnection({
      kind: state,
      userId: user.id,
      accountLabel,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
    });

    return html(popupResultHtml({ success: true }));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return html(popupResultHtml({ success: false, error: message }));
  }
}
