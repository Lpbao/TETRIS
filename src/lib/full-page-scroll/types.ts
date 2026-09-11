/** Section mode — full-page scroll pager */
export type SectionMode = "fixed" | "scrollable";

/** Chuyển màn: crossfade hoặc slide dọc fullPage (About / Services / Projects). */
export type FpsTransitionEffect = "crossfade" | "slide";

export type PanelSlideLane = "current" | "before" | "after";

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
