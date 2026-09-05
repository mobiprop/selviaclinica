"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { IntegrationKind } from "@/data/integrations";

type SetupInfo = {
  title: string;
  envVar: string;
  consoleUrl: string;
  consoleLabel: string;
  steps: string[];
};

const SETUP_INFO: Partial<Record<IntegrationKind, SetupInfo>> = {
  "google-calendar": {
    title: "Connect Google Calendar",
    envVar: "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
    consoleUrl: "https://console.cloud.google.com/apis/credentials",
    consoleLabel: "Google Cloud Console — Credentials",
    steps: [
      "Create (or pick) a project in Google Cloud Console.",
      "APIs & Services → Library → enable the Google Calendar API.",
      "APIs & Services → OAuth consent screen → set it up (External is fine) and add your own Google account under Test users.",
      "APIs & Services → Credentials → Create Credentials → OAuth client ID → Application type: Web application.",
      "Under Authorized redirect URIs, add http://localhost:3000/api/integrations/google/callback (add your production URL later).",
      "Copy the Client ID and Client Secret. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local, then restart the dev server. The secret never reaches the browser — it's only used server-side to complete the connection.",
    ],
  },
  "google-drive": {
    title: "Connect Google Drive",
    envVar: "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
    consoleUrl: "https://console.cloud.google.com/apis/credentials",
    consoleLabel: "Google Cloud Console — Credentials",
    steps: [
      "Create (or pick) a project in Google Cloud Console.",
      "APIs & Services → Library → enable the Google Drive API.",
      "APIs & Services → OAuth consent screen → set it up (External is fine) and add your own Google account under Test users.",
      "APIs & Services → Credentials → Create Credentials → OAuth client ID → Application type: Web application.",
      "Under Authorized redirect URIs, add http://localhost:3000/api/integrations/google/callback (add your production URL later).",
      "Copy the Client ID and Client Secret. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local, then restart the dev server. (Same Google OAuth client as Calendar covers both.)",
      "APIs & Services → Library → also enable the Google Picker API, then Credentials → Create Credentials → API key. Restrict it to the Picker API and your domain, then set NEXT_PUBLIC_GOOGLE_PICKER_API_KEY. Drive only searches files a user explicitly shares through that Picker.",
    ],
  },
  "meta-ads": {
    title: "Connect Meta Ads",
    envVar: "NEXT_PUBLIC_META_APP_ID",
    consoleUrl: "https://developers.facebook.com/apps",
    consoleLabel: "Meta for Developers — My Apps",
    steps: [
      "Create an app at developers.facebook.com/apps (type: Business).",
      "Add the Facebook Login product to the app.",
      "Facebook Login → Settings → add http://localhost:3000/api/integrations/meta/callback under Valid OAuth Redirect URIs.",
      "App Roles → Roles → make sure your own Facebook account is listed (needed while the app is in Development mode).",
      "Settings → Basic → copy the App ID and App Secret. Set NEXT_PUBLIC_META_APP_ID and META_APP_SECRET in .env.local, then restart the dev server.",
      "This works immediately for your own ad account in Development mode. Reaching other users' ad accounts needs Meta App Review for ads_read.",
    ],
  },
};

export function SetupInstructionsDialog({
  open,
  onOpenChange,
  kind,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: IntegrationKind;
}) {
  const info = SETUP_INFO[kind];
  if (!info) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{info.title}</DialogTitle>
          <DialogDescription>
            This needs a one-time setup step in your own developer account before it can connect. The
            secret it produces stays server-side and is never sent to the browser.
          </DialogDescription>
        </DialogHeader>

        <ol className="flex flex-col gap-2.5 text-sm text-foreground">
          {info.steps.map((step, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>

        <a
          href={info.consoleUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80"
        >
          Open {info.consoleLabel}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Got it</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
