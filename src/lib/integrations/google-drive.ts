import { getValidGoogleAccessToken } from "@/lib/integrations/google-token";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const MAX_CONTENT_CHARS = 20_000;

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
};

function escapeDriveQueryValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export async function searchDriveFiles(query: string, limit: number, userId?: string): Promise<DriveFile[]> {
  const accessToken = await getValidGoogleAccessToken("google-drive", userId);
  const q = `fullText contains '${escapeDriveQueryValue(query)}' and trashed = false`;
  const params = new URLSearchParams({
    q,
    pageSize: String(limit),
    fields: "files(id,name,mimeType,modifiedTime,webViewLink)",
    corpora: "user",
  });

  const res = await fetch(`${DRIVE_API}/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Google Drive search failed");
  return data.files ?? [];
}

/** Reads a Drive file's content as plain text — exports Sheets/Docs, downloads everything else directly. Truncated to a safe size for a tool result. */
export async function readDriveFile(
  fileId: string,
  userId?: string
): Promise<{ name: string; mimeType: string; content: string }> {
  const accessToken = await getValidGoogleAccessToken("google-drive", userId);
  const headers = { Authorization: `Bearer ${accessToken}` };

  const metaRes = await fetch(`${DRIVE_API}/files/${fileId}?fields=id,name,mimeType`, { headers });
  const meta = await metaRes.json();
  if (!metaRes.ok) throw new Error(meta.error?.message ?? "Failed to read file metadata");

  let exportMimeType: string | null = null;
  if (meta.mimeType === "application/vnd.google-apps.spreadsheet") exportMimeType = "text/csv";
  else if (meta.mimeType === "application/vnd.google-apps.document") exportMimeType = "text/plain";

  const contentUrl = exportMimeType
    ? `${DRIVE_API}/files/${fileId}/export?mimeType=${encodeURIComponent(exportMimeType)}`
    : `${DRIVE_API}/files/${fileId}?alt=media`;

  const contentRes = await fetch(contentUrl, { headers });
  if (!contentRes.ok) {
    const errBody = await contentRes.json().catch(() => ({}));
    throw new Error(errBody.error?.message ?? `Failed to read file content (${contentRes.status})`);
  }
  const raw = await contentRes.text();
  const truncated = raw.length > MAX_CONTENT_CHARS;

  return {
    name: meta.name,
    mimeType: meta.mimeType,
    content: truncated
      ? `${raw.slice(0, MAX_CONTENT_CHARS)}\n\n[...truncated, file is longer than ${MAX_CONTENT_CHARS} characters]`
      : raw,
  };
}
