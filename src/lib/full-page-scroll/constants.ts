import { SECTION_LAYOUT_TOLERANCE_PX, SECTION_SWIPE_MIN } from "@/lib/home-scroll";

/** Crossfade + drift 8px — fallback pager */
export const FPS_TRANSITION_MS = 400;
export const FPS_DRIFT_PX = 8;
export const FPS_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Slide dọc fullPage.js (About / Services / Projects) — scrollingSpeed 700 + easeInOutCubic.
 * Footer màn cuối: auto-height như
 * https://alvarotrigo.com/fullPage/examples/autoHeight.html
 */
export const FPS_SLIDE_TRANSITION_MS = 700;
export const FPS_SLIDE_EASING = "cubic-bezier(0.645, 0.045, 0.355, 1)";

/** Cooldown sau transition — tránh nhảy 2 màn (cộng 50ms lên duration đang dùng) */
export const FPS_TRANSITION_COOLDOWN_PAD_MS = 50;
export const FPS_TRANSITION_COOLDOWN_MS =
  FPS_TRANSITION_MS + FPS_TRANSITION_COOLDOWN_PAD_MS;

/** Ngưỡng gesture fixed section — scroll ngắn cũng chuyển màn */
export const FPS_FIXED_GESTURE_MIN_PX = SECTION_SWIPE_MIN;

/** Inner scroll edge — dùng chung tolerance layout */
export const FPS_INNER_SCROLL_EDGE_PX = SECTION_LAYOUT_TOLERANCE_PX;

/** Wheel notch tối thiểu trên fixed section */
export const FPS_WHEEL_NOTCH_MIN = 20;

export const PARTNERS_SCROLL_SELECTOR = "[data-partners-scroll]";
