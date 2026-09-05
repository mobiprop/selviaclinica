"use client";

import { DollarSign, Users, CreditCard, Filter, ArrowUp, ArrowDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { IconBadge, type IconBadgeColor } from "@/components/ui/icon-badge";
import { useAppointments } from "@/lib/appointments-context";
import { formatCurrency } from "@/lib/format";
import {
  isWithinDashboardRange,
  isWithinWindow,
  previousRangeWindow,
  type DashboardRange,
} from "@/lib/dashboard-range";

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
  const isAllTime = range === "all-time";

  const current = appointments.filter((a) => isWithinDashboardRange(a.appointmentDate, range));
  const previousWindow = previousRangeWindow(range);
  const previous = isAllTime
    ? []
    : appointments.filter((a) => isWithinWindow(a.appointmentDate, previousWindow));

  const completedNow = current.filter((a) => a.status === "Completed");
  const completedPrev = previous.filter((a) => a.status === "Completed");

  const revenueNow = completedNow.reduce((sum, a) => sum + a.netRevenue, 0);
  const revenuePrev = completedPrev.reduce((sum, a) => sum + a.netRevenue, 0);

  const patientsNow = completedNow.length;
  const patientsPrev = completedPrev.length;

  const avgNow = patientsNow > 0 ? revenueNow / patientsNow : 0;
  const avgPrev = patientsPrev > 0 ? revenuePrev / patientsPrev : 0;

  // Margin = how much of what the patient paid the clinic actually keeps as
  // net income, averaged per completed appointment (netRevenue / price).
  const billableNow = completedNow.filter((a) => a.price > 0);
  const billablePrev = completedPrev.filter((a) => a.price > 0);
  const marginNow =
    billableNow.length > 0
      ? (billableNow.reduce((sum, a) => sum + a.netRevenue / a.price, 0) / billableNow.length) * 100
      : 0;
  const marginPrev =
    billablePrev.length > 0
      ? (billablePrev.reduce((sum, a) => sum + a.netRevenue / a.price, 0) / billablePrev.length) * 100
      : 0;

  const stats: Stat[] = [
    {
      label: "Average Net Revenue",
      icon: DollarSign,
      color: "green",
      value: formatCurrency(Math.round(avgNow)),
      delta: isAllTime ? null : percentDelta(avgNow, avgPrev),
    },
    {
      label: "Patients",
      icon: Users,
      color: "blue",
      value: String(patientsNow),
      delta: isAllTime ? null : percentDelta(patientsNow, patientsPrev),
    },
    {
      label: "Average Margin",
      icon: CreditCard,
      color: "violet",
      value: `${marginNow.toFixed(1)}%`,
      delta: isAllTime ? null : percentDelta(marginNow, marginPrev),
    },
    {
      label: "Conversion rate",
      icon: Filter,
      color: "amber",
      value: "2.93%",
      delta: isAllTime ? null : -21.7,
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
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </span>
              {stat.delta !== null && (
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                    positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                  }`}
                >
                  {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {Math.abs(stat.delta).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
