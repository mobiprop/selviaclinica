export type AppointmentStatus = "Scheduled" | "Completed" | "Returned";

export type PatientSource = "Marketing" | "Website" | "Instagram" | "Referral" | "Email" | "Social";

export type PaymentMethod = "Cash" | "Transfer";

export type Appointment = {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  appointmentDate: string;
  treatment: string;
  price: number;
  reservation: number;
  paymentMethod?: PaymentMethod;
  /** The treating doctor's cut of `price`, as a 0-100 percentage — drives `netIncome`. Undefined for older appointments recorded before this split was tracked. */
  doctorPercentage?: number;
  /**
   * What the clinic actually nets from this appointment after the
   * professional's cut ("Ingreso Selvia" in the cash-flow sheets) — not
   * the same as `price`, which is what the client pays. Computed as
   * `price * (1 - doctorPercentage / 100)`; falls back to `price` when
   * `doctorPercentage` is unset (no split recorded). Drives all revenue
   * stats.
   */
  netIncome: number;
  status: AppointmentStatus;
  source: PatientSource;
  doctor: string;
  notes?: string;
};
