"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, Bell, Contact, Package } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppointments } from "@/lib/appointments-context";
import { useSupplies } from "@/lib/supplies-context";
import { formatDate } from "@/lib/format";

const MAX_RESULTS = 6;

type SearchResult =
  | { kind: "patient"; id: string; title: string; subtitle: string }
  | { kind: "supply"; id: string; title: string; subtitle: string };

export function DashboardTopbar() {
  const { appointments } = useAppointments();
  const { supplies } = useSupplies();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Searches patients and supplies together, across every period — this is a
  // global lookup, not scoped to whichever range the current page has selected.
  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const patientResults: SearchResult[] = appointments
      .filter((a) =>
        `${a.firstName} ${a.lastName} ${a.email ?? ""} ${a.phone ?? ""} ${a.treatment}`
          .toLowerCase()
          .includes(q)
      )
      .map((a) => ({
        kind: "patient" as const,
        id: a.id,
        title: `${a.firstName} ${a.lastName}`,
        subtitle: `${a.treatment} · ${formatDate(a.appointmentDate)}`,
      }));

    const supplyResults: SearchResult[] = supplies
      .filter((s) => `${s.name} ${s.unit}`.toLowerCase().includes(q))
      .map((s) => ({
        kind: "supply" as const,
        id: s.id,
        title: s.name,
        subtitle: `${s.unit} · ${s.usage} · ${s.currency}`,
      }));

    // Cap each category before combining, so a query that matches many
    // patients (e.g. a common treatment name) can't crowd supply matches
    // out of the list entirely, and vice versa.
    const half = Math.ceil(MAX_RESULTS / 2);
    const patientSlice = patientResults.slice(0, half);
    const supplySlice = supplyResults.slice(0, MAX_RESULTS - patientSlice.length);
    return [...patientSlice, ...supplySlice].slice(0, MAX_RESULTS);
  }, [appointments, supplies, query]);

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
                No results found.
              </div>
            ) : (
              <ul className="max-h-80 overflow-y-auto py-1">
                {results.map((r) => (
                  <li key={`${r.kind}-${r.id}`}>
                    <Link
                      href={r.kind === "patient" ? `/patients?edit=${r.id}` : `/insumos?edit=${r.id}`}
                      className="flex items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-accent"
                      onClick={() => setQuery("")}
                    >
                      {r.kind === "patient" ? (
                        <Contact className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-foreground">{r.title}</div>
                        <div className="truncate text-xs text-muted-foreground">{r.subtitle}</div>
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
