import type { Appointment, AppointmentStatus, PatientSource } from "@/types/patient";
import type { Supply, SupplyCurrency, SupplyUsageType } from "@/types/supply";

export type AppointmentRow = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  appointment_date: string;
  treatment: string;
  price: number;
  reservation: number;
  net_revenue: number;
  status: string;
  source: string;
  doctor: string;
  notes: string | null;
};

export function appointmentFromRow(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    appointmentDate: row.appointment_date,
    treatment: row.treatment,
    price: Number(row.price),
    reservation: Number(row.reservation),
    netRevenue: Number(row.net_revenue),
    status: row.status as AppointmentStatus,
    source: row.source as PatientSource,
    doctor: row.doctor,
    notes: row.notes ?? undefined,
  };
}

export function appointmentToRow(appointment: Appointment): AppointmentRow {
  return {
    id: appointment.id,
    first_name: appointment.firstName,
    last_name: appointment.lastName,
    phone: appointment.phone ?? null,
    email: appointment.email ?? null,
    appointment_date: appointment.appointmentDate,
    treatment: appointment.treatment,
    price: appointment.price,
    reservation: appointment.reservation,
    net_revenue: appointment.netRevenue,
    status: appointment.status,
    source: appointment.source,
    doctor: appointment.doctor,
    notes: appointment.notes ?? null,
  };
}

export type SupplyRow = {
  id: string;
  name: string;
  unit: string;
  usage: string;
  currency: string;
};

export function supplyFromRow(row: SupplyRow): Supply {
  return {
    id: row.id,
    name: row.name,
    unit: row.unit,
    usage: row.usage as SupplyUsageType,
    currency: row.currency as SupplyCurrency,
  };
}

export function supplyToRow(supply: Supply): SupplyRow {
  return {
    id: supply.id,
    name: supply.name,
    unit: supply.unit,
    usage: supply.usage,
    currency: supply.currency,
  };
}
