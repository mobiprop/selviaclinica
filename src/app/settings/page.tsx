"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { SettingsNav, type SettingsTab } from "@/components/settings/settings-nav";
import { ProfilePanel } from "@/components/settings/profile-panel";
import { SecurityPanel } from "@/components/settings/security-panel";
import { PreferencesPanel } from "@/components/settings/preferences-panel";

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("profile");

  return (
    <div className="flex h-screen w-full bg-muted/30">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-1 p-4 sm:p-6">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Settings</h1>
            <p className="mb-6 text-sm text-muted-foreground">Manage your account and preferences</p>

            <div className="flex flex-col gap-6 md:flex-row">
              <SettingsNav value={tab} onChange={setTab} />
              <div className="flex-1 rounded-xl border border-border bg-card p-6 shadow-sm">
                {tab === "profile" && <ProfilePanel />}
                {tab === "security" && <SecurityPanel />}
                {tab === "preferences" && <PreferencesPanel />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
