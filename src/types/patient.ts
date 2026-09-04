export type AppointmentStatus = "Scheduled" | "Completed" | "Returned";

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
  status: AppointmentStatus;
};
