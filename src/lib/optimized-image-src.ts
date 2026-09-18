/**
 * Widths must stay in `next.config.ts` `images.deviceSizes` or `imageSizes`.
 * Qualities must stay in `images.qualities`.
 * Hero slider full layer uses storage URL (`fullUseOriginal`) — not these full constants.
 */
export const CANVAS_PREVIEW_WIDTH = 640;
export const CANVAS_PREVIEW_QUALITY = 45;
export const CANVAS_FULL_WIDTH = 1200;
export const CANVAS_FULL_QUALITY = 75;

/** Home cards are ~25–50vw — smaller than the hero. */
export const HOME_CARD_PREVIEW_WIDTH = 384;
export const HOME_CARD_FULL_WIDTH = 640;

/** Partner logos are ~64–112px tall. */
export const PARTNER_LOGO_PREVIEW_WIDTH = 128;
export const PARTNER_LOGO_FULL_WIDTH = 256;

const SVG_SRC = /\.svg(?:$|[?#])/i;

function isOptimizable(url: string): boolean {
  if (
    !url ||
    url.startsWith("data:") ||
    url.startsWith("blob:") ||
    url.startsWith("/_next/image")
  ) {
    return false;
  }

  if (SVG_SRC.test(url)) return false;

  return (
    url.startsWith("/") ||
    url.startsWith("http://") ||
    url.startsWith("https://")
  );
}

/** Next image optimizer URL with a locked width (ignores device pixel ratio). */
export function optimizedImageSrc(
  url: string,
  width: number,
  quality: number,
): string {
  const trimmed = url.trim();
  if (!isOptimizable(trimmed)) return trimmed;

  const params = new URLSearchParams({
    url: trimmed,
    w: String(width),
    q: String(quality),
  });

  return `/_next/image?${params.toString()}`;
}

export const canvasImageSrc = optimizedImageSrc;
