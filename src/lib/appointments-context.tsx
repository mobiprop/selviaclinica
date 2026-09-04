"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Appointment } from "@/types/patient";
import { SEED_APPOINTMENTS } from "@/data/seed-appointments";

type AppointmentsContextValue = {
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
};

const AppointmentsContext = createContext<AppointmentsContextValue | null>(null);

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(SEED_APPOINTMENTS);

  function addAppointment(appointment: Appointment) {
    setAppointments((prev) => [appointment, ...prev]);
  }

  function updateAppointment(id: string, patch: Partial<Appointment>) {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  return (
    <AppointmentsContext.Provider value={{ appointments, addAppointment, updateAppointment }}>
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const ctx = useContext(AppointmentsContext);
  if (!ctx) {
    throw new Error("useAppointments must be used within an AppointmentsProvider");
  }
  return ctx;
}
