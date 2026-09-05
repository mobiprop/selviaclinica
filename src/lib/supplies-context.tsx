"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Supply } from "@/types/supply";
import { supplyFromRow, supplyToRow, type SupplyRow } from "@/lib/supabase/mappers";

type SuppliesContextValue = {
  supplies: Supply[];
  addSupply: (supply: Supply) => void;
  updateSupply: (id: string, patch: Partial<Supply>) => void;
};

const SuppliesContext = createContext<SuppliesContextValue | null>(null);

export function SuppliesProvider({ children }: { children: ReactNode }) {
  const [supplies, setSupplies] = useState<Supply[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      if (!configured) return;

      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: rows, error } = await supabase.from("supplies").select("*").order("name");
        if (cancelled) return;
        if (error) {
          console.error("Failed to load supplies", error);
        } else if (rows) {
          setSupplies((rows as SupplyRow[]).map(supplyFromRow));
        }
      } catch (err) {
        console.error("Supabase unavailable, supplies not loaded", err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function addSupply(supply: Supply) {
    setSupplies((prev) => [supply, ...prev]);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.from("supplies").insert(supplyToRow(supply));
      if (error) console.error("Failed to save supply", error);
    } catch (err) {
      console.error("Supabase unavailable, supply kept locally only", err);
    }
  }

  async function updateSupply(id: string, patch: Partial<Supply>) {
    setSupplies((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const current = supplies.find((s) => s.id === id);
      const merged = current ? { ...current, ...patch, id } : null;
      if (!merged) return;
      const row: Partial<ReturnType<typeof supplyToRow>> = supplyToRow(merged as Supply);
      delete row.id;
      const { error } = await supabase.from("supplies").update(row).eq("id", id);
      if (error) console.error("Failed to update supply", error);
    } catch (err) {
      console.error("Supabase unavailable, update kept locally only", err);
    }
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
