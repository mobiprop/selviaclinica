"use client";

import { useEffect, useState } from "react";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { profileFromRow, type ProfileRow } from "@/lib/supabase/mappers";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];

const TIMEZONES = [
  { value: "America/Argentina/Buenos_Aires", label: "America/Argentina/Buenos_Aires" },
  { value: "America/New_York", label: "America/New_York" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles" },
  { value: "Europe/Madrid", label: "Europe/Madrid" },
  { value: "UTC", label: "UTC" },
];

const DATE_FORMATS = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
];

type Status = { type: "success" | "error"; message: string } | null;

export function PreferencesPanel() {
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("America/Argentina/Buenos_Aires");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    (async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
        if (error) throw error;
        if (data) {
          const profile = profileFromRow(data as ProfileRow);
          setLanguage(profile.language);
          setTimezone(profile.timezone);
          setDateFormat(profile.dateFormat);
        }
      } catch (err) {
        console.error("Failed to load preferences", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
        language,
        timezone,
        date_format: dateFormat,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setStatus({ type: "success", message: "Preferences saved." });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Failed to save preferences" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-base font-semibold text-foreground">General Preferences</h2>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="language">Language</Label>
        <Select value={language} onValueChange={(v) => setLanguage(v ?? "en")}>
          <SelectTrigger id="language" className="w-full">
            <SelectValue>{LANGUAGES.find((l) => l.value === language)?.label}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="timezone">Time Zone</Label>
        <Select value={timezone} onValueChange={(v) => setTimezone(v ?? "America/Argentina/Buenos_Aires")}>
          <SelectTrigger id="timezone" className="w-full">
            <SelectValue>{TIMEZONES.find((t) => t.value === timezone)?.label}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dateFormat">Date Format</Label>
        <Select value={dateFormat} onValueChange={(v) => setDateFormat(v ?? "MM/DD/YYYY")}>
          <SelectTrigger id="dateFormat" className="w-full">
            <SelectValue>{DATE_FORMATS.find((d) => d.value === dateFormat)?.label}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {DATE_FORMATS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
