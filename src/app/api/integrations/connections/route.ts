import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Marks the MCP integration connected for the current user — MCP has no OAuth popup, so this is called directly once the client has confirmed /api/mcp/token is configured. */
export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });

  const { kind } = await request.json();
  if (kind !== "mcp") {
    return Response.json({ error: "Only the mcp connection can be set directly" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  const { error } = await admin.from("integration_connections").upsert({
    kind: "mcp",
    connected_by: user.id,
    connected_at: new Date().toISOString(),
  });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });

  const { kind } = await request.json();
  const admin = createServiceRoleClient();

  const { error: connectionError } = await admin.from("integration_connections").delete().eq("kind", kind);
  if (connectionError) return Response.json({ error: connectionError.message }, { status: 500 });

  if (kind !== "mcp") {
    await admin.from("integration_tokens").delete().eq("kind", kind);
  }

  return Response.json({ ok: true });
}
