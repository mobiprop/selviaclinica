"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { DashboardToolbar } from "@/components/dashboard/toolbar";
import { DashboardStatCards } from "@/components/dashboard/stat-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { PopularTreatmentsCard } from "@/components/dashboard/popular-treatments-card";
import { NewPatientsCard } from "@/components/dashboard/new-patients-card";
import { CampaignRoiCard } from "@/components/dashboard/campaign-roi-card";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import type { DashboardRange } from "@/lib/dashboard-range";

export default function Home() {
  const [range, setRange] = useState<DashboardRange>("current-month");

  return (
    <div className="flex h-screen w-full bg-muted/30">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-4 sm:p-6">
            <DashboardToolbar value={range} onChange={setRange} />
            <DashboardStatCards range={range} />
            <RevenueChart range={range} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <PopularTreatmentsCard />
              <NewPatientsCard range={range} />
              <CampaignRoiCard />
            </div>
            <TransactionsTable />
          </div>
        </main>
      </div>
    </div>
  );
}
