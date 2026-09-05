"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { AiChat } from "@/components/ai-data/ai-chat";

export default function AiDataPage() {
  return (
    <div className="flex h-screen w-full bg-muted/30">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 overflow-hidden">
          <AiChat />
        </main>
      </div>
    </div>
  );
}
