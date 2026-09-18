import type { MediaItem } from "@/lib/media";
import type { MediaTitleConflict } from "@/lib/media-upload-titles";

type PrepareResponse = {
  path: string;
  token: string;
  signedUrl: string;
  bucket: string;
};

function payloadError(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }
  return null;
}

export class MediaUploadHttpError extends Error {
  status: number;
  conflicts: MediaTitleConflict[];

  constructor(
    message: string,
    status: number,
    conflicts: MediaTitleConflict[] = [],
  ) {
    super(message);
    this.name = "MediaUploadHttpError";
    this.status = status;
    this.conflicts = conflicts;
  }
}

function readConflicts(payload: unknown): MediaTitleConflict[] {
  if (!payload || typeof payload !== "object") return [];
  const conflicts = (payload as { conflicts?: unknown }).conflicts;
  if (!Array.isArray(conflicts)) return [];
  return conflicts.filter((item): item is MediaTitleConflict => {
    if (!item || typeof item !== "object") return false;
    const row = item as Partial<MediaTitleConflict>;
    return (
      typeof row.index === "number" &&
      typeof row.title === "string" &&
      typeof row.suggested === "string"
    );
  });
}

/**
 * Direct-to-Supabase upload (bypasses Vercel 4.5MB function body limit):
 * prepare → PUT signedUrl → complete (server Sharp + Prisma).
 */
export async function uploadMediaFile(
  file: File,
  title: string,
): Promise<MediaItem> {
  const prepareRes = await fetch("/api/media/prepare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    }),
  });
  const preparePayload: unknown = await prepareRes.json().catch(() => null);

  if (!prepareRes.ok) {
    throw new MediaUploadHttpError(
      payloadError(preparePayload) ?? `Không thể chuẩn bị upload: ${file.name}`,
      prepareRes.status,
      readConflicts(preparePayload),
    );
  }

  const prepared = preparePayload as PrepareResponse;
  if (
    !prepared?.signedUrl ||
    !prepared.path ||
    typeof prepared.signedUrl !== "string"
  ) {
    throw new MediaUploadHttpError(
      "Phản hồi prepare upload không hợp lệ",
      500,
    );
  }

  // Match @supabase/storage-js uploadToSignedUrl (Blob → multipart FormData PUT).
  const body = new FormData();
  body.append("cacheControl", "3600");
  body.append("", file);

  const putRes = await fetch(prepared.signedUrl, {
    method: "PUT",
    body,
  });

  if (!putRes.ok) {
    const detail = await putRes.text().catch(() => "");
    throw new MediaUploadHttpError(
      detail.trim() ||
        `Upload lên storage thất bại (${putRes.status}). Kiểm tra CORS bucket Supabase.`,
      putRes.status,
    );
  }

  const completeRes = await fetch("/api/media/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      path: prepared.path,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    }),
  });
  const completePayload: unknown = await completeRes.json().catch(() => null);

  if (!completeRes.ok) {
    throw new MediaUploadHttpError(
      payloadError(completePayload) ?? `Hoàn tất upload thất bại: ${file.name}`,
      completeRes.status,
      readConflicts(completePayload),
    );
  }

  return completePayload as MediaItem;
}
