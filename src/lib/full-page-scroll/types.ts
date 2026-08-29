/** Section mode — full-page scroll pager */
export type SectionMode = "fixed" | "scrollable" | "terminal";

/** Chuyển màn: crossfade hoặc slide dọc fullPage (About / Services / Projects). */
export type FpsTransitionEffect = "crossfade" | "slide";

export type PanelSlideLane = "current" | "before" | "after";

/** Slide footer (About / Services / Projects): closed → opening → open → closing → closed */
export type FpsFooterPhase = "closed" | "opening" | "open" | "closing";

export interface SectionDef {
  id: string;
  mode: SectionMode;
}

export type PanelMotionState = "active" | "inactive" | "entering" | "exiting";

export interface InnerScrollSnapshot {
  isAtTop: boolean;
  isAtBottom: boolean;
}

export type SectionScrollDirection = "up" | "down";
