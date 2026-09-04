"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Clock,
  Undo2,
  Megaphone,
  Globe,
  AtSign,
  Users2,
  Mail,
  Share2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TreatmentCombobox } from "@/components/patients/treatment-combobox";
import type { Appointment, AppointmentStatus, PatientSource } from "@/types/patient";

const SOURCES: { value: PatientSource; icon: LucideIcon }[] = [
  { value: "Marketing", icon: Megaphone },
  { value: "Website", icon: Globe },
  { value: "Instagram", icon: AtSign },
  { value: "Referral", icon: Users2 },
  { value: "Email", icon: Mail },
  { value: "Social", icon: Share2 },
];

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  appointmentDate: string;
  treatment: string;
  price: string;
  reservation: string;
  status: AppointmentStatus;
  source: PatientSource;
};

const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  appointmentDate: "",
  treatment: "",
  price: "",
  reservation: "",
  status: "Scheduled",
  source: "Website",
};

function toFormState(appointment: Appointment): FormState {
  return {
    firstName: appointment.firstName,
    lastName: appointment.lastName,
    phone: appointment.phone ?? "",
    email: appointment.email ?? "",
    appointmentDate: appointment.appointmentDate,
    treatment: appointment.treatment,
    price: String(appointment.price),
    reservation: String(appointment.reservation),
    status: appointment.status,
    source: appointment.source,
  };
}

type AppointmentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: Appointment | null;
  onSubmit: (appointment: Appointment) => void;
};

export function AppointmentFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: AppointmentFormDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const isEditing = initialData !== null;

  useEffect(() => {
    if (open) {
      setForm(initialData ? toFormState(initialData) : EMPTY_FORM);
    }
  }, [open, initialData]);

  const isValid =
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.appointmentDate !== "" &&
    form.treatment.trim() !== "" &&
    form.price !== "" &&
    Number(form.price) >= 0;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    onSubmit({
      id: initialData?.id ?? crypto.randomUUID(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      appointmentDate: form.appointmentDate,
      treatment: form.treatment.trim(),
      price: Number(form.price),
      reservation: form.reservation === "" ? 0 : Number(form.reservation),
      status: form.status,
      source: form.source,
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-lg">
        <form onSubmit={handleSubmit} className="contents">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Appointment" : "Add Appointment"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update this patient's appointment and reservation."
                : "Create a new patient appointment and reservation."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                placeholder="Jane"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                placeholder="Doe"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appointmentDate">Appointment date</Label>
              <Input
                id="appointmentDate"
                type="date"
                value={form.appointmentDate}
                onChange={(e) => update("appointmentDate", e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v as AppointmentStatus)}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">
                    <Clock className="h-3.5 w-3.5" />
                    Scheduled
                  </SelectItem>
                  <SelectItem value="Completed">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Completed
                  </SelectItem>
                  <SelectItem value="Returned">
                    <Undo2 className="h-3.5 w-3.5" />
                    Returned
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="source">Source</Label>
              <Select value={form.source} onValueChange={(v) => update("source", v as PatientSource)}>
                <SelectTrigger id="source" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map(({ value, icon: Icon }) => (
                    <SelectItem key={value} value={value}>
                      <Icon className="h-3.5 w-3.5" />
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="treatment">Type of treatment</Label>
              <TreatmentCombobox
                value={form.treatment}
                onChange={(value) => update("treatment", value)}
                onSelectTreatment={(t) => {
                  update("treatment", t.name);
                  if (t.price != null) update("price", String(t.price));
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price">Price to pay</Label>
              <Input
                id="price"
                type="number"
                min={0}
                inputMode="numeric"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reservation">Reservation amount</Label>
              <Input
                id="reservation"
                type="number"
                min={0}
                inputMode="numeric"
                value={form.reservation}
                onChange={(e) => update("reservation", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!isValid}>
              {isEditing ? "Save Changes" : "Save Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
