export type AppointmentStatus = "Scheduled" | "Completed" | "Returned";

export type PatientSource = "Marketing" | "Website" | "Instagram" | "Referral" | "Email" | "Social";

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
  /**
   * What the clinic actually nets from this appointment after the
   * professional's cut ("Ingreso Selvia" in the cash-flow sheets) — not
   * the same as `price`, which is what the client pays. Drives all
   * revenue stats; defaults to `price` for appointments where no
   * professional split was recorded.
   */
  netRevenue: number;
  status: AppointmentStatus;
  source: PatientSource;
  doctor: string;
  notes?: string;
};
