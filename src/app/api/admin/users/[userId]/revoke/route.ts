import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Permanently deletes the auth user (and, via FK cascade, their profiles /
 * integration_tokens / integration_connections rows) — not the same as
 * "deny", which just blocks access while keeping the account around.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Not authorized" }, { status: 403 });

  const { userId } = await params;
  if (userId === admin.id) {
    return Response.json({ error: "You can't revoke your own account" }, { status: 400 });
  }

  const service = createServiceRoleClient();

  const { data: target } = await service.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (target?.role === "admin") {
    return Response.json({ error: "Can't revoke another admin's account" }, { status: 400 });
  }

  const { error } = await service.auth.admin.deleteUser(userId);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
