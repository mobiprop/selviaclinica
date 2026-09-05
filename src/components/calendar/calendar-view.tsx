"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, AlertCircle, Loader2, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventDialog } from "@/components/calendar/event-dialog";
import type { CalendarEvent } from "@/lib/integrations/google-calendar";

const HOUR_HEIGHT = 48;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const EVENT_COLORS = ["#2563EB", "#059669", "#D97706", "#DC2626", "#7C3AED", "#0891B2"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfWeek(d: Date) {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function addDays(d: Date, days: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

function isAllDay(event: CalendarEvent) {
  return !event.start.includes("T");
}

export function CalendarView() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notConnected, setNotConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  async function fetchEventsFor(start: Date) {
    const timeMin = start.toISOString();
    const timeMax = addDays(start, 30).toISOString();
    const res = await fetch(`/api/calendar/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`);
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  }

  const applyFetchResult = useCallback((cancelled: boolean, result: Awaited<ReturnType<typeof fetchEventsFor>>) => {
    if (cancelled) return;
    const { ok, status, data } = result;
    if (status === 409) {
      setNotConnected(true);
    } else if (!ok) {
      setError(data.error ?? "Failed to load events");
    } else {
      setNotConnected(false);
      setError(null);
      setEvents(data.events ?? []);
    }
    setLoading(false);
  }, []);

  // Refetches the currently displayed week — called after creating, editing,
  // or deleting an event (from event handlers, so setting loading state here
  // directly is fine; it's the mount/weekStart effect below that has to defer
  // every state update until after the fetch resolves).
  async function loadEvents() {
    setLoading(true);
    const result = await fetchEventsFor(weekStart);
    applyFetchResult(false, result);
  }

  useEffect(() => {
    let cancelled = false;
    fetchEventsFor(weekStart).then(
      (result) => applyFetchResult(cancelled, result),
      (err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load events");
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [weekStart, applyFetchResult]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: HOUR_HEIGHT * 7 });
  }, [loading]);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();
  const todayKey = dateKey(today);

  const eventColor = new Map<string, string>();
  let colorIndex = 0;
  function colorFor(id: string) {
    if (!eventColor.has(id)) eventColor.set(id, EVENT_COLORS[colorIndex++ % EVENT_COLORS.length]);
    return eventColor.get(id)!;
  }

  function openNewEvent(date: Date) {
    setEditingEvent(null);
    setDefaultDate(date);
    setDialogOpen(true);
  }

  function openEditEvent(event: CalendarEvent) {
    setEditingEvent(event);
    setDialogOpen(true);
  }

  const upcoming = events
    .filter((e) => !isAllDay(e) && new Date(e.end) >= today)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 12);

  if (notConnected) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-sm rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
          <CalendarClock className="mx-auto mb-2 h-6 w-6 text-amber-700" />
          <div className="font-medium text-amber-900">Google Calendar isn&apos;t connected</div>
          <p className="mt-1.5 text-sm text-amber-800">
            Connect it from the Integrations page to see and manage events here.
          </p>
          <Link
            href="/integrations"
            className="mt-3 inline-block rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Go to Integrations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4 sm:p-6 lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">
              {weekStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h2>
            <button
              onClick={() => setWeekStart((w) => addDays(w, -7))}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setWeekStart((w) => addDays(w, 7))}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setWeekStart(startOfWeek(new Date()))}
              className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent"
            >
              Today
            </button>
          </div>
          <Button size="sm" onClick={() => openNewEvent(new Date())}>
            <Plus className="h-3.5 w-3.5" />
            New Event
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 border-b border-border bg-red-50 px-4 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-border text-center text-xs text-muted-foreground">
          <div />
          {days.map((d) => (
            <div key={dateKey(d)} className={`border-l border-border py-2 ${dateKey(d) === todayKey ? "bg-primary/5" : ""}`}>
              <div>{DAY_LABELS[d.getDay()]}</div>
              <div className={`text-sm font-semibold ${dateKey(d) === todayKey ? "text-primary" : "text-foreground"}`}>
                {d.getDate()}
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div ref={scrollRef} className="relative flex-1 overflow-y-auto" style={{ maxHeight: 600 }}>
            <div className="grid grid-cols-[48px_repeat(7,1fr)]">
              <div>
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} style={{ height: HOUR_HEIGHT }} className="border-b border-border pr-1.5 text-right text-[10px] text-muted-foreground">
                    {h === 0 ? "" : `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? "AM" : "PM"}`}
                  </div>
                ))}
              </div>
              {days.map((d) => {
                const key = dateKey(d);
                const dayEvents = events.filter((e) => !isAllDay(e) && dateKey(new Date(e.start)) === key);
                return (
                  <div
                    key={key}
                    className={`relative border-l border-border ${key === todayKey ? "bg-primary/5" : ""}`}
                    style={{ height: HOUR_HEIGHT * 24 }}
                    onDoubleClick={() => openNewEvent(d)}
                  >
                    {Array.from({ length: 24 }, (_, h) => (
                      <div key={h} style={{ height: HOUR_HEIGHT }} className="border-b border-border" />
                    ))}
                    {dayEvents.map((event) => {
                      const start = new Date(event.start);
                      const end = new Date(event.end);
                      const startMin = start.getHours() * 60 + start.getMinutes();
                      const endMin = Math.max(startMin + 15, end.getHours() * 60 + end.getMinutes());
                      const top = (startMin / 1440) * HOUR_HEIGHT * 24;
                      const height = ((endMin - startMin) / 1440) * HOUR_HEIGHT * 24;
                      const color = colorFor(event.id);
                      return (
                        <button
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditEvent(event);
                          }}
                          style={{
                            top,
                            height: Math.max(height, 18),
                            backgroundColor: `${color}1A`,
                            borderLeft: `2px solid ${color}`,
                            color,
                          }}
                          className="absolute right-0.5 left-0.5 overflow-hidden rounded-sm px-1 py-0.5 text-left text-[11px] font-medium"
                        >
                          <span className="truncate">{event.summary}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="w-full shrink-0 rounded-xl border border-border bg-card p-4 shadow-sm lg:w-72">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Upcoming Events</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming events in this range.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {upcoming.map((event) => (
              <li key={event.id}>
                <button
                  onClick={() => openEditEvent(event)}
                  className="w-full rounded-md border-l-2 pl-2.5 text-left hover:bg-accent/50"
                  style={{ borderColor: colorFor(event.id) }}
                >
                  <div className="truncate text-sm font-medium text-foreground">{event.summary}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.start).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingEvent}
        defaultDate={defaultDate}
        onSaved={loadEvents}
        onDeleted={loadEvents}
      />
    </div>
  );
}
