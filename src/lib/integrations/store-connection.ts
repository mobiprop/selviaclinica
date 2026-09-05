import { createServiceRoleClient } from "@/lib/supabase/server";
import type { IntegrationKind } from "@/data/integrations";

type StoreConnectionInput = {
  kind: Exclude<IntegrationKind, "mcp">;
  userId: string;
  accountLabel?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
};

/**
 * Writes the token (service-role only table) and the user-visible connection
 * record. Called only from OAuth callback Route Handlers, after verifying
 * the caller's session. Calendar/Drive are personal connections — each row
 * is scoped to `userId`, so different people connecting doesn't clobber each
 * other's tokens.
 */
export async function storeIntegrationConnection(input: StoreConnectionInput) {
  const supabase = createServiceRoleClient();

  const { error: tokenError } = await supabase
    .from("integration_tokens")
    .upsert(
      {
        kind: input.kind,
        user_id: input.userId,
        access_token: input.accessToken,
        refresh_token: input.refreshToken ?? null,
        expires_at: input.expiresAt ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "kind,user_id" }
    );
  if (tokenError) throw tokenError;

  const { error: connectionError } = await supabase
    .from("integration_connections")
    .upsert(
      {
        kind: input.kind,
        user_id: input.userId,
        account_label: input.accountLabel ?? null,
        connected_at: new Date().toISOString(),
      },
      { onConflict: "kind,user_id" }
    );
  if (connectionError) throw connectionError;
}

/** Small HTML page the popup shows for an instant before reporting the result to the opener and closing itself. */
export function popupResultHtml(result: { success: true } | { success: false; error: string }) {
  const payload = JSON.stringify({ type: "selvia-integration-result", ...result });
  return `<!doctype html>
<html>
  <body style="font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
    <p>${result.success ? "Connected — you can close this window." : `Connection failed: ${result.error}`}</p>
    <script>
      window.opener && window.opener.postMessage(${payload}, window.location.origin);
      window.close();
    </script>
  </body>
</html>`;
}
