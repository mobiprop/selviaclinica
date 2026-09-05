import { Users, CalendarClock, Wallet, TrendingUp } from "lucide-react";
import { IconBadge, type IconBadgeColor } from "@/components/ui/icon-badge";
import type { Appointment } from "@/types/patient";
import { formatCurrency } from "@/lib/format";
import { expectedRevenue, completedPayments, upcomingCount } from "@/lib/metrics";

export function PatientsStats({ appointments }: { appointments: Appointment[] }) {
  const stats: { label: string; icon: typeof Users; color: IconBadgeColor; value: string }[] = [
    { label: "Total Patients", icon: Users, color: "blue", value: String(appointments.length) },
    {
      label: "Upcoming Appointments",
      icon: CalendarClock,
      color: "amber",
      value: String(upcomingCount(appointments)),
    },
    {
      label: "Net Revenue",
      icon: Wallet,
      color: "green",
      value: formatCurrency(completedPayments(appointments)),
    },
    {
      label: "Forecast",
      icon: TrendingUp,
      color: "violet",
      value: formatCurrency(expectedRevenue(appointments)),
    },
  ];

  return (
    <div className="grid grid-cols-1 divide-y divide-border rounded-xl border border-border bg-card shadow-sm sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconBadge icon={stat.icon} color={stat.color} size="sm" />
            {stat.label}
          </div>
          <span className="text-2xl font-semibold tracking-tight text-foreground">
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
