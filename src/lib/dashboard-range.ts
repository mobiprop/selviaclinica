export type DashboardRange = "7d" | "current-month" | "3m" | "6m";

export const DASHBOARD_RANGE_OPTIONS: { value: DashboardRange; label: string }[] = [
  { value: "7d", label: "7 Days" },
  { value: "current-month", label: "Current Month" },
  { value: "3m", label: "3 Months" },
  { value: "6m", label: "6 Months" },
];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** The first day of the window a range covers, inclusive, ending today. */
export function rangeStart(range: DashboardRange, today = new Date()): Date {
  const start = startOfDay(today);
  switch (range) {
    case "7d":
      start.setDate(start.getDate() - 6);
      return start;
    case "current-month":
      return new Date(today.getFullYear(), today.getMonth(), 1);
    case "3m":
      start.setDate(start.getDate() - 89);
      return start;
    case "6m":
      start.setDate(start.getDate() - 179);
      return start;
  }
}

export function isWithinDashboardRange(dateStr: string, range: DashboardRange, today = new Date()): boolean {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const start = rangeStart(range, today);
  const end = startOfDay(today);
  return date >= start && date <= end;
}

/** The equal-length window immediately before the current one, for period-over-period deltas. */
export function previousRangeWindow(range: DashboardRange, today = new Date()): { start: Date; end: Date } {
  const start = rangeStart(range, today);
  const end = startOfDay(today);
  const spanMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000);
  const prevStart = new Date(prevEnd.getTime() - spanMs);
  return { start: prevStart, end: prevEnd };
}

export function isWithinWindow(dateStr: string, window: { start: Date; end: Date }): boolean {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  return date >= window.start && date <= window.end;
}
