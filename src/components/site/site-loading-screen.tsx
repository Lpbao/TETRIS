import type { CSSProperties, Ref } from "react";
import {
  TETRIS_LOGO_BLOCKS,
  TETRIS_LOGO_H_RATIO,
  TETRIS_LOGO_H_RATIO_SUM,
  TETRIS_LOGO_VIEW_H,
  TETRIS_LOGO_VIEW_W,
} from "@/lib/tetris-logo-mark";

interface SiteLoadingScreenProps {
  rootRef?: Ref<HTMLDivElement>;
  /** Tự ẩn sau hold + shrink + flicker — intro/overlay, không dùng cho loading.tsx */
  autoDismiss?: boolean;
}

const loadingVars = {
  "--sl-sum-w": TETRIS_LOGO_VIEW_W,
  "--sl-sum-h": TETRIS_LOGO_VIEW_H,
  "--sl-cover-r-top": TETRIS_LOGO_H_RATIO.top,
  "--sl-cover-r-mid": TETRIS_LOGO_H_RATIO.mid,
  "--sl-cover-r-bot": TETRIS_LOGO_H_RATIO.bot,
  "--sl-cover-r-sum": TETRIS_LOGO_H_RATIO_SUM,
  "--sl-h-top": TETRIS_LOGO_BLOCKS.top.h,
  "--sl-h-mid": TETRIS_LOGO_BLOCKS.mid.h,
  "--sl-h-bot": TETRIS_LOGO_BLOCKS.bot.h,
  "--sl-w-top": TETRIS_LOGO_BLOCKS.top.w,
  "--sl-w-mid": TETRIS_LOGO_BLOCKS.mid.w,
  "--sl-w-bot": TETRIS_LOGO_BLOCKS.bot.w,
  "--sl-x-top": TETRIS_LOGO_BLOCKS.top.x,
  "--sl-x-mid": TETRIS_LOGO_BLOCKS.mid.x,
  "--sl-x-bot": TETRIS_LOGO_BLOCKS.bot.x,
} as CSSProperties;

export function SiteLoadingScreen({
  rootRef,
  autoDismiss = false,
}: SiteLoadingScreenProps) {
  return (
    <div
      ref={rootRef}
      data-site-loading
      data-site-loading-autodismiss={autoDismiss ? "" : undefined}
      role="status"
      aria-live="polite"
      aria-label="Đang tải"
      style={loadingVars}
    >
      <span data-site-loading-block="top" />
      <span data-site-loading-block="mid" />
      <span data-site-loading-block="bot" />
      <span className="sr-only">Đang tải</span>
    </div>
  );
}
