import type { Appointment } from "@/types/patient";

/**
 * Revenue buckets follow the appointment's current status, so moving a
 * record between statuses automatically moves it between buckets — a
 * Scheduled appointment counts as pipeline (expected) revenue, a Completed
 * one counts as realized revenue, and a Returned one counts toward neither.
 */
export function expectedRevenue(appointments: Appointment[]): number {
  return appointments
    .filter((a) => a.status === "Scheduled")
    .reduce((sum, a) => sum + a.netRevenue, 0);
}

export function completedPayments(appointments: Appointment[]): number {
  return appointments
    .filter((a) => a.status === "Completed")
    .reduce((sum, a) => sum + a.netRevenue, 0);
}

export function upcomingCount(appointments: Appointment[]): number {
  return appointments.filter((a) => a.status === "Scheduled").length;
}

export function completedCount(appointments: Appointment[]): number {
  return appointments.filter((a) => a.status === "Completed").length;
}
