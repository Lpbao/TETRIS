import type { MediaItem, MediaType } from "@/lib/media";
import { MEDIA_PAGE_SIZE } from "@/lib/validations/media";

export type MediaListResponse = {
  items: MediaItem[];
  nextCursor: string | null;
};

export function buildMediaListParams(options: {
  q?: string;
  cursor?: string | null;
  limit?: number;
  type?: MediaType;
}) {
  const params = new URLSearchParams();
  if (options.q) params.set("q", options.q);
  if (options.cursor) params.set("cursor", options.cursor);
  params.set("limit", String(options.limit ?? MEDIA_PAGE_SIZE));
  if (options.type) params.set("type", options.type);
  return params;
}

export async function fetchMediaPage(options: {
  q?: string;
  cursor?: string | null;
  limit?: number;
  type?: MediaType;
}): Promise<MediaListResponse> {
  const res = await fetch(
    `/api/media?${buildMediaListParams(options).toString()}`,
  );
  const payload: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Không thể tải media";
    throw new Error(message);
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    !("items" in payload) ||
    !Array.isArray(payload.items)
  ) {
    throw new Error("Không thể tải media");
  }

  const nextCursor =
    "nextCursor" in payload && typeof payload.nextCursor === "string"
      ? payload.nextCursor
      : null;

  return {
    items: payload.items as MediaItem[],
    nextCursor,
  };
}
