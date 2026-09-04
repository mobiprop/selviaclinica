"use client";

import { useMemo } from "react";
import { UserPlus, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import { useAppointments } from "@/lib/appointments-context";

const WINDOW_DAYS = 30;
const WIDTH = 400;
const HEIGHT = 90;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function NewLeadsCard() {
  const { appointments } = useAppointments();

  const { total, deltaPct, points } = useMemo(() => {
    const today = startOfDay(new Date());
    const windowStart = new Date(today);
    windowStart.setDate(windowStart.getDate() - (WINDOW_DAYS - 1));
    const prevStart = new Date(windowStart);
    prevStart.setDate(prevStart.getDate() - WINDOW_DAYS);
    const prevEnd = new Date(windowStart);
    prevEnd.setDate(prevEnd.getDate() - 1);

    const counts = new Array(WINDOW_DAYS).fill(0);
    let currentTotal = 0;
    let prevTotal = 0;

    for (const a of appointments) {
      const date = new Date(`${a.appointmentDate}T00:00:00`);
      if (date >= windowStart && date <= today) {
        const dayIndex = Math.round((date.getTime() - windowStart.getTime()) / (1000 * 60 * 60 * 24));
        counts[dayIndex] += 1;
        currentTotal += 1;
      } else if (date >= prevStart && date <= prevEnd) {
        prevTotal += 1;
      }
    }

    const delta = prevTotal === 0 ? (currentTotal > 0 ? 100 : null) : ((currentTotal - prevTotal) / prevTotal) * 100;

    return { total: currentTotal, deltaPct: delta, points: counts };
  }, [appointments]);

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
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          New Leads / Day
        </div>
        <a
          href="/patients"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          View leads
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
      <div className="mb-2 text-xs text-muted-foreground">leads in last {WINDOW_DAYS} days</div>

      <div className="mt-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="h-20 w-full"
        >
          <defs>
            <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4D5C45" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#4D5C45" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#leadsFill)" stroke="none" />
          <path
            d={linePath}
            fill="none"
            stroke="#4D5C45"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
