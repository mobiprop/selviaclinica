export type DateRangeFilter = "current-month" | "60" | "90" | "180";

export const DATE_RANGE_OPTIONS: { value: DateRangeFilter; label: string }[] = [
  { value: "current-month", label: "Current Month" },
  { value: "60", label: "Last 60 Days" },
  { value: "90", label: "Last 90 Days" },
  { value: "180", label: "Last 180 Days" },
];

/**
 * Appointments can be booked in the future or already in the past, so "last N
 * days" is treated as a window of N days on either side of today rather than
 * a strictly backward-looking range — otherwise upcoming appointments would
 * vanish from every filter except "Current Month".
 */
export function isWithinDateRange(dateStr: string, filter: DateRangeFilter, today = new Date()): boolean {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;

  if (filter === "current-month") {
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
  }

  const days = Number(filter);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.abs(date.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}
