/**
 * Contact map — constants (quyết định đã chốt: DECISIONS.md § Google Maps — Contact).
 * Zoom default 15 ≈ view OSM bbox hiện tại; clamp 12–18 cho thanh +/− custom.
 */
export const CONTACT_MAP_ZOOM = {
  default: 15,
  min: 12,
  max: 18,
} as const;

/** Maps JS: tắt UI mặc định — zoom qua ContactMapZoomControls */
export const CONTACT_MAP_DISABLE_DEFAULT_UI = true;

/** Map ID — chỉ dùng khi bật AdvancedMarker */
export const CONTACT_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() || undefined;

export const CONTACT_MAP_USE_ADVANCED_MARKER =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_ADVANCED_MARKER === "true" &&
  Boolean(CONTACT_MAP_ID);

export const CONTACT_MAP_PIN = {
  src: "/site/contact/map-pin.svg",
  width: 40,
  height: 52,
} as const;
