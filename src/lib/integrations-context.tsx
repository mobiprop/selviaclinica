"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { IntegrationKind } from "@/data/integrations";

export type IntegrationConnection = {
  connectedAt: string;
  accountLabel?: string;
};

type ConnectionsMap = Partial<Record<IntegrationKind, IntegrationConnection>>;

type IntegrationsContextValue = {
  connections: ConnectionsMap;
  isConnected: (id: IntegrationKind) => boolean;
  getConnection: (id: IntegrationKind) => IntegrationConnection | undefined;
  connect: (id: IntegrationKind, connection: IntegrationConnection) => void;
  disconnect: (id: IntegrationKind) => void;
};

const IntegrationsContext = createContext<IntegrationsContextValue | null>(null);

const STORAGE_KEY = "selvia.integrationConnections";

export function IntegrationsProvider({ children }: { children: ReactNode }) {
  const [connections, setConnections] = useState<ConnectionsMap>({});

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setConnections(JSON.parse(stored));
    } catch {
      // localStorage unavailable or corrupt — start from an empty state.
    }
  }, []);

  function persist(next: ConnectionsMap) {
    setConnections(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore write failures — the in-memory value still updates for this session.
    }
  }

  function connect(id: IntegrationKind, connection: IntegrationConnection) {
    persist({ ...connections, [id]: connection });
  }

  function disconnect(id: IntegrationKind) {
    const next = { ...connections };
    delete next[id];
    persist(next);
  }

  return (
    <IntegrationsContext.Provider
      value={{
        connections,
        isConnected: (id) => Boolean(connections[id]),
        getConnection: (id) => connections[id],
        connect,
        disconnect,
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
