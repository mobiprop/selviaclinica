"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Appointment } from "@/types/patient";
import { SEED_APPOINTMENTS } from "@/data/seed-appointments";

type AppointmentsContextValue = {
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  monthlyTarget: number;
  setMonthlyTarget: (value: number) => void;
};

const AppointmentsContext = createContext<AppointmentsContextValue | null>(null);

const DEFAULT_MONTHLY_TARGET = 2000000;
const MONTHLY_TARGET_STORAGE_KEY = "selvia.monthlyTarget";

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(SEED_APPOINTMENTS);
  // Starts at the default on every render (server and first client render must
  // match), then hydrates from localStorage right after mount — otherwise an
  // edited target silently reverts on every page reload since nothing else
  // persists it yet (full persistence is pending the Supabase migration).
  const [monthlyTarget, setMonthlyTargetState] = useState<number>(DEFAULT_MONTHLY_TARGET);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(MONTHLY_TARGET_STORAGE_KEY);
      const parsed = stored ? Number(stored) : NaN;
      if (!Number.isNaN(parsed) && parsed > 0) setMonthlyTargetState(parsed);
    } catch {
      // localStorage unavailable (private browsing, etc.) — fall back to default.
    }
  }, []);

  function setMonthlyTarget(value: number) {
    setMonthlyTargetState(value);
    try {
      window.localStorage.setItem(MONTHLY_TARGET_STORAGE_KEY, String(value));
    } catch {
      // Ignore write failures — the in-memory value still updates for this session.
    }
  }

  function addAppointment(appointment: Appointment) {
    setAppointments((prev) => [appointment, ...prev]);
  }

  function updateAppointment(id: string, patch: Partial<Appointment>) {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  return (
    <AppointmentsContext.Provider
      value={{ appointments, addAppointment, updateAppointment, monthlyTarget, setMonthlyTarget }}
    >
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
