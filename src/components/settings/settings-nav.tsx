"use client";

import { User, Lock, Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SettingsTab = "profile" | "security" | "preferences";

const ITEMS: { value: SettingsTab; label: string; icon: LucideIcon }[] = [
  { value: "profile", label: "Profile", icon: User },
  { value: "security", label: "Security", icon: Lock },
  { value: "preferences", label: "Preferences", icon: Globe },
];

export function SettingsNav({
  value,
  onChange,
}: {
  value: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}) {
  return (
    <nav className="flex w-full shrink-0 flex-row gap-1 overflow-x-auto rounded-xl border border-border bg-card p-2 shadow-sm md:w-56 md:flex-col md:overflow-visible">
      {ITEMS.map((item) => {
        const active = value === item.value;
        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={`flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors ${
              active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
