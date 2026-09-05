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
      "Under Authorized JavaScript origins, add http://localhost:3000 (add your production domain later).",
      "Copy the Client ID and set it as NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local, then restart the dev server.",
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
      "Under Authorized JavaScript origins, add http://localhost:3000 (add your production domain later).",
      "Copy the Client ID and set it as NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local, then restart the dev server. (Same client ID as Google Calendar — one Google OAuth client can cover both.)",
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
      "Facebook Login → Settings → add http://localhost:3000 under Allowed Domains for the JavaScript SDK.",
      "App Roles → Roles → make sure your own Facebook account is listed (needed while the app is in Development mode).",
      "Copy the App ID from the dashboard and set it as NEXT_PUBLIC_META_APP_ID in .env.local, then restart the dev server.",
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
            This needs a one-time setup step in your own developer account before it can connect —
            the ID it produces isn&apos;t a secret, so it&apos;s safe to paste into this project.
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
