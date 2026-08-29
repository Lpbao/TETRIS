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

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export function getMediaType(mimeType: string): MediaType | null {
  if (IMAGE_TYPES.includes(mimeType)) return "image";
  if (VIDEO_TYPES.includes(mimeType)) return "video";
  return null;
}

export function validateMediaFile(file: File) {
  const type = getMediaType(file.type);
  if (!type) {
    return {
      valid: false as const,
      error: "Chỉ hỗ trợ ảnh (JPEG, PNG, GIF, WebP, SVG) và video (MP4, WebM, MOV)",
    };
  }

  const maxSize = type === "image" ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
  if (file.size > maxSize) {
    const limitMb = maxSize / (1024 * 1024);
    return {
      valid: false as const,
      error: `File quá lớn. Giới hạn ${type === "image" ? "ảnh" : "video"}: ${limitMb}MB`,
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
