"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Request submitted</h1>
          <p className="text-sm text-muted-foreground">
            An admin needs to approve your account before you can sign in. You&apos;ll be able to log in as soon as
            that happens.
          </p>
          <Link href="/login" className="mt-2 text-sm font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-6 flex flex-col items-center gap-1 text-center">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Create your account</h1>
        <p className="text-sm text-muted-foreground">Enter your details to request access.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="full-name">Full Name</Label>
          <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email Address</Label>
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} className="mt-0.5" required />
          I agree to the Terms of Service and Privacy Policy
        </label>
        {error && (
          <p className="flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}
        <Button type="submit" disabled={loading || !agreed} className="mt-2 w-full">
          {loading ? "Creating account..." : "Create account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
