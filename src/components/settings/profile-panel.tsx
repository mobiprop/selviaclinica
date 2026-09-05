"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Camera, Check, AlertCircle, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { profileFromRow, type ProfileRow } from "@/lib/supabase/mappers";
import type { Profile } from "@/types/profile";

const EMPTY_PROFILE: Profile = {
  id: "",
  firstName: "",
  lastName: "",
  phone: "",
  bio: "",
  avatarUrl: null,
  language: "en",
  timezone: "America/Argentina/Buenos_Aires",
  dateFormat: "MM/DD/YYYY",
};

export function ProfilePanel() {
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        setEmail(user.email ?? "");

        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
        if (error) throw error;
        if (data) {
          setProfile(profileFromRow(data as ProfileRow));
        } else {
          setProfile({ ...EMPTY_PROFILE, id: user.id });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus(null);
    setUploading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
      // Cache-bust so the new image shows immediately instead of a stale cached one at the same URL.
      const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, avatar_url: avatarUrl, updated_at: new Date().toISOString() });
      if (upsertError) throw upsertError;

      update("avatarUrl", avatarUrl);
      setStatus({ type: "success", message: "Profile picture updated." });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Failed to upload picture" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    setStatus(null);
    setSaving(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        first_name: profile.firstName.trim() || null,
        last_name: profile.lastName.trim() || null,
        phone: profile.phone.trim() || null,
        bio: profile.bio.trim() || null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setStatus({ type: "success", message: "Profile saved." });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Failed to save profile" });
    } finally {
      setSaving(false);
    }
  }

  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || email;
  const initials = (profile.firstName.charAt(0) + profile.lastName.charAt(0)).toUpperCase() || email.slice(0, 2).toUpperCase();

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-base font-semibold text-foreground">Profile Settings</h2>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar size="lg" className="size-16">
            <AvatarImage src={profile.avatarUrl ?? ""} alt={fullName} />
            <AvatarFallback className="text-base">{initials}</AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <div className="font-medium text-foreground">{fullName}</div>
          <div className="text-sm text-muted-foreground">{email}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" value={profile.firstName} onChange={(e) => update("firstName", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" value={profile.lastName} onChange={(e) => update("lastName", e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={profile.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="+54 11 5555-1234"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" rows={3} value={profile.bio} onChange={(e) => update("bio", e.target.value)} />
      </div>

      {status && (
        <div className={`flex items-center gap-2 text-sm ${status.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
          {status.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {status.message}
        </div>
      )}

      <div>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
