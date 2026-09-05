"use client";

import { useMemo, useState } from "react";
import { Users, Search, Mail, Phone, Plus } from "lucide-react";
import { AppointmentFormDialog } from "@/components/patients/appointment-form-dialog";
import { AppointmentActionsMenu } from "@/components/patients/appointment-actions-menu";
import { StatusSelect } from "@/components/patients/status-select";
import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/icon-badge";
import { useAppointments } from "@/lib/appointments-context";
import type { Appointment } from "@/types/patient";
import { formatCurrency, formatDate, initials } from "@/lib/format";

const AVATAR_COLORS = [
  "bg-blue-50 text-blue-600",
  "bg-violet-50 text-violet-600",
  "bg-amber-50 text-amber-600",
  "bg-emerald-50 text-emerald-600",
  "bg-pink-50 text-pink-600",
  "bg-cyan-50 text-cyan-600",
  "bg-orange-50 text-orange-600",
  "bg-indigo-50 text-indigo-600",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[Math.abs(hash)];
}

export function PatientsTable({ appointments }: { appointments: Appointment[] }) {
  const { addAppointment, updateAppointment } = useAppointments();
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return appointments;
    return appointments.filter((a) =>
      `${a.firstName} ${a.lastName} ${a.treatment} ${a.email ?? ""} ${a.phone ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [appointments, query]);

  function openAddDialog() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEditDialog(appointment: Appointment) {
    setEditing(appointment);
    setDialogOpen(true);
  }

  function handleSubmit(appointment: Appointment) {
    if (editing) {
      updateAppointment(appointment.id, appointment);
    } else {
      addAppointment(appointment);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <IconBadge icon={Users} color="blue" size="sm" />
          Patients
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patients..."
              className="h-8 w-52 rounded-md border border-border bg-background pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4" />
            Add Appointment
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">Patient</th>
              <th className="px-3 py-3 font-medium">Contact</th>
              <th className="px-3 py-3 font-medium">Treatment</th>
              <th className="px-3 py-3 font-medium">Appointment</th>
              <th className="px-3 py-3 font-medium">Price</th>
              <th className="px-3 py-3 font-medium">Reservation</th>
              <th className="px-3 py-3 font-medium">Balance</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="w-10 px-3 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No patients found.
                </td>
              </tr>
            )}
            {filtered.map((a) => (
              <tr key={a.id} className="border-b border-border last:border-0 hover:bg-accent/40">
                <td className="whitespace-nowrap px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${avatarColor(
                        `${a.firstName} ${a.lastName}`
                      )}`}
                    >
                      {initials(a.firstName, a.lastName)}
                    </div>
                    <span className="font-medium text-foreground">
                      {a.firstName} {a.lastName}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                  {a.phone && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Phone className="h-3 w-3" />
                      {a.phone}
                    </div>
                  )}
                  {a.email && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Mail className="h-3 w-3" />
                      {a.email}
                    </div>
                  )}
                  {!a.phone && !a.email && "—"}
                </td>
                <td className="max-w-[220px] truncate px-3 py-3 text-muted-foreground" title={a.treatment}>
                  {a.treatment}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-foreground">
                  {formatDate(a.appointmentDate)}
                </td>
                <td className="whitespace-nowrap px-3 py-3 font-medium text-foreground">
                  {formatCurrency(a.price)}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-foreground">
                  {formatCurrency(a.reservation)}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-foreground">
                  {formatCurrency(a.price - a.reservation)}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <StatusSelect
                    value={a.status}
                    onChange={(status) => updateAppointment(a.id, { status })}
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right">
                  <AppointmentActionsMenu onEdit={() => openEditDialog(a)} />
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
        onSubmit={handleSubmit}
      />
    </div>
  );
}
