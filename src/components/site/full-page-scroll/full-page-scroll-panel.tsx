"use client";

import { cn } from "@/lib/utils";
import { useFullPageScroll } from "@/lib/full-page-scroll/context";
import { useSectionInnerScroll } from "@/hooks/use-section-inner-scroll";
import {
  FPS_FOOTER_REVEAL_DELAY_MS,
  FPS_INNER_SCROLL_EDGE_PX,
} from "@/lib/full-page-scroll/constants";
import type { SectionMode } from "@/lib/full-page-scroll/types";
import { useEffect, useRef, useState } from "react";

function readFooterRevealDelayMs(node: Element | null): number {
  const root =
    node?.closest("[data-full-page-scroll]") ?? document.documentElement;
  const raw = getComputedStyle(root)
    .getPropertyValue("--fps-footer-reveal-delay")
    .trim();
  if (!raw) return FPS_FOOTER_REVEAL_DELAY_MS;
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) return FPS_FOOTER_REVEAL_DELAY_MS;
  return raw.endsWith("ms") ? value : value * 1000;
}

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

  const lastIndex = pager.sections.length - 1;
  const isLastTerminal = mode === "terminal" && index === lastIndex;
  const userReachedEndRef = useRef(false);
  /** Brand-break: theo dõi logo rest — tránh race isAtBottom trước rest rồi không bao giờ mở footer */
  const [brandLogoRest, setBrandLogoRest] = useState(false);

  useEffect(() => {
    if (!innerScrollEnabled) {
      userReachedEndRef.current = false;
    }
  }, [innerScrollEnabled]);

  useEffect(() => {
    if (!isLastTerminal || !innerScrollEnabled) return;
    const inner = document
      .getElementById(id)
      ?.querySelector("[data-fps-inner-scroll]");
    if (!(inner instanceof HTMLElement)) return;

    /* Chỉ tính khi thực sự cuộn — không dùng touchstart (vuốt vào màn cũng bị đánh dấu). */
    const markReached = () => {
      if (inner.scrollTop > FPS_INNER_SCROLL_EDGE_PX) {
        userReachedEndRef.current = true;
      }
    };
    markReached();
    inner.addEventListener("scroll", markReached, { passive: true });
    return () => {
      inner.removeEventListener("scroll", markReached);
    };
  }, [id, innerScrollEnabled, isLastTerminal]);

  useEffect(() => {
    if (id !== "about-brand-break" || !innerScrollEnabled) {
      setBrandLogoRest(false);
      return;
    }
    const brandBreak = document
      .getElementById(id)
      ?.querySelector("[data-brand-break]");
    if (!(brandBreak instanceof HTMLElement)) {
      setBrandLogoRest(false);
      return;
    }

    const read = () => {
      setBrandLogoRest(
        brandBreak.getAttribute("data-brand-break-logo") === "rest",
      );
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(brandBreak, {
      attributes: true,
      attributeFilter: ["data-brand-break-logo"],
    });
    return () => observer.disconnect();
  }, [id, innerScrollEnabled]);

  useEffect(() => {
    if (!isLastTerminal || !innerScrollEnabled) return;
    if (pager.isTerminalReleased || pager.footerPhase !== "closed") return;
    if (!snapshot.isAtBottom) return;

    const inner = document
      .getElementById(id)
      ?.querySelector("[data-fps-inner-scroll]");
    if (!(inner instanceof HTMLElement)) return;

    const maxScroll = inner.scrollHeight - inner.clientHeight;
    const canScroll = maxScroll > FPS_INNER_SCROLL_EDGE_PX;
    if (!canScroll) return;

    if (id === "about-brand-break") {
      if (!brandLogoRest) return;
      if (!userReachedEndRef.current) return;
    } else if (!userReachedEndRef.current) {
      return;
    }

    const delay = readFooterRevealDelayMs(inner);
    const timer = window.setTimeout(() => {
      pager.goNext();
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    brandLogoRest,
    id,
    innerScrollEnabled,
    isLastTerminal,
    pager,
    snapshot.isAtBottom,
  ]);

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
          releasedTerminal ? "min-h-0 flex-1" : "h-full min-h-0",
          isScrollable && !releasedTerminal && "overflow-y-auto overscroll-y-contain",
          !isScrollable && "overflow-hidden",
        )}
        style={
          releasedTerminal
            ? undefined
            : {
                height: viewportHeight || "100%",
                maxHeight: viewportHeight || "100%",
              }
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
