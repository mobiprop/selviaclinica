import type { LucideIcon } from "lucide-react";

const COLOR_MAP = {
  blue: "bg-blue-50 text-blue-600",
  violet: "bg-violet-50 text-violet-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  pink: "bg-pink-50 text-pink-600",
  cyan: "bg-cyan-50 text-cyan-600",
  orange: "bg-orange-50 text-orange-600",
  indigo: "bg-indigo-50 text-indigo-600",
  slate: "bg-slate-100 text-slate-500",
  brand: "bg-primary/10 text-primary",
} as const;

export type IconBadgeColor = keyof typeof COLOR_MAP;

export function IconBadge({
  icon: Icon,
  color = "brand",
  size = "md",
  className = "",
}: {
  icon: LucideIcon;
  color?: IconBadgeColor;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const box = { xs: "h-6 w-6", sm: "h-7 w-7", md: "h-9 w-9", lg: "h-11 w-11" }[size];
  const iconSize = { xs: "h-3 w-3", sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" }[size];
  const radius = size === "xs" || size === "sm" ? "rounded-md" : "rounded-lg";

  return (
    <div className={`flex ${box} shrink-0 items-center justify-center ${radius} ${COLOR_MAP[color]} ${className}`}>
      <Icon className={iconSize} />
    </div>
  );
}
