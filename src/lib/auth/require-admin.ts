import { createServerSupabaseClient } from "@/lib/supabase/server";

/** Resolves the current session and confirms the signed-in profile has the admin role. Returns null if either check fails. */
export async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return null;

  return user;
}
