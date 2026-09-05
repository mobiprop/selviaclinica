"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { CalendarEvent } from "@/lib/integrations/google-calendar";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateInputValue(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeInputValue(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type FormState = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
};

function emptyForm(defaultDate: Date): FormState {
  const start = new Date(defaultDate);
  start.setMinutes(0, 0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return {
    title: "",
    date: toDateInputValue(start),
    startTime: toTimeInputValue(start),
    endTime: toTimeInputValue(end),
    description: "",
  };
}

function formFromEvent(event: CalendarEvent): FormState {
  const start = new Date(event.start);
  const end = new Date(event.end);
  return {
    title: event.summary,
    date: toDateInputValue(start),
    startTime: toTimeInputValue(start),
    endTime: toTimeInputValue(end),
    description: event.description ?? "",
  };
}

export function EventDialog({
  open,
  onOpenChange,
  initialData,
  defaultDate,
  onSaved,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: CalendarEvent | null;
  defaultDate: Date;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const isEditing = initialData !== null;
  const [form, setForm] = useState<FormState>(() => (initialData ? formFromEvent(initialData) : emptyForm(defaultDate)));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setForm(initialData ? formFromEvent(initialData) : emptyForm(defaultDate));
    setError(null);
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const isValid = form.title.trim() !== "" && form.date !== "" && form.startTime !== "" && form.endTime !== "";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setError(null);
    setSaving(true);
    try {
      const start = new Date(`${form.date}T${form.startTime}:00`).toISOString();
      const end = new Date(`${form.date}T${form.endTime}:00`).toISOString();
      const body = { summary: form.title.trim(), description: form.description.trim() || undefined, start, end };

      const res = await fetch(
        isEditing ? `/api/calendar/events/${encodeURIComponent(initialData!.id)}` : "/api/calendar/events",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save event");

      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initialData) return;
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/calendar/events/${encodeURIComponent(initialData.id)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete event");
      onDeleted();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit} className="contents">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Event" : "New Event"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Changes sync straight to Google Calendar." : "This will be created on your connected Google Calendar."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-title">Title</Label>
              <Input id="event-title" value={form.title} onChange={(e) => update("title", e.target.value)} required />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-date">Date</Label>
              <Input id="event-date" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-start">Start Time</Label>
                <Input
                  id="event-start"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => update("startTime", e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-end">End Time</Label>
                <Input
                  id="event-end"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => update("endTime", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                rows={3}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter className={isEditing ? "sm:justify-between" : undefined}>
            {isEditing && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting || saving}>
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
              <Button type="submit" disabled={!isValid || saving || deleting}>
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isEditing ? "Save Changes" : "Create Event"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
