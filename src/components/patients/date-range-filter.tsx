"use client";

import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DATE_RANGE_OPTIONS, type DateRangeFilter } from "@/lib/date-range";

export function DateRangeFilterSelect({
  value,
  onChange,
}: {
  value: DateRangeFilter;
  onChange: (value: DateRangeFilter) => void;
}) {
  const selected = DATE_RANGE_OPTIONS.find((option) => option.value === value);

  return (
    <Select value={value} onValueChange={(v) => onChange(v as DateRangeFilter)}>
      <SelectTrigger className="gap-2">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <SelectValue>{selected?.label}</SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {DATE_RANGE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
