"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PanelLeft, LayoutGrid, Search, Bell, Contact } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppointments } from "@/lib/appointments-context";
import { formatDate } from "@/lib/format";

type DashboardTopbarProps = {
  title?: string;
  icon?: LucideIcon;
};

const MAX_RESULTS = 6;

export function DashboardTopbar({ title = "Dashboard", icon: Icon = LayoutGrid }: DashboardTopbarProps) {
  const { appointments } = useAppointments();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Searches across every appointment regardless of the dashboard's currently
  // selected period — this is a global patient lookup, not scoped to a range.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return appointments
      .filter((a) =>
        `${a.firstName} ${a.lastName} ${a.email ?? ""} ${a.phone ?? ""} ${a.treatment}`
          .toLowerCase()
          .includes(q)
      )
      .slice(0, MAX_RESULTS);
  }, [appointments, query]);

  function handleBlur() {
    blurTimeout.current = setTimeout(() => setFocused(false), 150);
  }

  function handleFocus() {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    setFocused(true);
  }

  const showDropdown = focused && query.trim().length > 0;

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
      <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
        <PanelLeft className="h-4 w-4" />
      </button>
      <div className="h-4 w-px bg-border" />
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {title}
      </div>

      <div className="relative hidden sm:block">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search..."
          className="h-8 w-64 rounded-md border border-border bg-background pl-8 pr-12 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {!query && (
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        )}

        {showDropdown && (
          <div className="absolute left-0 top-full z-20 mt-1.5 w-80 rounded-md border border-border bg-popover shadow-md">
            {results.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                No patients found.
              </div>
            ) : (
              <ul className="max-h-80 overflow-y-auto py-1">
                {results.map((a) => (
                  <li key={a.id}>
                    <Link
                      href="/patients"
                      className="flex items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-accent"
                      onClick={() => setQuery("")}
                    >
                      <Contact className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-foreground">
                          {a.firstName} {a.lastName}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {a.treatment} · {formatDate(a.appointmentDate)}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="relative rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>
        <Avatar className="h-7 w-7">
          <AvatarImage src="" alt="User" />
          <AvatarFallback className="bg-primary text-xs text-primary-foreground">
            MU
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
