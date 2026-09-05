"use client";

import { useMemo, useState, useRef, type MouseEvent } from "react";
import { Pencil, Check, DollarSign, Target } from "lucide-react";
import { useAppointments } from "@/lib/appointments-context";
import { rangeStart, rangeEnd, type DashboardRange } from "@/lib/dashboard-range";
import { formatCurrency } from "@/lib/format";

const WIDTH = 1200;
const HEIGHT = 280;
const DAILY_TARGET_RATE_DIVISOR = 30;

function formatCompact(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1000)}K`;
  return `$${Math.round(value)}`;
}

function toPath(values: number[], max: number) {
  return values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * WIDTH;
      const y = HEIGHT - (max > 0 ? (v / max) * HEIGHT : 0);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function RevenueChart({ range }: { range: DashboardRange }) {
  const { appointments, monthlyTarget, setMonthlyTarget } = useAppointments();
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(String(monthlyTarget));
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);

  const { actual, target, labels } = useMemo(() => {
    const today = new Date();
    let start = rangeStart(range, today);
    // The chart tracks revenue earned to date, so even though "All Time" the
    // stat cards include future-dated Scheduled appointments, the trend line
    // itself stops at today rather than stretching to the range's nominal
    // (far-future) end.
    const end = range === "all-time" ? today : rangeEnd(range, today);

    if (range === "all-time" && appointments.length > 0) {
      const earliest = appointments.reduce(
        (min, a) => (a.appointmentDate < min ? a.appointmentDate : min),
        appointments[0].appointmentDate
      );
      const earliestDate = new Date(`${earliest}T00:00:00`);
      if (earliestDate > start) start = earliestDate;
    }
    const days: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    const dailyTarget = monthlyTarget / DAILY_TARGET_RATE_DIVISOR;
    let runningActual = 0;
    let runningTarget = 0;

    // Seed the series with an explicit $0 point at the start date itself, so the
    // line visibly starts grounded at the origin instead of floating above it
    // when the very first day already has revenue.
    const actualValues: number[] = [0];
    const targetValues: number[] = [0];
    const dayLabels: string[] = [
      days[0]?.toLocaleDateString("en-US", { month: "short", day: "numeric" }) ?? "",
    ];

    for (const day of days) {
      const dateStr = day.toISOString().slice(0, 10);
      const dayRevenue = appointments
        .filter((a) => a.status === "Completed" && a.appointmentDate === dateStr)
        .reduce((sum, a) => sum + a.netRevenue, 0);

      runningActual += dayRevenue;
      runningTarget += dailyTarget;

      actualValues.push(runningActual);
      targetValues.push(runningTarget);
      dayLabels.push(day.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    }

    return { actual: actualValues, target: targetValues, labels: dayLabels };
  }, [appointments, monthlyTarget, range]);

  const latestActual = actual[actual.length - 1] ?? 0;
  const latestTarget = target[target.length - 1] ?? 0;
  const onPace = latestActual >= latestTarget;
  const revenueColor = onPace ? "#16A34A" : "#DC2626";

  const max = Math.max(latestActual, latestTarget, 1) * 1.15;
  const yLabels = [1, 0.75, 0.5, 0.25, 0].map((f) => Math.round(max * f));

  const labelStep = Math.max(Math.ceil(labels.length / 7), 1);
  const visibleLabels = labels.filter((_, i) => i % labelStep === 0 || i === labels.length - 1);

  const actualPath = toPath(actual, max);
  const targetPath = toPath(target, max);
  const areaPath = `${actualPath} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;

  function saveTarget() {
    const value = Number(targetInput);
    if (!Number.isNaN(value) && value > 0) setMonthlyTarget(value);
    setEditingTarget(false);
  }

  function handleChartHover(e: MouseEvent<HTMLDivElement>) {
    const rect = chartAreaRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const fraction = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const index = Math.round(fraction * (actual.length - 1));
    setHoverIndex(index);
  }

  const hoverPct = hoverIndex !== null ? (hoverIndex / Math.max(actual.length - 1, 1)) * 100 : null;
  const hoverX = hoverIndex !== null ? (hoverIndex / Math.max(actual.length - 1, 1)) * WIDTH : null;
  const hoverActualY = hoverIndex !== null ? HEIGHT - (max > 0 ? (actual[hoverIndex] / max) * HEIGHT : 0) : null;
  const hoverTargetY = hoverIndex !== null ? HEIGHT - (max > 0 ? (target[hoverIndex] / max) * HEIGHT : 0) : null;
  const tooltipLeftPct = hoverPct !== null ? Math.min(Math.max(hoverPct, 10), 90) : null;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: revenueColor }} />
            Revenue {onPace ? "(on pace)" : "(behind pace)"}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-0.5 w-4 rounded-full border-t-2 border-dashed border-muted-foreground/50" />
            Target
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Monthly target:
          {editingTarget ? (
            <>
              <input
                autoFocus
                type="number"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveTarget()}
                className="h-6 w-28 rounded border border-border bg-background px-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button onClick={saveTarget} className="text-primary">
                <Check className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">{formatCompact(monthlyTarget)}</span>
              <button
                onClick={() => {
                  setTargetInput(String(monthlyTarget));
                  setEditingTarget(true);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex text-xs text-muted-foreground">
        <div className="flex w-14 flex-col justify-between py-1 text-right">
          {yLabels.map((label, i) => (
            <span key={i}>{formatCompact(label)}</span>
          ))}
        </div>
        <div
          ref={chartAreaRef}
          className="relative flex-1"
          onMouseMove={handleChartHover}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            className="h-64 w-full overflow-visible"
          >
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={revenueColor} stopOpacity="0.18" />
                <stop offset="100%" stopColor={revenueColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            {yLabels.map((label, i) => {
              const y = HEIGHT - (max > 0 ? (label / max) * HEIGHT : 0);
              return (
                <line
                  key={i}
                  x1={0}
                  x2={WIDTH}
                  y1={y}
                  y2={y}
                  stroke="#e1e0d9"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
              );
            })}
            <path d={areaPath} fill="url(#revenueFill)" stroke="none" />
            <path
              d={targetPath}
              fill="none"
              stroke="#898781"
              strokeWidth={1.5}
              strokeDasharray="6 5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d={actualPath}
              fill="none"
              stroke={revenueColor}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {hoverX !== null && (
              <g>
                <line
                  x1={hoverX}
                  x2={hoverX}
                  y1={0}
                  y2={HEIGHT}
                  stroke="#a3a29b"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                <circle cx={hoverX} cy={hoverTargetY ?? 0} r={4} fill="#898781" stroke="var(--card)" strokeWidth={1.5} />
                <circle cx={hoverX} cy={hoverActualY ?? 0} r={4} fill={revenueColor} stroke="var(--card)" strokeWidth={1.5} />
              </g>
            )}
          </svg>
          {hoverIndex !== null && tooltipLeftPct !== null && (
            <div
              className="pointer-events-none absolute top-2 z-10 w-max max-w-[200px] -translate-x-1/2 rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md"
              style={{ left: `${tooltipLeftPct}%` }}
            >
              <div className="mb-1.5 font-medium text-foreground">{labels[hoverIndex]}</div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full" style={{ backgroundColor: `${revenueColor}1A` }}>
                  <DollarSign className="h-2.5 w-2.5" style={{ color: revenueColor }} />
                </span>
                <span className="text-muted-foreground">Revenue:</span>
                <span className="font-medium text-foreground">{formatCurrency(Math.round(actual[hoverIndex]))}</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-muted">
                  <Target className="h-2.5 w-2.5 text-muted-foreground" />
                </span>
                <span className="text-muted-foreground">Target:</span>
                <span className="font-medium text-foreground">{formatCurrency(Math.round(target[hoverIndex]))}</span>
              </div>
            </div>
          )}
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            {visibleLabels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
