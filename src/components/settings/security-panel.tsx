"use client";

import { useEffect, useState } from "react";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

type Status = { type: "success" | "error"; message: string } | null;

export function SecurityPanel() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<Status>(null);
  const [saving, setSaving] = useState(false);

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaLoading, setMfaLoading] = useState(true);
  const [mfaBusy, setMfaBusy] = useState(false);
  const [mfaStatus, setMfaStatus] = useState<Status>(null);
  const [enrollment, setEnrollment] = useState<{ factorId: string; qrCode: string; secret: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) throw error;
        const verified = data.totp.find((f: { status: string }) => f.status === "verified");
        if (verified) {
          setMfaEnabled(true);
          setMfaFactorId(verified.id);
        }
      } catch (err) {
        console.error("Failed to load 2FA status", err);
      } finally {
        setMfaLoading(false);
      }
    })();
  }, []);

  async function handleUpdatePassword() {
    setPasswordStatus(null);
    if (!currentPassword || !newPassword) {
      setPasswordStatus({ type: "error", message: "Fill in your current and new password." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "New password and confirmation don't match." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ type: "error", message: "New password must be at least 6 characters." });
      return;
    }

    setSaving(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("Not signed in");

      // Supabase's client SDK changes the password for the current session
      // directly — it doesn't check the old password itself, so verify it
      // here by re-authenticating with it first.
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (verifyError) throw new Error("Current password is incorrect.");

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      setPasswordStatus({ type: "success", message: "Password updated." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordStatus({ type: "error", message: err instanceof Error ? err.message : "Failed to update password" });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleMfa(checked: boolean) {
    setMfaStatus(null);
    if (checked) {
      setMfaBusy(true);
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
        if (error) throw error;
        setEnrollment({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
      } catch (err) {
        setMfaStatus({ type: "error", message: err instanceof Error ? err.message : "Failed to start 2FA enrollment" });
      } finally {
        setMfaBusy(false);
      }
      return;
    }

    if (!mfaFactorId) return;
    setMfaBusy(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.mfa.unenroll({ factorId: mfaFactorId });
      if (error) throw error;
      setMfaEnabled(false);
      setMfaFactorId(null);
      setMfaStatus({ type: "success", message: "Two-factor authentication disabled." });
    } catch (err) {
      setMfaStatus({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to disable 2FA. You may need to sign out and back in with a 2FA code first.",
      });
    } finally {
      setMfaBusy(false);
    }
  }

  async function handleVerifyEnrollment() {
    if (!enrollment) return;
    setMfaStatus(null);
    setMfaBusy(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: enrollment.factorId,
        code: verifyCode.trim(),
      });
      if (error) throw error;
      setMfaEnabled(true);
      setMfaFactorId(enrollment.factorId);
      setEnrollment(null);
      setVerifyCode("");
      setMfaStatus({ type: "success", message: "Two-factor authentication enabled." });
    } catch (err) {
      setMfaStatus({ type: "error", message: err instanceof Error ? err.message : "Invalid code" });
    } finally {
      setMfaBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-base font-semibold text-foreground">Security Settings</h2>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-medium text-foreground">Change Password</h3>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="newPassword">New Password</Label>
          <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {passwordStatus && (
          <div className={`flex items-center gap-2 text-sm ${passwordStatus.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
            {passwordStatus.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {passwordStatus.message}
          </div>
        )}
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-foreground">Two-Factor Authentication</h3>

        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
          <div>
            <div className="text-sm font-medium text-foreground">Enable 2FA</div>
            <div className="text-xs text-muted-foreground">Add extra security to your account</div>
          </div>
          <Switch checked={mfaEnabled} onCheckedChange={handleToggleMfa} disabled={mfaLoading || mfaBusy || Boolean(enrollment)} />
        </div>

        {enrollment && (
          <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app, then enter the 6-digit code it shows.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={enrollment.qrCode} alt="2FA QR code" className="h-40 w-40 self-center" />
            <p className="text-center text-xs text-muted-foreground">
              Or enter this key manually: <code className="rounded bg-muted px-1 py-0.5">{enrollment.secret}</code>
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="verifyCode">Verification code</Label>
              <Input
                id="verifyCode"
                inputMode="numeric"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="000000"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleVerifyEnrollment} disabled={mfaBusy || verifyCode.length < 6}>
                {mfaBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Verify and enable
              </Button>
              <Button variant="outline" onClick={() => setEnrollment(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {mfaStatus && (
          <div className={`flex items-center gap-2 text-sm ${mfaStatus.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
            {mfaStatus.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {mfaStatus.message}
          </div>
        )}
      </div>

      <Separator />

      <div>
        <Button onClick={handleUpdatePassword} disabled={saving}>
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {saving ? "Updating..." : "Update Security"}
        </Button>
      </div>
    </div>
  );
}
