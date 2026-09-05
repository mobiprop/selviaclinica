"use client";

import { useMemo } from "react";
import { UserPlus, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { useAppointments } from "@/lib/appointments-context";
import {
  isWithinDashboardRange,
  isWithinWindow,
  previousRangeWindow,
  rangeStart,
  rangeEnd,
  rangeLabel,
  type DashboardRange,
} from "@/lib/dashboard-range";

const WIDTH = 400;
const HEIGHT = 90;

function patientKey(firstName: string, lastName: string) {
  return `${firstName.trim().toLowerCase()} ${lastName.trim().toLowerCase()}`;
}

export function NewPatientsCard({ range }: { range: DashboardRange }) {
  const { appointments } = useAppointments();

  const { total, deltaPct, points } = useMemo(() => {
    const today = new Date();

    // A patient's "new patient" moment is the earliest appointment on record
    // for them, across the whole dataset — not just within the selected range.
    const firstSeen = new Map<string, string>();
    for (const a of appointments) {
      const key = patientKey(a.firstName, a.lastName);
      const existing = firstSeen.get(key);
      if (!existing || a.appointmentDate < existing) firstSeen.set(key, a.appointmentDate);
    }
    const firstSeenDates = Array.from(firstSeen.values());

    const currentTotal = firstSeenDates.filter((d) => isWithinDashboardRange(d, range, today)).length;
    const isAllTime = range === "all-time";
    const prevTotal = isAllTime
      ? 0
      : firstSeenDates.filter((d) => isWithinWindow(d, previousRangeWindow(range, today))).length;

    const delta = isAllTime
      ? null
      : prevTotal === 0
        ? currentTotal > 0
          ? 100
          : null
        : ((currentTotal - prevTotal) / prevTotal) * 100;

    // Spark line across the range's own days, clamped to today so "All Time"
    // doesn't try to render decades of empty future days.
    let start = rangeStart(range, today);
    const end = range === "all-time" ? today : rangeEnd(range, today);
    if (isAllTime && firstSeenDates.length > 0) {
      const earliest = firstSeenDates.reduce((min, d) => (d < min ? d : min), firstSeenDates[0]);
      const earliestDate = new Date(`${earliest}T00:00:00`);
      if (earliestDate > start) start = earliestDate;
    }

    const days: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(d.toISOString().slice(0, 10));
    }
    const counts = days.map((dateStr) => firstSeenDates.filter((d) => d === dateStr).length);

    return { total: currentTotal, deltaPct: delta, points: counts.length > 0 ? counts : [0] };
  }, [appointments, range]);

  const max = Math.max(...points, 1);
  const linePoints = points.map((v, i) => {
    const x = (i / Math.max(points.length - 1, 1)) * WIDTH;
    const y = HEIGHT - (v / max) * HEIGHT;
    return [x, y] as const;
  });
  const linePath = linePoints
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;

  const positive = (deltaPct ?? 0) >= 0;

  return (
    <div className="flex flex-1 flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <IconBadge icon={UserPlus} color="cyan" size="sm" />
          New Patients
        </div>
        <a
          href="/patients"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          View patients
          <ArrowRight className="h-3 w-3" />
        </a>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-3xl font-semibold tracking-tight text-foreground">{total}</span>
        {deltaPct !== null && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
              positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
            }`}
          >
            {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(deltaPct).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mb-2 text-xs text-muted-foreground">{rangeLabel(range)}</div>

      <div className="mt-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="h-20 w-full"
        >
          <defs>
            <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0891B2" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0891B2" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#leadsFill)" stroke="none" />
          <path
            d={linePath}
            fill="none"
            stroke="#0891B2"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
