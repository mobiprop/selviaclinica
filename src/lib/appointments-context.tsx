"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Appointment } from "@/types/patient";
import { appointmentFromRow, appointmentToRow, type AppointmentRow } from "@/lib/supabase/mappers";

type AppointmentsContextValue = {
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  monthlyTarget: number;
  setMonthlyTarget: (value: number) => void;
};

const AppointmentsContext = createContext<AppointmentsContextValue | null>(null);

const DEFAULT_MONTHLY_TARGET = 2000000;
const MONTHLY_TARGET_KEY = "monthly_target";

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [monthlyTarget, setMonthlyTargetState] = useState<number>(DEFAULT_MONTHLY_TARGET);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      if (!configured) return;

      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const [{ data: rows, error: appointmentsError }, { data: settingsRow }] = await Promise.all([
          supabase.from("appointments").select("*"),
          supabase.from("app_settings").select("value").eq("key", MONTHLY_TARGET_KEY).maybeSingle(),
        ]);

        if (cancelled) return;

        if (appointmentsError) {
          console.error("Failed to load appointments", appointmentsError);
        } else if (rows) {
          setAppointments((rows as AppointmentRow[]).map(appointmentFromRow));
        }

        if (settingsRow?.value != null) {
          setMonthlyTargetState(Number(settingsRow.value));
        }
      } catch (err) {
        console.error("Supabase unavailable, appointments not loaded", err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function addAppointment(appointment: Appointment) {
    setAppointments((prev) => [appointment, ...prev]);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.from("appointments").insert(appointmentToRow(appointment));
      if (error) console.error("Failed to save appointment", error);
    } catch (err) {
      console.error("Supabase unavailable, appointment kept locally only", err);
    }
  }

  async function updateAppointment(id: string, patch: Partial<Appointment>) {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const current = appointments.find((a) => a.id === id);
      const merged = current ? { ...current, ...patch, id } : null;
      if (!merged) return;
      const row: Partial<ReturnType<typeof appointmentToRow>> = appointmentToRow(merged as Appointment);
      delete row.id;
      const { error } = await supabase.from("appointments").update(row).eq("id", id);
      if (error) console.error("Failed to update appointment", error);
    } catch (err) {
      console.error("Supabase unavailable, update kept locally only", err);
    }
  }

  async function setMonthlyTarget(value: number) {
    setMonthlyTargetState(value);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase
        .from("app_settings")
        .upsert({ key: MONTHLY_TARGET_KEY, value, updated_at: new Date().toISOString() });
      if (error) console.error("Failed to save monthly target", error);
    } catch (err) {
      console.error("Supabase unavailable, monthly target kept locally only", err);
    }
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
