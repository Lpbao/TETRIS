"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSectionGesture } from "@/hooks/use-section-gesture";
import { useSectionPager } from "@/hooks/use-section-pager";
import { useViewportBelowHeader } from "@/hooks/use-viewport-below-header";
import { FullPageScrollPanel } from "@/components/site/full-page-scroll/full-page-scroll-panel";
import {
  FullPageScrollProvider,
  getPanelMotionState,
  getPanelSlideLane,
} from "@/lib/full-page-scroll/context";
import { FPS_SLIDE_EASING } from "@/lib/full-page-scroll/constants";
import type { FpsTransitionEffect, SectionDef } from "@/lib/full-page-scroll/types";
import { cn } from "@/lib/utils";

export interface FullPageScrollSection {
  def: SectionDef;
  "aria-label"?: string;
  className?: string;
  children: React.ReactNode;
}

interface FullPageScrollRootProps {
  sections: readonly SectionDef[];
  panels: FullPageScrollSection[];
  className?: string;
  /** Slide dọc fullPage. About / Services / Projects. Mặc định crossfade. */
  effect?: FpsTransitionEffect;
}

export function FullPageScrollRoot({
  sections,
  panels,
  className,
  effect = "crossfade",
}: FullPageScrollRootProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { height: viewportHeight } = useViewportBelowHeader();
  const pager = useSectionPager(sections, { effect });
  const [slideReady, setSlideReady] = useState(false);
  const [jsReady, setJsReady] = useState(false);

  useEffect(() => {
    setJsReady(true);
    const win = window as unknown as { __siteFpsReact?: boolean };
    win.__siteFpsReact = true;
    return () => {
      win.__siteFpsReact = false;
    };
  }, []);

  useSectionGesture({
    pager,
    enabled: !pager.isTransitioning,
    targetRef: viewportRef,
  });

  useEffect(() => {
    if (effect !== "slide") return;
    const frame = requestAnimationFrame(() => setSlideReady(true));
    return () => cancelAnimationFrame(frame);
  }, [effect]);

  const contextValue = useMemo(
    () => ({
      pager,
      viewportHeight,
      effect,
      getPanelMotionState: (index: number) =>
        getPanelMotionState(index, pager.currentIndex, pager.transition),
      getPanelSlideLane: (index: number) =>
        getPanelSlideLane(index, pager.currentIndex, pager.transition),
    }),
    [effect, pager, viewportHeight],
  );

  useEffect(() => {
    if (effect !== "slide") return;
    const root = document.documentElement;
    root.style.setProperty("--fps-transition-ms", `${pager.transitionMs}ms`);
    root.style.setProperty("--fps-slide-easing", FPS_SLIDE_EASING);
    return () => {
      root.style.removeProperty("--fps-transition-ms");
      root.style.removeProperty("--fps-slide-easing");
    };
  }, [effect, pager.transitionMs]);

  return (
    <FullPageScrollProvider value={contextValue}>
      <div
        data-full-page-scroll=""
        data-full-page-scroll-active={!pager.isTerminalReleased ? "" : undefined}
        data-fps-released={pager.isTerminalReleased ? "" : undefined}
        data-fps-effect={effect}
        data-fps-footer={effect === "slide" ? pager.footerPhase : undefined}
        data-fps-slide-ready={effect === "slide" && slideReady ? "" : undefined}
        data-fps-js={jsReady ? "" : undefined}
        className={cn(
          "relative w-full",
          pager.isTerminalReleased && "flex min-h-0 flex-1 flex-col",
          className,
        )}
        style={{
          height: pager.isTerminalReleased ? undefined : viewportHeight || "100dvh",
          ["--fps-transition-ms" as string]: `${pager.transitionMs}ms`,
          ["--fps-slide-easing" as string]: FPS_SLIDE_EASING,
        }}
      >
        <div
          ref={viewportRef}
          data-fps-viewport=""
          className={cn(
            "relative w-full",
            pager.isTerminalReleased
              ? "flex min-h-0 flex-1 flex-col"
              : "h-full overflow-hidden",
          )}
        >
          {panels.map((panel, index) => (
            <FullPageScrollPanel
              key={panel.def.id}
              index={index}
              id={panel.def.id}
              mode={panel.def.mode}
              aria-label={panel["aria-label"]}
              className={panel.className}
            >
              {panel.children}
            </FullPageScrollPanel>
          ))}
        </div>
      </div>
    </FullPageScrollProvider>
  );
}
