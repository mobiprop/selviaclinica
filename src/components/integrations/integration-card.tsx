"use client";

import { Check } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { Button } from "@/components/ui/button";
import type { Integration } from "@/data/integrations";

export function IntegrationCard({ integration }: { integration: Integration }) {
  const connected = integration.status === "connected";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <IconBadge icon={integration.icon} color={integration.color} size="lg" />
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            connected ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"
          }`}
        >
          {connected && <Check className="h-3 w-3" />}
          {connected ? "Connected" : "Available"}
        </span>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">{integration.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{integration.description}</p>
      </div>

      <Button variant={connected ? "outline" : "default"} className="mt-auto w-full">
        {connected ? "Manage" : "Connect"}
      </Button>
    </div>
  );
}
