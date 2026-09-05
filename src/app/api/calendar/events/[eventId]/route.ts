import { createServerSupabaseClient } from "@/lib/supabase/server";
import { updateCalendarEvent, deleteCalendarEvent } from "@/lib/integrations/google-calendar";

async function requireUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const user = await requireUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });

  const { eventId } = await params;
  const body = await request.json().catch(() => null);
  if (!body?.summary || !body?.start || !body?.end) {
    return Response.json({ error: "summary, start, and end are required" }, { status: 400 });
  }

  try {
    const event = await updateCalendarEvent(eventId, {
      summary: body.summary,
      description: body.description,
      start: body.start,
      end: body.end,
    });
    return Response.json({ event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update event";
    return Response.json({ error: message }, { status: 502 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const user = await requireUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });

  const { eventId } = await params;
  try {
    await deleteCalendarEvent(eventId);
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete event";
    return Response.json({ error: message }, { status: 502 });
  }
}
