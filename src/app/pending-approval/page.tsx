"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, XCircle } from "lucide-react";
import { AuthLayout, AuthHeading, AuthIcon } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";

export default function PendingApprovalPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "denied" | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("status").eq("id", user.id).maybeSingle();
      if (!cancelled) setStatus(profile?.status === "denied" ? "denied" : "pending");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSignOut() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const denied = status === "denied";

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-3 text-center">
        <AuthIcon icon={denied ? <XCircle className="text-red-600" /> : <Clock3 className="text-amber-600" />} />
        <AuthHeading
          title={denied ? "Access denied" : "Waiting for approval"}
          subtitle={
            denied
              ? "An admin has denied this account's access request. If you think this is a mistake, contact your clinic administrator."
              : "Your account has been created and is waiting on an admin to approve access. You'll be able to sign in as soon as that happens."
          }
        />
        <Button variant="outline" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </AuthLayout>
  );
}
