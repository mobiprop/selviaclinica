import { createServerSupabaseClient } from "@/lib/supabase/server";
import { listCalendarEvents, createCalendarEvent } from "@/lib/integrations/google-calendar";

async function requireUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });

  const url = new URL(request.url);
  const timeMin = url.searchParams.get("timeMin");
  const timeMax = url.searchParams.get("timeMax");
  if (!timeMin || !timeMax) {
    return Response.json({ error: "timeMin and timeMax are required" }, { status: 400 });
  }

  try {
    const events = await listCalendarEvents(timeMin, timeMax);
    return Response.json({ events });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load events";
    const notConnected = message.includes("isn't connected");
    return Response.json({ error: message }, { status: notConnected ? 409 : 502 });
  }
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.summary || !body?.start || !body?.end) {
    return Response.json({ error: "summary, start, and end are required" }, { status: 400 });
  }

  try {
    const event = await createCalendarEvent({
      summary: body.summary,
      description: body.description,
      start: body.start,
      end: body.end,
    });
    return Response.json({ event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create event";
    return Response.json({ error: message }, { status: 502 });
  }
}
