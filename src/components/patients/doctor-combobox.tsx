"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { DOCTORS } from "@/data/doctors";

type DoctorComboboxProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DoctorCombobox({ value, onChange }: DoctorComboboxProps) {
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

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase();
    return query ? DOCTORS.filter((d) => d.toLowerCase().includes(query)) : DOCTORS;
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
          placeholder="Type or select a doctor..."
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
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md">
          {filtered.length === 0 && (
            <div className="px-2 py-3 text-center text-sm text-muted-foreground">
              No matches — you can use a custom name.
            </div>
          )}
          {filtered.map((doctor) => (
            <button
              type="button"
              key={doctor}
              onClick={() => {
                onChange(doctor);
                setOpen(false);
              }}
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm text-foreground hover:bg-accent"
            >
              {doctor}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
