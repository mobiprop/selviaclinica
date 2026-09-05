"use client";

import { Plug, Plus } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { IntegrationsStats } from "@/components/integrations/integrations-stats";
import { IntegrationCard } from "@/components/integrations/integration-card";
import { INTEGRATIONS } from "@/data/integrations";

export default function IntegrationsPage() {
  return (
    <div className="flex h-screen w-full bg-muted/30">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar title="Integrations" icon={Plug} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-foreground">Integrations</h1>
                <p className="text-sm text-muted-foreground">Connect your favorite tools and apps</p>
              </div>
              <button className="flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90">
                <Plus className="h-3.5 w-3.5" />
                Request Integration
              </button>
            </div>

            <IntegrationsStats />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {INTEGRATIONS.map((integration) => (
                <IntegrationCard key={integration.id} integration={integration} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
