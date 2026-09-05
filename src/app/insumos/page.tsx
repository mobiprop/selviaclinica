"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { SuppliesStats } from "@/components/insumos/supplies-stats";
import { SuppliesTable } from "@/components/insumos/supplies-table";
import { useSupplies } from "@/lib/supplies-context";

export default function InsumosPage() {
  const { supplies } = useSupplies();

  return (
    <div className="flex h-screen w-full bg-muted/30">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-4 sm:p-6">
            <SuppliesStats supplies={supplies} />
            <SuppliesTable supplies={supplies} />
          </div>
        </main>
      </div>
    </div>
  );
}
