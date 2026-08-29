/** Shared helpers — home hero scroll, section paging & project curtain gate */

/** Tỷ lệ chiều cao card phải lộ trong viewport để coi là “full visible” (tolerance sub-pixel) */
export const CARD_REVEAL_VISIBLE_RATIO = 0.92;

/** Fallback — card không đạt full nhưng đã lộ đủ lớn thì vẫn reveal (tránh che mãi) */
export const CARD_FALLBACK_VISIBLE_RATIO = 0.55;

/** Rest state A — hero full (`scrollY` tại đỉnh trang) */
export const HERO_REST_MAX_SCROLL_Y = 8;

export const SECTION_LAYOUT_TOLERANCE_PX = 8;

/** Rest state B — khớp `scrollY` với anchor projects */
export const PROJECTS_SCROLL_TOLERANCE_PX = 16;

/** Qua anchor B — scroll tự do trong grid, không snap limbo */
export const GRID_DEEP_EPSILON_PX = 32;

/** Gesture chuyển section — đối xứng hero carousel */
export const SECTION_SWIPE_MIN = 28;
export const SECTION_EXIT_SWIPE_MIN = 96;
export const SECTION_AXIS_LOCK_MIN = 10;

/** Gesture A→B / B→A — cùng ngưỡng đối xứng */
export const SECTION_ENTER_SWIPE_MIN = SECTION_EXIT_SWIPE_MIN;

/** Desktop wheel tích lũy tại anchor B trước khi về hero */
export const WHEEL_UP_ACCUM_THRESHOLD = 80;

/** Đáy nội dung Home (footer đang ẩn) — extra swipe/wheel mới hiện footer */
export const HOME_CONTENT_END_PX = 16;

export type HomeScrollDirection = "up" | "down";

export type HomeRestState = "hero" | "projects-anchor" | "between" | "grid-deep";

/** Phiên scroll liên tục — phân biệt limbo từ B vs từ grid sâu (P0 #3) */
export type HomeScrollSession = {
  startedState: HomeRestState | null;
  startedScrollY: number;
  deltaY: number;
};

let programmaticScrollGuardUntil = 0;

export function getHeaderOffset(): number {
  if (typeof document === "undefined") return 64;
  return document.querySelector("header")?.getBoundingClientRect().height ?? 64;
}

export function getHomeScrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined") return "smooth";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

/** Smooth scroll guard — sync với `markProgrammaticScroll` */
export const PROGRAMMATIC_SCROLL_GUARD_SMOOTH_MS = 900;
export const PROGRAMMATIC_SCROLL_GUARD_AUTO_MS = 80;

function markProgrammaticScroll(behavior: ScrollBehavior): void {
  programmaticScrollGuardUntil =
    Date.now() +
    (behavior === "smooth"
      ? PROGRAMMATIC_SCROLL_GUARD_SMOOTH_MS
      : PROGRAMMATIC_SCROLL_GUARD_AUTO_MS);
}

export function isProgrammaticHomeScroll(): boolean {
  return Date.now() < programmaticScrollGuardUntil;
}

export function getProgrammaticScrollGuardRemainingMs(): number {
  return Math.max(0, programmaticScrollGuardUntil - Date.now());
}

export function createHomeScrollSession(
  sectionId: string,
  anchorAId?: string,
): HomeScrollSession {
  return {
    startedState: getHomeRestState(sectionId, anchorAId),
    startedScrollY: window.scrollY,
    deltaY: 0,
  };
}

export function updateHomeScrollSession(
  session: HomeScrollSession,
  scrollY: number,
  lastScrollY: number,
): void {
  session.deltaY += scrollY - lastScrollY;
}

/** Rest state A — section anchor (page-top hero hoặc chained pair) */
export function isRestStateAnchorA(
  anchorAId: string,
  scrollY = window.scrollY,
): boolean {
  const anchorScrollY = getProjectsScrollTop(anchorAId);
  if (anchorScrollY === null) return false;

  const section = document.getElementById(anchorAId);
  if (!section) return false;

  const layoutAligned = isSectionBelowMenu(
    section,
    SECTION_LAYOUT_TOLERANCE_PX,
  );
  const scrollAligned =
    Math.abs(scrollY - anchorScrollY) <= PROJECTS_SCROLL_TOLERANCE_PX;

  return layoutAligned || scrollAligned;
}

/** P0 #3 — chỉ về anchor A từ limbo khi xuất phát từ anchor B (hoặc sát B) */
export function canExitToHeroFromLimbo(
  sectionId: string,
  session: HomeScrollSession,
  anchorAId?: string,
): boolean {
  const anchorBScrollY = getProjectsScrollTop(sectionId);
  if (anchorBScrollY === null) return false;

  if (session.startedState === "projects-anchor") return true;

  if (session.startedState === "grid-deep") return false;

  return session.startedScrollY >= anchorBScrollY - GRID_DEEP_EPSILON_PX;
}

/** Limbo xuống B — xuất phát từ anchor A hoặc gần anchor A */
export function canExitToProjectsFromLimbo(
  sectionId: string,
  session: HomeScrollSession,
  anchorAId?: string,
): boolean {
  const anchorBScrollY = getProjectsScrollTop(sectionId);
  if (anchorBScrollY === null) return false;

  if (session.startedState === "hero") return true;

  if (session.startedState === "grid-deep") {
    const anchorAScrollY = anchorAId ? getProjectsScrollTop(anchorAId) : 0;
    if (anchorAScrollY === null) return false;
    const midpoint = (anchorAScrollY + anchorBScrollY) / 2;
    return window.scrollY >= midpoint - GRID_DEEP_EPSILON_PX;
  }

  const anchorAScrollY = anchorAId ? getProjectsScrollTop(anchorAId) : 0;
  if (anchorAScrollY === null) return false;

  const threshold = anchorAId
    ? anchorAScrollY + GRID_DEEP_EPSILON_PX
    : HERO_REST_MAX_SCROLL_Y + GRID_DEEP_EPSILON_PX;

  return session.startedScrollY <= threshold;
}

/** P1 #6 — hướng từ tích lũy delta khi direction frame không rõ */
export function getSessionScrollDirection(
  session: HomeScrollSession,
  minDeltaPx = 24,
): HomeScrollDirection | null {
  if (session.deltaY <= -minDeltaPx) return "up";
  if (session.deltaY >= minDeltaPx) return "down";
  return null;
}

/** Rest state A — carousel full màn */
export function isRestStateHero(scrollY = window.scrollY): boolean {
  return scrollY <= HERO_REST_MAX_SCROLL_Y;
}

/** Rest state B — top `#home-projects` ngay dưới menu */
export function isRestStateProjectsAnchor(
  section: HTMLElement,
  sectionId?: string,
): boolean {
  const projectsScrollY = sectionId
    ? getProjectsScrollTop(sectionId)
    : Math.max(0, section.offsetTop - getHeaderOffset());

  if (projectsScrollY === null) return false;

  const layoutAligned = isSectionBelowMenu(
    section,
    SECTION_LAYOUT_TOLERANCE_PX,
  );
  const scrollAligned =
    window.scrollY > HERO_REST_MAX_SCROLL_Y &&
    Math.abs(window.scrollY - projectsScrollY) <= PROJECTS_SCROLL_TOLERANCE_PX;

  return layoutAligned || scrollAligned;
}

export function getProjectsScrollTop(sectionId: string): number | null {
  const section = document.getElementById(sectionId);
  if (!section) return null;
  return Math.max(0, section.offsetTop - getHeaderOffset());
}

/** Section top ≈ ngay dưới menu fixed */
export function isSectionBelowMenu(
  section: HTMLElement,
  tolerancePx = SECTION_LAYOUT_TOLERANCE_PX,
): boolean {
  const targetTop = getHeaderOffset();
  const top = section.getBoundingClientRect().top;
  return Math.abs(top - targetTop) <= tolerancePx;
}

/**
 * Mở section gate: layout khớp dưới menu HOẶC scrollY đã tới anchor projects
 * (fix miss khi smooth scroll không khớp sub-pixel).
 */
export function isSectionGateOpen(
  section: HTMLElement,
  tolerancePx = SECTION_LAYOUT_TOLERANCE_PX,
): boolean {
  const targetTop = getHeaderOffset();
  const top = section.getBoundingClientRect().top;
  const projectsScrollY = Math.max(0, section.offsetTop - targetTop);

  const layoutAligned = Math.abs(top - targetTop) <= tolerancePx;
  const scrollAligned =
    window.scrollY > 48 &&
    Math.abs(window.scrollY - projectsScrollY) <= PROJECTS_SCROLL_TOLERANCE_PX;

  return layoutAligned || scrollAligned;
}

export function getHomeRestState(
  sectionId: string,
  anchorAId?: string,
): HomeRestState | null {
  const section = document.getElementById(sectionId);
  if (!section) return null;

  const scrollY = window.scrollY;
  const anchorBScrollY = getProjectsScrollTop(sectionId);
  if (anchorBScrollY === null) return null;

  const anchorAScrollY = anchorAId ? getProjectsScrollTop(anchorAId) : null;
  if (anchorAId && anchorAScrollY === null) return null;

  if (
    anchorAId &&
    anchorAScrollY !== null &&
    scrollY < anchorAScrollY - GRID_DEEP_EPSILON_PX
  ) {
    return null;
  }

  if (anchorAId) {
    if (isRestStateAnchorA(anchorAId, scrollY)) return "hero";
  } else if (isRestStateHero(scrollY)) {
    return "hero";
  }

  if (isRestStateProjectsAnchor(section, sectionId)) {
    return "projects-anchor";
  }

  if (scrollY > anchorBScrollY + GRID_DEEP_EPSILON_PX) return "grid-deep";

  if (
    anchorAId &&
    anchorAScrollY !== null &&
    scrollY > anchorAScrollY + GRID_DEEP_EPSILON_PX
  ) {
    return "grid-deep";
  }

  return "between";
}

/** Rest state A — page top (home / about hero đầu trang) */
export function scrollToHero(behavior?: ScrollBehavior): void {
  const resolved = behavior ?? getHomeScrollBehavior();
  markProgrammaticScroll(resolved);
  window.scrollTo({ top: 0, behavior: resolved });
}

/** Rest state A — bất kỳ section anchor (chained pairs) */
export function scrollToSectionAnchor(
  anchorAId: string,
  behavior?: ScrollBehavior,
): void {
  scrollToProjectsAnchor(anchorAId, behavior);
}

/** Rest state B — luôn offset header, không bao giờ `top: 0` (P0 #4) */
export function scrollToProjectsAnchor(
  sectionId: string,
  behavior?: ScrollBehavior,
): void {
  const top = getProjectsScrollTop(sectionId);
  if (top === null) return;

  const headerOffset = getHeaderOffset();
  const safeTop = Math.max(headerOffset, top);

  const resolved = behavior ?? getHomeScrollBehavior();
  markProgrammaticScroll(resolved);
  window.scrollTo({ top: safeTop, behavior: resolved });
}

/**
 * Khi scroll dừng trong vùng between A↔B → snap về rest state.
 * P0 #3: hướng lên → hero chỉ khi session xuất phát từ B; grid sâu → snap về B.
 */
export function resolveHomeRestStateOnScrollEnd(
  sectionId: string,
  scrollDirection: HomeScrollDirection | null = null,
  session: HomeScrollSession | null = null,
  anchorAId?: string,
): void {
  if (isProgrammaticHomeScroll()) return;
  if (getHomeRestState(sectionId, anchorAId) !== "between") return;

  const anchorBScrollY = getProjectsScrollTop(sectionId);
  if (anchorBScrollY === null) return;

  const anchorAScrollY = anchorAId ? getProjectsScrollTop(anchorAId) : 0;
  if (anchorAId && anchorAScrollY === null) return;

  const snapSession =
    session ?? createHomeScrollSession(sectionId, anchorAId);
  const direction =
    scrollDirection ?? getSessionScrollDirection(snapSession);

  const scrollToAnchorA = () => {
    if (anchorAId) {
      scrollToSectionAnchor(anchorAId);
    } else {
      scrollToHero();
    }
  };

  if (direction === "up") {
    if (canExitToHeroFromLimbo(sectionId, snapSession, anchorAId)) {
      scrollToAnchorA();
    } else {
      scrollToProjectsAnchor(sectionId);
    }
    return;
  }

  if (direction === "down") {
    if (canExitToProjectsFromLimbo(sectionId, snapSession, anchorAId)) {
      scrollToProjectsAnchor(sectionId);
    } else {
      scrollToAnchorA();
    }
    return;
  }

  const midpoint = ((anchorAScrollY ?? 0) + anchorBScrollY) / 2;
  if (window.scrollY < midpoint) {
    scrollToAnchorA();
    return;
  }

  scrollToProjectsAnchor(sectionId);
}

/** Inner scroller của full-page pager (`data-fps-inner-scroll`) — Home không có */
export function getCurtainScrollRoot(el: HTMLElement): HTMLElement | null {
  const root = el.closest("[data-fps-inner-scroll]");
  return root instanceof HTMLElement ? root : null;
}

/** Card ~100% height trong viewport dưới header (tolerance 92%) */
export function isCardFullyVisible(
  el: HTMLElement,
  headerOffset: number,
  minRatio = CARD_REVEAL_VISIBLE_RATIO,
  root?: HTMLElement | null,
): boolean {
  return getCardVisibleRatio(el, headerOffset, root) >= minRatio;
}

/** Phần card đang lộ (0–1) — viewport dưới header, hoặc clip theo inner-scroll root */
export function getCardVisibleRatio(
  el: HTMLElement,
  headerOffset: number,
  root?: HTMLElement | null,
): number {
  const rect = el.getBoundingClientRect();
  if (rect.height <= 0) return 0;

  const clipTop = root ? root.getBoundingClientRect().top : headerOffset;
  const clipBottom = root
    ? root.getBoundingClientRect().bottom
    : window.innerHeight;

  const visibleTop = Math.max(rect.top, clipTop);
  const visibleBottom = Math.min(rect.bottom, clipBottom);
  const visibleHeight = Math.max(0, visibleBottom - visibleTop);

  return visibleHeight / rect.height;
}

export function isCardSubstantiallyVisible(
  el: HTMLElement,
  headerOffset: number,
  minRatio = CARD_FALLBACK_VISIBLE_RATIO,
  root?: HTMLElement | null,
): boolean {
  return getCardVisibleRatio(el, headerOffset, root) >= minRatio;
}

/** Đáy trang Home khi footer đang ẩn — hết `#home-projects` */
export function isAtHomeContentEnd(): boolean {
  const maxScroll =
    document.documentElement.scrollHeight - window.innerHeight;
  return window.scrollY >= Math.max(0, maxScroll - HOME_CONTENT_END_PX);
}

/** Đưa `#site-footer` vào đáy viewport (trang cuối + footer, giống About terminal) */
export function scrollHomeFooterIntoView(): void {
  const footer = document.getElementById("site-footer");
  if (!footer) return;

  const behavior = getHomeScrollBehavior();
  markProgrammaticScroll(behavior);
  footer.scrollIntoView({ block: "end", behavior });
}
