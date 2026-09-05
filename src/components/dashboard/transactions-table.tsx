"use client";

import { useMemo, useState } from "react";
import { Receipt, Search } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { AppointmentFormDialog } from "@/components/patients/appointment-form-dialog";
import { AppointmentActionsMenu } from "@/components/patients/appointment-actions-menu";
import { StatusSelect } from "@/components/patients/status-select";
import { useAppointments } from "@/lib/appointments-context";
import type { Appointment } from "@/types/patient";
import { formatCurrency, formatDate } from "@/lib/format";

function displayId(id: string) {
  return `#${id.slice(-5).toUpperCase().padStart(5, "0")}`;
}

export function TransactionsTable() {
  const { appointments, updateAppointment } = useAppointments();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const rows = useMemo(() => {
    const sorted = [...appointments].sort((a, b) => b.appointmentDate.localeCompare(a.appointmentDate));
    const q = query.trim().toLowerCase();
    const filtered = q
      ? sorted.filter((a) => `${a.firstName} ${a.lastName} ${a.treatment}`.toLowerCase().includes(q))
      : sorted;
    return filtered.slice(0, 8);
  }, [appointments, query]);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <IconBadge icon={Receipt} color="orange" size="sm" />
          Recent Transactions
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transactions..."
              className="h-8 w-52 rounded-md border border-border bg-background pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-3 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 font-medium">Treatment</th>
              <th className="px-3 py-3 font-medium">Date</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Total Revenue</th>
              <th className="w-10 px-3 py-3 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No transactions found.
                </td>
              </tr>
            )}
            {rows.map((a) => (
              <tr key={a.id} className="border-b border-border last:border-0 hover:bg-accent/40">
                <td className="whitespace-nowrap px-5 py-3 font-medium text-foreground">
                  {displayId(a.id)}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-foreground">
                  {a.firstName} {a.lastName}
                </td>
                <td className="max-w-[220px] truncate px-3 py-3 text-muted-foreground" title={a.treatment}>
                  {a.treatment}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-foreground">{formatDate(a.appointmentDate)}</td>
                <td className="whitespace-nowrap px-3 py-3">
                  <StatusSelect
                    value={a.status}
                    onChange={(status) => updateAppointment(a.id, { status })}
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-3 font-medium text-foreground">
                  {formatCurrency(a.netIncome)}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right">
                  <AppointmentActionsMenu
                    onEdit={() => {
                      setEditing(a);
                      setDialogOpen(true);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AppointmentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editing}
        onSubmit={(appointment) => updateAppointment(appointment.id, appointment)}
      />
    </div>
  );
}
