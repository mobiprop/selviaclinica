"use client";

import { Grid2x2, Plug, Zap, CalendarCheck } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { INTEGRATIONS } from "@/data/integrations";
import { useIntegrations } from "@/lib/integrations-context";

export function IntegrationsStats() {
  const { isConnected } = useIntegrations();
  const total = INTEGRATIONS.length;
  const connected = INTEGRATIONS.filter((i) => isConnected(i.id)).length;
  const available = total - connected;

  const stats = [
    { label: "Total Integrations", icon: Grid2x2, color: "blue" as const, value: total },
    { label: "Connected", icon: Plug, color: "green" as const, value: connected },
    { label: "Available", icon: Zap, color: "amber" as const, value: available },
    { label: "Active This Month", icon: CalendarCheck, color: "violet" as const, value: connected },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{stat.value}</div>
          </div>
          <IconBadge icon={stat.icon} color={stat.color} size="lg" />
        </div>
      ))}
    </div>
  );
}
