"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { IntegrationKind } from "@/data/integrations";

export type IntegrationConnection = {
  connectedAt: string;
  accountLabel?: string;
};

type ConnectionsMap = Partial<Record<IntegrationKind, IntegrationConnection>>;

type ConnectionRow = {
  kind: IntegrationKind;
  connected_at: string;
  account_label: string | null;
};

type IntegrationsContextValue = {
  connections: ConnectionsMap;
  isConnected: (id: IntegrationKind) => boolean;
  getConnection: (id: IntegrationKind) => IntegrationConnection | undefined;
  connectMcp: () => Promise<void>;
  disconnect: (id: IntegrationKind) => Promise<void>;
  refresh: () => Promise<void>;
};

const IntegrationsContext = createContext<IntegrationsContextValue | null>(null);

async function fetchConnections(): Promise<ConnectionsMap> {
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!configured) return {};

  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: rows, error } = await supabase.from("integration_connections").select("*");
    if (error) {
      console.error("Failed to load integration connections", error);
      return {};
    }
    const next: ConnectionsMap = {};
    for (const row of (rows ?? []) as ConnectionRow[]) {
      next[row.kind] = { connectedAt: row.connected_at, accountLabel: row.account_label ?? undefined };
    }
    return next;
  } catch (err) {
    console.error("Supabase unavailable, integration connections not loaded", err);
    return {};
  }
}

export function IntegrationsProvider({ children }: { children: ReactNode }) {
  const [connections, setConnections] = useState<ConnectionsMap>({});

  useEffect(() => {
    let cancelled = false;
    fetchConnections().then((next) => {
      if (!cancelled) setConnections(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function refresh() {
    setConnections(await fetchConnections());
  }

  async function connectMcp() {
    const res = await fetch("/api/integrations/connections", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: "mcp" }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to mark MCP connected");
    }
    await refresh();
  }

  async function disconnect(id: IntegrationKind) {
    const res = await fetch("/api/integrations/connections", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to disconnect");
    }
    await refresh();
  }

  return (
    <IntegrationsContext.Provider
      value={{
        connections,
        isConnected: (id) => Boolean(connections[id]),
        getConnection: (id) => connections[id],
        connectMcp,
        disconnect,
        refresh,
      }}
    >
      {children}
    </IntegrationsContext.Provider>
  );
}

export function useIntegrations() {
  const ctx = useContext(IntegrationsContext);
  if (!ctx) {
    throw new Error("useIntegrations must be used within an IntegrationsProvider");
  }
  return ctx;
}
