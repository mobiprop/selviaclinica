import { getValidGoogleAccessToken } from "@/lib/integrations/google-token";

const CALENDAR_API = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

export type CalendarEvent = {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  htmlLink?: string;
};

type EventInput = {
  summary: string;
  description?: string;
  start: string;
  end: string;
};

function toGoogleEvent(input: EventInput) {
  return {
    summary: input.summary,
    description: input.description || undefined,
    start: { dateTime: input.start },
    end: { dateTime: input.end },
  };
}

function fromGoogleEvent(raw: {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  htmlLink?: string;
}): CalendarEvent {
  return {
    id: raw.id,
    summary: raw.summary || "(No title)",
    description: raw.description,
    start: raw.start?.dateTime ?? raw.start?.date ?? "",
    end: raw.end?.dateTime ?? raw.end?.date ?? "",
    htmlLink: raw.htmlLink,
  };
}

async function googleFetch(url: string, init?: RequestInit) {
  const accessToken = await getValidGoogleAccessToken("google-calendar");
  const res = await fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
  });
  return res;
}

export async function listCalendarEvents(timeMin: string, timeMax: string): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "100",
  });
  const res = await googleFetch(`${CALENDAR_API}?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Failed to load Google Calendar events");
  return (data.items ?? []).map(fromGoogleEvent);
}

export async function createCalendarEvent(input: EventInput): Promise<CalendarEvent> {
  const res = await googleFetch(CALENDAR_API, {
    method: "POST",
    body: JSON.stringify(toGoogleEvent(input)),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Failed to create event");
  return fromGoogleEvent(data);
}

export async function updateCalendarEvent(eventId: string, input: EventInput): Promise<CalendarEvent> {
  const res = await googleFetch(`${CALENDAR_API}/${encodeURIComponent(eventId)}`, {
    method: "PATCH",
    body: JSON.stringify(toGoogleEvent(input)),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Failed to update event");
  return fromGoogleEvent(data);
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const res = await googleFetch(`${CALENDAR_API}/${encodeURIComponent(eventId)}`, { method: "DELETE" });
  if (!res.ok && res.status !== 410) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error?.message ?? "Failed to delete event");
  }
}
