"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ExternalLink } from "lucide-react";
import { SelviaLogoBadge } from "@/components/dashboard/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.replace("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <SelviaLogoBadge />
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Selvia Clínica</h1>
          <p className="text-sm text-muted-foreground">Sign in to your dashboard</p>
        </div>

        {!SUPABASE_CONFIGURED ? (
          <div className="flex flex-col gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4" />
              Supabase isn&apos;t configured yet
            </div>
            <p>
              Set <code className="rounded bg-amber-100 px-1 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="rounded bg-amber-100 px-1 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{" "}
              <code className="rounded bg-amber-100 px-1 py-0.5">.env.local</code>, then restart the dev server.
              See SETUP.md for the full walkthrough.
            </p>
            <a
              href="https://supabase.com/dashboard/projects"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 font-medium hover:opacity-80"
            >
              Open Supabase Dashboard
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
