import { Package, Banknote, DollarSign, CircleCheck } from "lucide-react";
import { IconBadge, type IconBadgeColor } from "@/components/ui/icon-badge";
import type { Supply } from "@/types/supply";

export function SuppliesStats({ supplies }: { supplies: Supply[] }) {
  const arsCount = supplies.filter((s) => s.currency === "ARS").length;
  const usdCount = supplies.filter((s) => s.currency === "USD").length;
  const exactoCount = supplies.filter((s) => s.usage === "Exacto").length;

  const stats: { label: string; icon: typeof Package; color: IconBadgeColor; value: string }[] = [
    { label: "Total Supplies", icon: Package, color: "blue", value: String(supplies.length) },
    { label: "ARS Supplies", icon: Banknote, color: "green", value: String(arsCount) },
    { label: "USD Supplies", icon: DollarSign, color: "cyan", value: String(usdCount) },
    { label: "Exact Usage Tracking", icon: CircleCheck, color: "violet", value: String(exactoCount) },
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
