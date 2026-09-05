"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { Button } from "@/components/ui/button";
import { SetupInstructionsDialog } from "@/components/integrations/setup-instructions-dialog";
import { McpConnectDialog } from "@/components/integrations/mcp-connect-dialog";
import { ManageConnectionDialog } from "@/components/integrations/manage-connection-dialog";
import { useIntegrations } from "@/lib/integrations-context";
import { requestGoogleAccessToken, fetchGoogleAccountEmail, GOOGLE_SCOPES } from "@/lib/integrations/google-oauth";
import { requestMetaAccessToken, fetchMetaAccountName } from "@/lib/integrations/meta-oauth";
import type { Integration } from "@/data/integrations";

export function IntegrationCard({ integration }: { integration: Integration }) {
  const { isConnected, getConnection, connect, disconnect } = useIntegrations();
  const connected = isConnected(integration.id);

  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [mcpDialogOpen, setMcpDialogOpen] = useState(false);
  const [mcpData, setMcpData] = useState<{ apiKey: string; endpointUrl: string } | null>(null);
  const [manageOpen, setManageOpen] = useState(false);

  async function handleConnect() {
    setError(null);
    setConnecting(true);
    try {
      if (integration.id === "mcp") {
        const res = await fetch("/api/mcp/token");
        const data = await res.json();
        if (!data.configured) {
          setError("Set MCP_API_KEY in .env.local, then restart the dev server.");
          return;
        }
        const endpointUrl = `${window.location.origin}${data.endpoint}`;
        setMcpData({ apiKey: data.apiKey, endpointUrl });
        setMcpDialogOpen(true);
        connect("mcp", { connectedAt: new Date().toISOString() });
        return;
      }

      if (integration.id === "google-calendar" || integration.id === "google-drive") {
        const scope = integration.id === "google-calendar" ? GOOGLE_SCOPES.calendar : GOOGLE_SCOPES.drive;
        const accessToken = await requestGoogleAccessToken(scope);
        const email = await fetchGoogleAccountEmail(accessToken);
        connect(integration.id, { connectedAt: new Date().toISOString(), accountLabel: email });
        return;
      }

      if (integration.id === "meta-ads") {
        const accessToken = await requestMetaAccessToken("ads_read");
        const name = await fetchMetaAccountName(accessToken);
        connect(integration.id, { connectedAt: new Date().toISOString(), accountLabel: name });
        return;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection failed";
      if (message.includes("is not configured")) {
        setSetupOpen(true);
      } else {
        setError(message);
      }
    } finally {
      setConnecting(false);
    }
  }

  const connection = getConnection(integration.id);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <IconBadge icon={integration.icon} color={integration.color} size="lg" />
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            connected ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"
          }`}
        >
          {connected && <Check className="h-3 w-3" />}
          {connected ? "Connected" : "Available"}
        </span>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">{integration.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{integration.description}</p>
      </div>

      <Button
        variant={connected ? "outline" : "default"}
        className="mt-auto w-full"
        disabled={connecting}
        onClick={connected ? () => setManageOpen(true) : handleConnect}
      >
        {connecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {connecting ? "Connecting..." : connected ? "Manage" : "Connect"}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}

      <SetupInstructionsDialog open={setupOpen} onOpenChange={setSetupOpen} kind={integration.id} />

      {mcpData && (
        <McpConnectDialog
          open={mcpDialogOpen}
          onOpenChange={setMcpDialogOpen}
          apiKey={mcpData.apiKey}
          endpointUrl={mcpData.endpointUrl}
        />
      )}

      {connection && (
        <ManageConnectionDialog
          open={manageOpen}
          onOpenChange={setManageOpen}
          name={integration.name}
          connection={connection}
          onDisconnect={() => disconnect(integration.id)}
        />
      )}
    </div>
  );
}
