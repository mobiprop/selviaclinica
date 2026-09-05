"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Package, Search, Plus } from "lucide-react";
import { SupplyFormDialog } from "@/components/insumos/supply-form-dialog";
import { SupplyActionsMenu } from "@/components/insumos/supply-actions-menu";
import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/icon-badge";
import { useSupplies } from "@/lib/supplies-context";
import type { Supply } from "@/types/supply";

export function SuppliesTable({ supplies }: { supplies: Supply[] }) {
  const { addSupply, updateSupply } = useSupplies();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supply | null>(null);

  // Supports being deep-linked from the global topbar search: /insumos?edit=<id>
  // opens straight into that supply's edit form, then clears the param so a
  // refresh or back-navigation doesn't reopen it.
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId) return;
    const match = supplies.find((s) => s.id === editId);
    if (match) {
      setEditing(match);
      setDialogOpen(true);
    }
    router.replace("/insumos");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return supplies;
    return supplies.filter((s) => `${s.name} ${s.unit}`.toLowerCase().includes(q));
  }, [supplies, query]);

  function openAddDialog() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEditDialog(supply: Supply) {
    setEditing(supply);
    setDialogOpen(true);
  }

  function handleSubmit(supply: Supply) {
    if (editing) {
      updateSupply(supply.id, supply);
    } else {
      addSupply(supply);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <IconBadge icon={Package} color="blue" size="sm" />
          Insumos
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search supplies..."
              className="h-8 w-52 rounded-md border border-border bg-background pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4" />
            Add Supply
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Unit</th>
              <th className="px-3 py-3 font-medium">Usage</th>
              <th className="px-3 py-3 font-medium">Currency</th>
              <th className="w-10 px-3 py-3 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No supplies found.
                </td>
              </tr>
            )}
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-accent/40">
                <td className="max-w-[320px] truncate px-5 py-3 font-medium text-foreground" title={s.name}>
                  {s.name}
                </td>
                <td className="max-w-[220px] truncate px-3 py-3 text-muted-foreground" title={s.unit}>
                  {s.unit}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.usage === "Exacto" ? "bg-violet-50 text-violet-600" : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {s.usage}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.currency === "USD" ? "bg-cyan-50 text-cyan-600" : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {s.currency}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right">
                  <SupplyActionsMenu onEdit={() => openEditDialog(s)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SupplyFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editing}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
