import sharp from "sharp";

/** Cạnh dài tối đa — đủ hero/slider, cắt ảnh điện thoại 4–6k. */
export const MEDIA_IMAGE_MAX_EDGE = 2560;

/** WebP quality — gần như không khác mắt, giảm mạnh dung lượng. */
export const MEDIA_WEBP_QUALITY = 82;

const RASTER_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export type OptimizedUpload = {
  buffer: Buffer;
  mimeType: string;
  filename: string;
  optimized: boolean;
};

function withWebpExtension(filename: string) {
  const trimmed = filename.trim() || "image";
  const base = trimmed.includes(".")
    ? trimmed.replace(/\.[^.]+$/, "")
    : trimmed;
  return `${base || "image"}.webp`;
}

/**
 * Nén ảnh raster lúc upload: xoay theo EXIF, fit trong 2560px, WebP q82.
 * Bỏ qua SVG, video, GIF/WebP động. Nếu file nén không nhỏ hơn bản gốc
 * (và không cần resize) thì giữ nguyên.
 */
export async function optimizeImageForUpload(
  buffer: Buffer,
  mimeType: string,
  originalName: string,
): Promise<OptimizedUpload> {
  const passthrough: OptimizedUpload = {
    buffer,
    mimeType,
    filename: originalName,
    optimized: false,
  };

  if (!RASTER_MIME.has(mimeType)) {
    return passthrough;
  }

  try {
    const meta = await sharp(buffer, { failOn: "none", animated: true }).metadata();
    if ((meta.pages ?? 1) > 1) {
      return passthrough;
    }

    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    const needsResize =
      width > MEDIA_IMAGE_MAX_EDGE || height > MEDIA_IMAGE_MAX_EDGE;

    let pipeline = sharp(buffer, { failOn: "none" }).rotate();
    if (needsResize) {
      pipeline = pipeline.resize({
        width: MEDIA_IMAGE_MAX_EDGE,
        height: MEDIA_IMAGE_MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    const output = await pipeline
      .webp({ quality: MEDIA_WEBP_QUALITY })
      .toBuffer();

    if (!needsResize && output.length >= buffer.length) {
      return passthrough;
    }

    return {
      buffer: output,
      mimeType: "image/webp",
      filename: withWebpExtension(originalName),
      optimized: true,
    };
  } catch {
    return passthrough;
  }
}
