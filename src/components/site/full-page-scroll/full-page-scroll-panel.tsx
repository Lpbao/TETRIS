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
  const isScrollable = mode === "scrollable";
  const isActive = motionState === "active" || motionState === "entering";
  const innerScrollEnabled =
    isScrollable &&
    (index === pager.currentIndex || motionState === "entering");

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

  return (
    <section
      id={id}
      aria-label={ariaLabel}
      aria-hidden={!isActive}
      data-section-mode={mode}
      data-fps-panel=""
      data-fps-motion={motionState}
      data-fps-slide={effect === "slide" ? slideLane : undefined}
      className={cn(
        "absolute inset-0 overflow-hidden bg-background",
        motionState === "inactive" && "pointer-events-none",
        effect === "crossfade" && "fps-panel-motion",
        effect === "slide" && "fps-slide-panel",
        className,
      )}
    >
      <div
        ref={scrollRef}
        data-fps-inner-scroll={isScrollable ? "" : undefined}
        className={cn(
          "h-full min-h-0",
          isScrollable && "overflow-y-auto overscroll-y-contain",
          !isScrollable && "overflow-hidden",
        )}
        style={{
          height: viewportHeight || "100%",
          maxHeight: viewportHeight || "100%",
        }}
      >
        <div
          className={cn(
            "flex w-full flex-col",
            isScrollable ? "min-h-full" : "h-full min-h-0",
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
