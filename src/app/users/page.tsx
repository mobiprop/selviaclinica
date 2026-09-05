"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { UsersTable } from "@/components/users/users-table";

export default function UsersPage() {
  return (
    <div className="flex h-screen w-full bg-muted/30">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <DashboardTopbar />
        <div className="flex flex-col gap-1 px-4 pt-6 sm:px-6">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">Approve or deny access requests for your team.</p>
        </div>
        <div className="p-4 sm:p-6">
          <UsersTable />
        </div>
      </div>
    </div>
  );
}
