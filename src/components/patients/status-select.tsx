"use client";

import { CheckCircle2, Clock, Undo2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppointmentStatus } from "@/types/patient";

export const STATUS_STYLES: Record<AppointmentStatus, { icon: LucideIcon; className: string }> = {
  Completed: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700" },
  Scheduled: { icon: Clock, className: "bg-amber-50 text-amber-700" },
  Returned: { icon: Undo2, className: "bg-zinc-100 text-zinc-600" },
};

const STATUSES: AppointmentStatus[] = ["Scheduled", "Completed", "Returned"];

export function StatusSelect({
  value,
  onChange,
}: {
  value: AppointmentStatus;
  onChange: (value: AppointmentStatus) => void;
}) {
  const style = STATUS_STYLES[value];

  return (
    <Select value={value} onValueChange={(v) => onChange(v as AppointmentStatus)}>
      <SelectTrigger
        size="sm"
        className={`h-6 gap-1 border-none px-2 py-0 text-xs font-medium ${style.className}`}
      >
        <SelectValue>
          <style.icon className="h-3 w-3" />
          {value}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        {STATUSES.map((status) => {
          const s = STATUS_STYLES[status];
          return (
            <SelectItem key={status} value={status}>
              <s.icon className="h-3.5 w-3.5" />
              {status}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
