"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import treatmentsData from "@/data/treatments.json";

type Treatment = { name: string; category: string; price: number | null };

const TREATMENTS = treatmentsData as Treatment[];

type TreatmentComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  onSelectTreatment: (treatment: Treatment) => void;
};

export function TreatmentCombobox({ value, onChange, onSelectTreatment }: TreatmentComboboxProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const grouped = useMemo(() => {
    const query = value.trim().toLowerCase();
    const filtered = query
      ? TREATMENTS.filter((t) => t.name.toLowerCase().includes(query))
      : TREATMENTS;

    const groups = new Map<string, Treatment[]>();
    for (const t of filtered) {
      const list = groups.get(t.category) ?? [];
      list.push(t);
      groups.set(t.category, list);
    }
    return Array.from(groups.entries());
  }, [value]);

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Type or select a treatment..."
          className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md">
          {grouped.length === 0 && (
            <div className="px-2 py-3 text-center text-sm text-muted-foreground">
              No matches — you can use your own custom treatment name.
            </div>
          )}
          {grouped.map(([category, items]) => (
            <div key={category} className="mb-1 last:mb-0">
              <div className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {category}
              </div>
              {items.map((t) => (
                <button
                  type="button"
                  key={t.name}
                  onClick={() => {
                    onSelectTreatment(t);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                >
                  <span className="truncate text-foreground">{t.name}</span>
                  {t.price != null && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      ${t.price.toLocaleString("es-AR")}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
