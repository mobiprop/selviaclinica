import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Not authorized" }, { status: 403 });

  const service = createServiceRoleClient();

  const [{ data: authData, error: authError }, { data: profiles, error: profilesError }] = await Promise.all([
    service.auth.admin.listUsers({ perPage: 200 }),
    service.from("profiles").select("id, full_name, avatar_url, role, status"),
  ]);
  if (authError) return Response.json({ error: authError.message }, { status: 500 });
  if (profilesError) return Response.json({ error: profilesError.message }, { status: 500 });

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  const users = authData.users.map((u) => {
    const profile = profileById.get(u.id);
    return {
      id: u.id,
      email: u.email ?? "",
      fullName: profile?.full_name ?? "",
      avatarUrl: profile?.avatar_url ?? null,
      role: profile?.role ?? "staff",
      status: profile?.status ?? "pending",
      createdAt: u.created_at,
    };
  });

  return Response.json({ users });
}
