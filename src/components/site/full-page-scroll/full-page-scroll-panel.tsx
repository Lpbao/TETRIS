"use client";

import { cn } from "@/lib/utils";
import { useFullPageScroll } from "@/lib/full-page-scroll/context";
import { useSectionInnerScroll } from "@/hooks/use-section-inner-scroll";
import type { SectionMode } from "@/lib/full-page-scroll/types";
import { useEffect } from "react";

interface FullPageScrollPanelProps {
  index: number;
  id: string;
  mode: SectionMode;
  "aria-label"?: string;
  className?: string;
  children: React.ReactNode;
}

export function FullPageScrollPanel({
  index,
  id,
  mode,
  "aria-label": ariaLabel,
  className,
  children,
}: FullPageScrollPanelProps) {
  const { pager, viewportHeight, effect, getPanelMotionState, getPanelSlideLane } =
    useFullPageScroll();
  const motionState = getPanelMotionState(index);
  const slideLane = getPanelSlideLane(index);
  const displayIndex = pager.transition?.to ?? pager.currentIndex;
  const isScrollable = mode === "scrollable" || mode === "terminal";
  const isActive = motionState === "active" || motionState === "entering";
  const releasedTerminal =
    pager.isTerminalReleased && index === displayIndex && mode === "terminal";
  const innerScrollEnabled =
    isScrollable &&
    (releasedTerminal ||
      (!pager.isTerminalReleased &&
        (index === pager.currentIndex || motionState === "entering")));

  const { scrollRef, snapshot, sync } = useSectionInnerScroll(innerScrollEnabled);

  useEffect(() => {
    if (!innerScrollEnabled) return;
    pager.setInnerScroll(index, snapshot);
  }, [index, innerScrollEnabled, pager, snapshot]);

  useEffect(() => {
    if (motionState === "entering" && isScrollable) {
      sync();
    }
  }, [isScrollable, motionState, sync]);

  if (
    effect !== "slide" &&
    pager.isTerminalReleased &&
    index !== displayIndex
  ) {
    return null;
  }

  return (
    <section
      id={id}
      aria-label={ariaLabel}
      aria-hidden={!isActive && !releasedTerminal}
      data-section-mode={mode}
      data-section-chain-terminal={mode === "terminal" ? "" : undefined}
      data-fps-panel=""
      data-fps-motion={motionState}
      data-fps-slide={effect === "slide" ? slideLane : undefined}
      className={cn(
        "bg-background",
        releasedTerminal
          ? "relative flex min-h-0 w-full flex-1 flex-col"
          : "absolute inset-0 overflow-hidden",
        !releasedTerminal && motionState === "inactive" && "pointer-events-none",
        effect === "crossfade" && !releasedTerminal && "fps-panel-motion",
        effect === "slide" && "fps-slide-panel",
        className,
      )}
    >
      <div
        ref={scrollRef}
        data-fps-inner-scroll={isScrollable ? "" : undefined}
        className={cn(
          releasedTerminal ? "min-h-0 flex-1" : "h-full",
          isScrollable && !releasedTerminal && "overflow-y-auto overscroll-y-contain",
          !isScrollable && "overflow-hidden",
        )}
        style={
          releasedTerminal
            ? undefined
            : pager.isFooterOpen
              ? { height: "100%" }
              : { height: viewportHeight || "100%" }
        }
      >
        <div
          className={cn(
            "flex w-full flex-col",
            releasedTerminal
              ? "min-h-0 flex-1"
              : isScrollable
                ? "min-h-full"
                : "h-full min-h-0",
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
