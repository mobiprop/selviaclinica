"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Supply } from "@/types/supply";
import { SEED_SUPPLIES } from "@/data/seed-supplies";

type SuppliesContextValue = {
  supplies: Supply[];
  addSupply: (supply: Supply) => void;
  updateSupply: (id: string, patch: Partial<Supply>) => void;
};

const SuppliesContext = createContext<SuppliesContextValue | null>(null);

export function SuppliesProvider({ children }: { children: ReactNode }) {
  const [supplies, setSupplies] = useState<Supply[]>(SEED_SUPPLIES);

  function addSupply(supply: Supply) {
    setSupplies((prev) => [supply, ...prev]);
  }

  function updateSupply(id: string, patch: Partial<Supply>) {
    setSupplies((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  return (
    <SuppliesContext.Provider value={{ supplies, addSupply, updateSupply }}>
      {children}
    </SuppliesContext.Provider>
  );
}

export function useSupplies() {
  const ctx = useContext(SuppliesContext);
  if (!ctx) {
    throw new Error("useSupplies must be used within a SuppliesProvider");
  }
  return ctx;
}
