"use client";

import { useMemo, useState } from "react";
import { Sparkles, ArrowRight, CalendarRange } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppointments } from "@/lib/appointments-context";
import { isWithinDashboardRange, type DashboardRange } from "@/lib/dashboard-range";

const SLICE_COLORS = ["#60A5FA", "#7DD3FC", "#93C5FD", "#BAE6FD", "#BFDBFE", "#DBEAFE"];
const SIZE = 160;
const RADIUS = 70;
const CENTER = SIZE / 2;

// This card tracks its own period, independent of the dashboard's shared
// range selector — it only ever needs these five options.
const TREATMENTS_RANGE_OPTIONS: { value: DashboardRange; label: string }[] = [
  { value: "all-time", label: "All Time" },
  { value: "current-month", label: "Current Month" },
  { value: "days-30", label: "Last 30 Days" },
  { value: "days-60", label: "Last 60 Days" },
  { value: "days-90", label: "Last 90 Days" },
];

function toXY(angleDeg: number, radius = RADIUS) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [CENTER + radius * Math.cos(rad), CENTER + radius * Math.sin(rad)] as const;
}

function capitalize(label: string) {
  if (!label) return label;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function PopularTreatmentsCard() {
  const { appointments } = useAppointments();
  const [range, setRange] = useState<DashboardRange>("current-month");
  const [hovered, setHovered] = useState<number | null>(null);

  const inRange = appointments.filter((a) => isWithinDashboardRange(a.appointmentDate, range));
  const source = inRange.length > 0 ? inRange : appointments;

  const ranked = useMemo(() => {
    // Group by a case/whitespace-normalized key so "manos semi" and "Manos
    // Semi" merge into one slice instead of splitting the count (and
    // colliding as duplicate React keys once both title-case to the same
    // display label).
    const counts = new Map<string, number>();
    for (const a of source) {
      const key = a.treatment.trim().toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [source]);

  const total = ranked.reduce((sum, [, count]) => sum + count, 0);

  const slices = useMemo(() => {
    let angle = 0;
    return ranked.map(([key, count], i) => {
      const fraction = total > 0 ? count / total : 0;
      const startAngle = angle;
      const endAngle = angle + fraction * 360;
      angle = endAngle;
      const [x1, y1] = toXY(startAngle);
      const [x2, y2] = toXY(endAngle);
      const largeArc = endAngle - startAngle > 180 ? 1 : 0;
      const path =
        fraction >= 0.9995
          ? `M ${CENTER} ${CENTER - RADIUS} A ${RADIUS} ${RADIUS} 0 1 1 ${CENTER - 0.01} ${CENTER - RADIUS} Z`
          : `M ${CENTER},${CENTER} L ${x1},${y1} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2},${y2} Z`;
      const midAngle = (startAngle + endAngle) / 2;
      return {
        key,
        treatment: capitalize(key),
        count,
        fraction,
        path,
        color: SLICE_COLORS[i % SLICE_COLORS.length],
        labelAngle: midAngle,
      };
    });
  }, [ranked, total]);

  return (
    <div className="flex flex-1 flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <IconBadge icon={Sparkles} color="pink" size="sm" />
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

      <div className="mb-4">
        <Select value={range} onValueChange={(v) => setRange(v as DashboardRange)}>
          <SelectTrigger className="h-7 w-full gap-1.5 text-xs">
            <CalendarRange className="h-3 w-3 text-muted-foreground" />
            <SelectValue>
              {TREATMENTS_RANGE_OPTIONS.find((o) => o.value === range)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TREATMENTS_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {ranked.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No treatments in this period yet.
        </div>
      ) : (
        <div className="relative flex flex-1 items-center gap-5" data-chart-root>
          <div className="relative shrink-0">
            <svg
              width={SIZE}
              height={SIZE}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              onMouseLeave={() => setHovered(null)}
            >
              {slices.map((slice, i) => (
                <path
                  key={slice.key}
                  d={slice.path}
                  fill={slice.color}
                  stroke="var(--card)"
                  strokeWidth={2}
                  opacity={hovered === null || hovered === i ? 1 : 0.45}
                  onMouseEnter={() => setHovered(i)}
                  className="cursor-pointer transition-opacity"
                />
              ))}
            </svg>
            {hovered !== null && (() => {
              const [tx, ty] = toXY(slices[hovered].labelAngle, RADIUS * 0.62);
              return (
                <div
                  className="pointer-events-none absolute z-10 w-max max-w-[160px] -translate-x-1/2 -translate-y-1/2 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md"
                  style={{ left: tx, top: ty }}
                >
                  <div className="font-medium text-foreground">{slices[hovered].treatment}</div>
                  <div className="text-muted-foreground">
                    {slices[hovered].count} patients ({Math.round(slices[hovered].fraction * 100)}%)
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            {slices.map((slice, i) => (
              <div
                key={slice.key}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className={`flex cursor-default items-center gap-2 rounded-sm px-1 py-0.5 text-xs transition-colors ${
                  hovered === i ? "bg-accent" : ""
                }`}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="min-w-0 flex-1 truncate text-muted-foreground" title={slice.treatment}>
                  {slice.treatment}
                </span>
                <span className="shrink-0 font-medium text-foreground">{slice.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
