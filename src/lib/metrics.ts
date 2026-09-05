import type { Appointment } from "@/types/patient";

/**
 * Total billed price of appointments that haven't happened yet. Once an
 * appointment is Completed (or Returned) it's no longer "incoming", so it
 * drops out of this figure entirely.
 */
export function incomingRevenue(appointments: Appointment[]): number {
  return appointments
    .filter((a) => a.status === "Scheduled")
    .reduce((sum, a) => sum + a.price, 0);
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
