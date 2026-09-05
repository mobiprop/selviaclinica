// Minimal loader for Google's Picker widget — needed because drive.file only
// grants access to files the user explicitly hands over through this UI, not
// to their whole Drive (see google-oauth.ts for why the scope moved away
// from drive.readonly).

declare global {
  interface Window {
    gapi?: {
      load: (api: string, callback: () => void) => void;
    };
    // No official types package exists for the Picker API — kept as `any`
    // and only ever touched from this one file (see the cast below).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}

let gapiLoadPromise: Promise<void> | null = null;

function loadGapiScript(): Promise<void> {
  if (gapiLoadPromise) return gapiLoadPromise;
  gapiLoadPromise = new Promise((resolve, reject) => {
    if (window.gapi) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google API script"));
    document.head.appendChild(script);
  });
  return gapiLoadPromise;
}

/** Opens the Google Drive Picker, resolving with the ids/names of whatever the user picks (or null if they cancel). */
export async function openDrivePicker(): Promise<{ id: string; name: string }[] | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GOOGLE_PICKER_API_KEY is not configured");
  }

  const tokenRes = await fetch("/api/integrations/google/drive/picker-token");
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) throw new Error(tokenData.error ?? "Failed to get a Drive access token");

  await loadGapiScript();
  await new Promise<void>((resolve) => window.gapi!.load("picker", resolve));

  return new Promise((resolve, reject) => {
    const g = window.google;
    try {
      const picker = new g.picker.PickerBuilder()
        .addView(g.picker.ViewId.DOCS)
        .setOAuthToken(tokenData.accessToken)
        .setDeveloperKey(apiKey)
        .setCallback((data: { action: string; docs?: { id: string; name: string }[] }) => {
          if (data.action === g.picker.Action.PICKED) {
            resolve((data.docs ?? []).map((d) => ({ id: d.id, name: d.name })));
          } else if (data.action === g.picker.Action.CANCEL) {
            resolve(null);
          }
        })
        .build();
      picker.setVisible(true);
    } catch (err) {
      reject(err instanceof Error ? err : new Error("Failed to open Google Picker"));
    }
  });
}
