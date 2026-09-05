import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Not authorized" }, { status: 403 });

  const { userId } = await params;
  const service = createServiceRoleClient();
  const { error } = await service.from("profiles").update({ status: "denied" }).eq("id", userId);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
