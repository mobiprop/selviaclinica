"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import { useAppointments } from "@/lib/appointments-context";
import { isWithinDashboardRange, type DashboardRange } from "@/lib/dashboard-range";

export function PopularTreatmentsCard({ range }: { range: DashboardRange }) {
  const { appointments } = useAppointments();
  const inRange = appointments.filter((a) => isWithinDashboardRange(a.appointmentDate, range));
  const source = inRange.length > 0 ? inRange : appointments;

  const counts = new Map<string, number>();
  for (const a of source) {
    counts.set(a.treatment, (counts.get(a.treatment) ?? 0) + 1);
  }

  const ranked = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const max = ranked.length > 0 ? ranked[0][1] : 1;

  return (
    <div className="flex flex-1 flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          Most Popular Treatments
        </div>
        <a
          href="/patients"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          View patients
          <ArrowRight className="h-3 w-3" />
        </a>
      </div>

      {ranked.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No treatments in this period yet.
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-center gap-3">
          {ranked.map(([treatment, count]) => (
            <div key={treatment} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-xs text-muted-foreground sm:w-40" title={treatment}>
                {treatment}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[#4D5C45]"
                  style={{ width: `${Math.max((count / max) * 100, 6)}%` }}
                />
              </div>
              <span className="w-5 shrink-0 text-right text-xs font-medium text-foreground">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
