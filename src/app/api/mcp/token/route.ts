import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  // This returns the real MCP_API_KEY, so it must require a logged-in staff
  // session — it deliberately does NOT sit under /api/mcp's Bearer-key check
  // (that check is for MCP clients, not this browser-facing endpoint), and
  // /api/mcp/* is excluded from the middleware's cookie-auth redirect, so
  // this route must authenticate itself explicitly.
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const apiKey = process.env.MCP_API_KEY;
  if (!apiKey) {
    return Response.json({ configured: false });
  }
  return Response.json({ configured: true, apiKey, endpoint: "/api/mcp" });
}
