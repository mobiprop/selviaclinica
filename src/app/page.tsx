import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { DashboardToolbar } from "@/components/dashboard/toolbar";
import { DashboardStatCards } from "@/components/dashboard/stat-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { LeadSourcesCard } from "@/components/dashboard/lead-sources-card";
import { NewLeadsCard } from "@/components/dashboard/new-leads-card";
import { CampaignRoiCard } from "@/components/dashboard/campaign-roi-card";
import { TransactionsTable } from "@/components/dashboard/transactions-table";

export default function Home() {
  return (
    <div className="flex h-screen w-full bg-muted/30">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-4 sm:p-6">
            <DashboardToolbar />
            <DashboardStatCards />
            <RevenueChart />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <LeadSourcesCard />
              <NewLeadsCard />
              <CampaignRoiCard />
            </div>
            <TransactionsTable />
          </div>
        </main>
      </div>
    </div>
  );
}
