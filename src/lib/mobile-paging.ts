/** Mobile-only section paging — khớp `globals.css` @media (max-width: 767px) */
export const MOBILE_PAGING_MEDIA_QUERY = "(max-width: 767px)";

export function subscribeMobilePaging(onStoreChange: () => void): () => void {
  const media = window.matchMedia(MOBILE_PAGING_MEDIA_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

export function getMobilePagingEnabled(): boolean {
  return window.matchMedia(MOBILE_PAGING_MEDIA_QUERY).matches;
}

export function getMobilePagingEnabledServer(): boolean {
  return false;
}

const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

export function subscribePrefersReducedMotion(onStoreChange: () => void): () => void {
  const media = window.matchMedia(REDUCED_MOTION_MEDIA_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

export function getPrefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches;
}

export function getPrefersReducedMotionServer(): boolean {
  return false;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return getPrefersReducedMotion();
}
