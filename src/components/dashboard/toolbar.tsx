"use client";

import { Download, MoreHorizontal } from "lucide-react";
import { PeriodSelect } from "@/components/shared/period-select";
import { useAppointments } from "@/lib/appointments-context";
import { formatCurrency } from "@/lib/format";
import { isWithinDashboardRange, type DashboardRange } from "@/lib/dashboard-range";

function buildSubtitle(daysLeft: number, gap: number, perDay: number) {
  const daysText = `There ${daysLeft === 1 ? "is" : "are"} ${daysLeft} day${daysLeft === 1 ? "" : "s"} left in the month.`;

  if (gap <= 0) {
    return `${daysText} You've already surpassed your monthly objective by ${formatCurrency(Math.abs(gap))} — great work!`;
  }

  return `${daysText} You are ${formatCurrency(gap)} from your monthly objective. You should generate ${formatCurrency(Math.ceil(perDay))} per day to reach your goal.`;
}

export function DashboardToolbar({
  value,
  onChange,
}: {
  value: DashboardRange;
  onChange: (range: DashboardRange) => void;
}) {
  const { appointments, monthlyTarget } = useAppointments();

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - today.getDate() + 1;

  const currentMonthRevenue = appointments
    .filter((a) => a.status === "Completed" && isWithinDashboardRange(a.appointmentDate, "current-month"))
    .reduce((sum, a) => sum + a.netRevenue, 0);

  const gap = monthlyTarget - currentMonthRevenue;
  const perDay = gap > 0 ? gap / Math.max(daysLeft, 1) : 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Welcome back, Selvia Clínica
        </h1>
        <p className="text-sm text-muted-foreground">{buildSubtitle(daysLeft, gap, perDay)}</p>
      </div>

      <div className="flex items-center gap-2">
        <PeriodSelect value={value} onChange={onChange} />
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
