"use client";

import { Download, MoreHorizontal } from "lucide-react";
import { DASHBOARD_RANGE_OPTIONS, type DashboardRange } from "@/lib/dashboard-range";

export function DashboardToolbar({
  value,
  onChange,
}: {
  value: DashboardRange;
  onChange: (range: DashboardRange) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
        {DASHBOARD_RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              value === option.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 rounded-md bg-[#4D5C45] px-3.5 py-2 text-sm font-medium text-[#F5F2EA] shadow-sm hover:opacity-90">
          <Download className="h-3.5 w-3.5" />
          Download Report
        </button>
        <button className="rounded-md border border-border p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
