"use client";

import { DollarSign, Users, CreditCard, Filter, ArrowUp, ArrowDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { IconBadge, type IconBadgeColor } from "@/components/ui/icon-badge";
import { useAppointments } from "@/lib/appointments-context";
import { formatCurrency } from "@/lib/format";
import { isWithinDashboardRange, isWithinWindow, type DashboardRange } from "@/lib/dashboard-range";

type Stat = {
  label: string;
  icon: LucideIcon;
  color: IconBadgeColor;
  value: string;
  delta: number | null;
};

function percentDelta(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

export function DashboardStatCards({ range }: { range: DashboardRange }) {
  const { appointments } = useAppointments();

  const current = appointments.filter((a) => isWithinDashboardRange(a.appointmentDate, range));

  // Every card's delta compares against last calendar month specifically —
  // not the previous window of whatever length the selected range happens to
  // be — so the comparison basis stays fixed regardless of which period the
  // dashboard is showing.
  const today = new Date();
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  const lastMonth = appointments.filter((a) =>
    isWithinWindow(a.appointmentDate, { start: lastMonthStart, end: lastMonthEnd })
  );

  const completedNow = current.filter((a) => a.status === "Completed");
  const completedLastMonth = lastMonth.filter((a) => a.status === "Completed");

  const revenueNow = completedNow.reduce((sum, a) => sum + a.netRevenue, 0);
  const revenueLastMonth = completedLastMonth.reduce((sum, a) => sum + a.netRevenue, 0);

  const patientsNow = completedNow.length;
  const patientsLastMonth = completedLastMonth.length;

  // Margin = how much of what the patient paid the clinic actually keeps as
  // net income, averaged per completed appointment (netRevenue / price).
  const billableNow = completedNow.filter((a) => a.price > 0);
  const billableLastMonth = completedLastMonth.filter((a) => a.price > 0);
  const marginNow =
    billableNow.length > 0
      ? (billableNow.reduce((sum, a) => sum + a.netRevenue / a.price, 0) / billableNow.length) * 100
      : 0;
  const marginLastMonth =
    billableLastMonth.length > 0
      ? (billableLastMonth.reduce((sum, a) => sum + a.netRevenue / a.price, 0) / billableLastMonth.length) * 100
      : 0;

  // Conversion rate = of every appointment booked in the period (any status),
  // how many actually completed.
  const conversionNow = current.length > 0 ? (completedNow.length / current.length) * 100 : 0;
  const conversionLastMonth =
    lastMonth.length > 0 ? (completedLastMonth.length / lastMonth.length) * 100 : 0;

  const stats: Stat[] = [
    {
      label: "Net Revenue",
      icon: DollarSign,
      color: "green",
      value: formatCurrency(revenueNow),
      delta: percentDelta(revenueNow, revenueLastMonth),
    },
    {
      label: "Patients",
      icon: Users,
      color: "blue",
      value: String(patientsNow),
      delta: percentDelta(patientsNow, patientsLastMonth),
    },
    {
      label: "Average Margin",
      icon: CreditCard,
      color: "violet",
      value: `${marginNow.toFixed(1)}%`,
      delta: percentDelta(marginNow, marginLastMonth),
    },
    {
      label: "Conversion rate",
      icon: Filter,
      color: "amber",
      value: `${conversionNow.toFixed(1)}%`,
      delta: percentDelta(conversionNow, conversionLastMonth),
    },
  ];

  return (
    <div className="grid grid-cols-1 divide-y divide-border rounded-xl border border-border bg-card shadow-sm sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
      {stats.map((stat) => {
        const positive = (stat.delta ?? 0) >= 0;
        return (
          <div key={stat.label} className="flex flex-col gap-4 p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconBadge icon={stat.icon} color={stat.color} size="sm" />
              {stat.label}
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </span>
              {stat.delta !== null && (
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                      positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                    }`}
                  >
                    {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {Math.abs(stat.delta).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground">from last month</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
