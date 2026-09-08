export type MediaType = "image" | "video";

export type MediaItem = {
  id: string;
  filename: string;
  title: string;
  url: string;
  mimeType: string;
  size: number;
  type: MediaType;
  createdAt: string;
};

const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const OPTIMIZABLE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

/** File gốc raster — server nén WebP trước khi lưu. */
export const MAX_IMAGE_UPLOAD_SIZE = 50 * 1024 * 1024;
/** SVG / file sau nén. */
export const MAX_IMAGE_STORED_SIZE = 10 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

function formatMb(bytes: number) {
  return String(bytes / (1024 * 1024));
}

export function getMediaType(mimeType: string): MediaType | null {
  if (IMAGE_TYPES.includes(mimeType)) return "image";
  if (VIDEO_TYPES.includes(mimeType)) return "video";
  return null;
}

export function maxUploadBytes(mimeType: string, type: MediaType) {
  if (type === "video") return MAX_VIDEO_SIZE;
  if (OPTIMIZABLE_IMAGE_TYPES.has(mimeType)) return MAX_IMAGE_UPLOAD_SIZE;
  return MAX_IMAGE_STORED_SIZE;
}

export function validateMediaFile(file: File) {
  const type = getMediaType(file.type);
  if (!type) {
    return {
      valid: false as const,
      error: "Chỉ hỗ trợ ảnh (JPEG, PNG, GIF, WebP, SVG) và video (MP4, WebM, MOV)",
    };
  }

  const maxSize = maxUploadBytes(file.type, type);
  if (file.size > maxSize) {
    const kind = type === "image" ? "ảnh" : "video";
    return {
      valid: false as const,
      error: `File quá lớn. Giới hạn ${kind}: ${formatMb(maxSize)}MB`,
    };
  }

  return { valid: true as const, type };
}

export function buildMediaMarkdown(
  type: MediaType,
  url: string,
  filename: string,
) {
  if (type === "image") {
    return `<div style="text-align: center">\n<img src="${url}" alt="${filename}" style="width: 100%; height: auto;" />\n</div>`;
  }
  return `<div style="text-align: center">\n<video src="${url}" controls style="width: 100%; height: auto;"></video>\n</div>`;
}

export function sanitizeFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
