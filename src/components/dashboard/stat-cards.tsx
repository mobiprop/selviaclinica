import {
  DollarSign,
  ShoppingCart,
  CreditCard,
  Filter,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Stat = {
  label: string;
  icon: LucideIcon;
  value: string;
  delta: string;
  positive: boolean;
};

const stats: Stat[] = [
  { label: "Revenue", icon: DollarSign, value: "$622K", delta: "1.9%", positive: true },
  { label: "Orders", icon: ShoppingCart, value: "5.14K", delta: "46.2%", positive: true },
  { label: "Avg. order value", icon: CreditCard, value: "$121.00", delta: "30.3%", positive: false },
  { label: "Conversion rate", icon: Filter, value: "2.93%", delta: "21.7%", positive: false },
];

export function DashboardStatCards() {
  return (
    <div className="grid grid-cols-1 divide-y divide-border rounded-xl border border-border bg-card shadow-sm sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <stat.icon className="h-4 w-4" />
            {stat.label}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-semibold tracking-tight text-foreground">
              {stat.value}
            </span>
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                stat.positive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {stat.positive ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              {stat.delta}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
