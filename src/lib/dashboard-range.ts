export type DashboardRange =
  | "all-time"
  | "current-month"
  | "days-7"
  | "days-60"
  | "days-180"
  | `month-${number}`;

export const QUICK_RANGE_OPTIONS: { value: DashboardRange; label: string }[] = [
  { value: "all-time", label: "All Time" },
  { value: "current-month", label: "Current Month" },
  { value: "days-7", label: "Last 7 Days" },
  { value: "days-60", label: "Last 60 Days" },
  { value: "days-180", label: "Last 180 Days" },
];

const EARLIEST_DATE = new Date(2000, 0, 1);

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function monthOptions(today = new Date()): { value: DashboardRange; label: string }[] {
  const year = today.getFullYear();
  return MONTH_NAMES.map((name, i) => ({ value: `month-${i}` as DashboardRange, label: `${name} ${year}` }));
}

export function rangeLabel(range: DashboardRange, today = new Date()): string {
  const quick = QUICK_RANGE_OPTIONS.find((o) => o.value === range);
  if (quick) return quick.label;
  const month = parseMonth(range);
  if (month !== null) return `${MONTH_NAMES[month]} ${today.getFullYear()}`;
  return range;
}

function parseMonth(range: DashboardRange): number | null {
  const match = /^month-(\d+)$/.exec(range);
  return match ? Number(match[1]) : null;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfMonth(year: number, month: number) {
  return new Date(year, month + 1, 0);
}

/** The first day a range covers, inclusive. */
export function rangeStart(range: DashboardRange, today = new Date()): Date {
  const month = parseMonth(range);
  if (month !== null) return new Date(today.getFullYear(), month, 1);

  if (range === "all-time") return EARLIEST_DATE;

  const start = startOfDay(today);
  if (range === "current-month") return new Date(today.getFullYear(), today.getMonth(), 1);
  if (range === "days-7") {
    start.setDate(start.getDate() - 6);
    return start;
  }
  if (range === "days-60") {
    start.setDate(start.getDate() - 59);
    return start;
  }
  start.setDate(start.getDate() - 179);
  return start;
}

/**
 * The last day a range covers, inclusive. A specific past month runs through
 * its own last day; the current month and rolling windows can't run past
 * today.
 */
export function rangeEnd(range: DashboardRange, today = new Date()): Date {
  const month = parseMonth(range);
  const todayStart = startOfDay(today);
  if (month !== null) {
    const monthEnd = endOfMonth(today.getFullYear(), month);
    return monthEnd < todayStart ? monthEnd : todayStart;
  }
  // "All Time" must also include future-dated (e.g. Scheduled) appointments,
  // not just everything up to today.
  if (range === "all-time") return new Date(2100, 0, 1);
  return todayStart;
}

export function isWithinDashboardRange(dateStr: string, range: DashboardRange, today = new Date()): boolean {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  return date >= rangeStart(range, today) && date <= rangeEnd(range, today);
}

/** The equal-length window immediately before the current one, for period-over-period deltas. */
export function previousRangeWindow(range: DashboardRange, today = new Date()): { start: Date; end: Date } {
  const month = parseMonth(range);
  if (month !== null) {
    const year = today.getFullYear();
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    return { start: new Date(prevYear, prevMonth, 1), end: endOfMonth(prevYear, prevMonth) };
  }

  if (range === "all-time") {
    // "All Time" has no prior period to compare against.
    return { start: new Date(1900, 0, 1), end: new Date(1900, 0, 2) };
  }

  const start = rangeStart(range, today);
  const end = rangeEnd(range, today);
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
