import { Users, CalendarClock, Wallet, TrendingUp } from "lucide-react";
import type { Appointment } from "@/types/patient";
import { formatCurrency } from "@/lib/format";

export function PatientsStats({ appointments }: { appointments: Appointment[] }) {
  const totalPatients = appointments.length;
  const upcoming = appointments.filter((a) => a.status === "Scheduled").length;
  const completedPayments = appointments.reduce((sum, a) => sum + a.reservation, 0);
  const expectedRevenue = appointments.reduce((sum, a) => sum + a.price, 0);

  const stats = [
    { label: "Total Patients", icon: Users, value: String(totalPatients) },
    { label: "Upcoming Appointments", icon: CalendarClock, value: String(upcoming) },
    { label: "Completed Payments", icon: Wallet, value: formatCurrency(completedPayments) },
    { label: "Expected Revenue", icon: TrendingUp, value: formatCurrency(expectedRevenue) },
  ];

  return (
    <div className="grid grid-cols-1 divide-y divide-border rounded-xl border border-border bg-card shadow-sm sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <stat.icon className="h-4 w-4" />
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
