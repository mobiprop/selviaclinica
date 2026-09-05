"use client";

import { CalendarRange } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUICK_RANGE_OPTIONS, monthOptions, rangeLabel, type DashboardRange } from "@/lib/dashboard-range";

export function PeriodSelect({
  value,
  onChange,
  className = "w-56",
}: {
  value: DashboardRange;
  onChange: (range: DashboardRange) => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as DashboardRange)}>
      <SelectTrigger className={`gap-2 ${className}`}>
        <CalendarRange className="h-3.5 w-3.5 text-muted-foreground" />
        <SelectValue>{rangeLabel(value)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Quick ranges</SelectLabel>
          {QUICK_RANGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Months</SelectLabel>
          {monthOptions().map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
