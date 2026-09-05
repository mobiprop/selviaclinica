import { createServiceRoleClient } from "@/lib/supabase/server";

type TokenRow = {
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
};

/**
 * Returns a valid (non-expired) Google access token for the given connected
 * integration, refreshing it via the stored refresh_token first if needed.
 * Server-only — reads/writes the service-role-only integration_tokens table.
 */
export async function getValidGoogleAccessToken(kind: "google-calendar" | "google-drive"): Promise<string> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("integration_tokens")
    .select("access_token, refresh_token, expires_at")
    .eq("kind", kind)
    .maybeSingle();

  if (error) throw new Error(`Failed to load ${kind} connection: ${error.message}`);
  const row = data as TokenRow | null;
  if (!row) throw new Error(`${kind} isn't connected yet — connect it from the Integrations page first.`);

  const isExpired = row.expires_at ? new Date(row.expires_at).getTime() - Date.now() < 60_000 : false;
  if (!isExpired) return row.access_token;

  if (!row.refresh_token) {
    throw new Error(`${kind}'s access token expired and there's no refresh token — reconnect it from the Integrations page.`);
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth isn't configured (missing client id/secret).");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: row.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  const data2 = await res.json();
  if (!res.ok) {
    throw new Error(`Failed to refresh ${kind} token: ${data2.error_description ?? data2.error ?? "unknown error"}`);
  }

  const expiresAt = data2.expires_in ? new Date(Date.now() + data2.expires_in * 1000).toISOString() : null;
  await supabase
    .from("integration_tokens")
    .update({ access_token: data2.access_token, expires_at: expiresAt, updated_at: new Date().toISOString() })
    .eq("kind", kind);

  return data2.access_token;
}
