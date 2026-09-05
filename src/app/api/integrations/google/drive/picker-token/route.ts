import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getValidGoogleAccessToken } from "@/lib/integrations/google-token";

/**
 * Hands the caller's own current Google Drive access token to their own
 * browser, for the Drive Picker widget only. Safe to expose: it's the
 * signed-in user's own short-lived token (not a shared secret), and the
 * Picker widget itself requires a client-side OAuth token to function.
 */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });

  try {
    const accessToken = await getValidGoogleAccessToken("google-drive", user.id);
    return Response.json({ accessToken });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get Drive access token";
    const notConnected = message.includes("isn't connected");
    return Response.json({ error: message }, { status: notConnected ? 409 : 502 });
  }
}
