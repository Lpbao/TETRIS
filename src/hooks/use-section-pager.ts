"use client";

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { measureInnerScrollForSection } from "@/hooks/use-section-inner-scroll";
import {
  getPrefersReducedMotion,
  getPrefersReducedMotionServer,
  subscribePrefersReducedMotion,
} from "@/lib/mobile-paging";
import {
  FPS_SLIDE_TRANSITION_MS,
  FPS_TRANSITION_COOLDOWN_PAD_MS,
  FPS_TRANSITION_MS,
} from "@/lib/full-page-scroll/constants";
import {
  afterLayoutFrames,
  resetWindowScrollForPager,
  scrollToSiteFooter,
  shouldReengageFromFooterScroll,
} from "@/lib/full-page-scroll/terminal-footer";
import type {
  FpsFooterPhase,
  FpsTransitionEffect,
  InnerScrollSnapshot,
  SectionDef,
  SectionScrollDirection,
} from "@/lib/full-page-scroll/types";

const DEFAULT_INNER: InnerScrollSnapshot = {
  isAtTop: true,
  isAtBottom: true,
};

const PAGE_TOP_TOLERANCE_PX = 8;

export interface SectionPagerTransition {
  from: number;
  to: number;
}

export interface UseSectionPagerResult {
  sections: readonly SectionDef[];
  currentIndex: number;
  transition: SectionPagerTransition | null;
  isTransitioning: boolean;
  isTerminalReleased: boolean;
  footerPhase: FpsFooterPhase;
  isFooterOpen: boolean;
  transitionMs: number;
  getInnerScroll(index: number): InnerScrollSnapshot;
  setInnerScroll(index: number, snapshot: InnerScrollSnapshot): void;
  syncInnerScrollFromDom(index: number): InnerScrollSnapshot;
  goTo(index: number): boolean;
  goNext(): boolean;
  goPrev(): boolean;
  releaseTerminal(): void;
  reengageFromFooter(): boolean;
  reengageTerminal(): void;
  canGoNext(): boolean;
  canGoPrev(): boolean;
}

export interface UseSectionPagerOptions {
  effect?: FpsTransitionEffect;
}

export function useSectionPager(
  sections: readonly SectionDef[],
  options?: UseSectionPagerOptions,
): UseSectionPagerResult {
  const effect: FpsTransitionEffect = options?.effect ?? "crossfade";
  const reducedMotion = useSyncExternalStore(
    subscribePrefersReducedMotion,
    getPrefersReducedMotion,
    getPrefersReducedMotionServer,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transition, setTransition] = useState<SectionPagerTransition | null>(
    null,
  );
  const [isTerminalReleased, setIsTerminalReleased] = useState(false);
  const [footerPhase, setFooterPhase] = useState<FpsFooterPhase>("closed");
  const innerScrollMapRef = useRef<Map<number, InnerScrollSnapshot>>(new Map());
  const cooldownRef = useRef(false);
  const cooldownTimerRef = useRef<number | undefined>(undefined);
  const footerTimerRef = useRef<number | undefined>(undefined);

  const lastIndex = sections.length - 1;
  const durationMs =
    effect === "slide" ? FPS_SLIDE_TRANSITION_MS : FPS_TRANSITION_MS;
  const transitionMs = reducedMotion ? 0 : durationMs;
  const isFooterAnimating =
    footerPhase === "opening" || footerPhase === "closing";
  const isFooterOpen = footerPhase === "open" || footerPhase === "opening";
  const isTransitioning = transition !== null || isFooterAnimating;

  const getInnerScroll = useCallback((index: number) => {
    return innerScrollMapRef.current.get(index) ?? DEFAULT_INNER;
  }, []);

  const setInnerScroll = useCallback(
    (index: number, snapshot: InnerScrollSnapshot) => {
      innerScrollMapRef.current.set(index, snapshot);
    },
    [],
  );

  const syncInnerScrollFromDom = useCallback(
    (index: number): InnerScrollSnapshot => {
      const section = sections[index];
      if (!section) return getInnerScroll(index);

      const measured = measureInnerScrollForSection(section.id);
      if (!measured) return getInnerScroll(index);

      setInnerScroll(index, measured);
      return measured;
    },
    [getInnerScroll, sections, setInnerScroll],
  );

  const isTerminalSectionIndex = useCallback(
    (index: number) => sections[index]?.mode === "terminal",
    [sections],
  );

  const applyLayoutForIndex = useCallback(
    (index: number) => {
      if (isTerminalSectionIndex(index)) {
        setIsTerminalReleased(true);
        afterLayoutFrames(() => {
          resetWindowScrollForPager();
        });
      } else {
        setIsTerminalReleased(false);
      }
    },
    [isTerminalSectionIndex],
  );

  const beginCooldown = useCallback(() => {
    cooldownRef.current = true;
    window.clearTimeout(cooldownTimerRef.current);
    cooldownTimerRef.current = window.setTimeout(() => {
      cooldownRef.current = false;
    }, transitionMs > 0 ? transitionMs + FPS_TRANSITION_COOLDOWN_PAD_MS : 0);
  }, [transitionMs]);

  const isAtTerminalPageTop = useCallback(
    (index: number) => {
      const inner = syncInnerScrollFromDom(index);
      return (
        window.scrollY <= PAGE_TOP_TOLERANCE_PX && inner.isAtTop
      );
    },
    [syncInnerScrollFromDom],
  );

  const canGoNext = useCallback(() => {
    if (isTransitioning || cooldownRef.current) return false;
    if (footerPhase === "open") return false;

    const section = sections[currentIndex];
    if (!section) return false;

    if (isTerminalReleased && currentIndex === lastIndex) {
      const inner = syncInnerScrollFromDom(currentIndex);
      return inner.isAtBottom;
    }

    if (isTerminalReleased) return false;

    if (section.mode === "fixed") return currentIndex < lastIndex;

    const inner = syncInnerScrollFromDom(currentIndex);
    // Trang 1 màn terminal (vd. /projects): inner bottom → được release footer
    // About slide: inner bottom → slide footer như một màn
    if (section.mode === "terminal" && currentIndex === lastIndex) {
      return inner.isAtBottom;
    }
    return inner.isAtBottom && currentIndex < lastIndex;
  }, [
    currentIndex,
    footerPhase,
    isTerminalReleased,
    isTransitioning,
    lastIndex,
    sections,
    syncInnerScrollFromDom,
  ]);

  const canGoPrev = useCallback(() => {
    if (isTransitioning || cooldownRef.current) return false;

    if (footerPhase === "open") return true;

    if (isTerminalReleased && currentIndex === lastIndex) {
      if (isAtTerminalPageTop(currentIndex) && currentIndex > 0) {
        return true;
      }
      return shouldReengageFromFooterScroll();
    }

    if (currentIndex === 0) return false;

    const section = sections[currentIndex];
    if (!section) return false;

    if (section.mode === "fixed") return true;

    const inner = syncInnerScrollFromDom(currentIndex);
    return inner.isAtTop;
  }, [
    currentIndex,
    footerPhase,
    isAtTerminalPageTop,
    isTerminalReleased,
    isTransitioning,
    lastIndex,
    sections,
    syncInnerScrollFromDom,
  ]);

  const goTo = useCallback(
    (index: number): boolean => {
      if (isTransitioning || cooldownRef.current) return false;

      const clamped = Math.max(0, Math.min(index, lastIndex));
      if (clamped === currentIndex) return false;

      if (isTerminalReleased && clamped > currentIndex) return false;

      beginCooldown();
      if (effect === "slide") {
        setIsTerminalReleased(false);
        setFooterPhase("closed");
      } else {
        applyLayoutForIndex(clamped);
      }

      const finish = (nextIndex: number) => {
        setCurrentIndex(nextIndex);
        setTransition(null);
        if (effect === "slide") {
          setIsTerminalReleased(false);
          return;
        }
        applyLayoutForIndex(nextIndex);
      };

      if (transitionMs === 0) {
        finish(clamped);
        return true;
      }

      setTransition({ from: currentIndex, to: clamped });
      window.setTimeout(() => finish(clamped), transitionMs);

      return true;
    },
    [
      applyLayoutForIndex,
      beginCooldown,
      currentIndex,
      effect,
      isTerminalReleased,
      isTransitioning,
      lastIndex,
      transitionMs,
    ],
  );

  const openFooter = useCallback((): boolean => {
    if (isTransitioning || cooldownRef.current) return false;
    if (footerPhase !== "closed") return false;

    beginCooldown();
    setIsTerminalReleased(true);
    if (transitionMs === 0) {
      setFooterPhase("open");
      afterLayoutFrames(() => {
        resetWindowScrollForPager();
      });
      return true;
    }

    setFooterPhase("opening");
    afterLayoutFrames(() => {
      resetWindowScrollForPager();
    });
    window.clearTimeout(footerTimerRef.current);
    footerTimerRef.current = window.setTimeout(() => {
      setFooterPhase("open");
    }, transitionMs);
    return true;
  }, [beginCooldown, footerPhase, isTransitioning, transitionMs]);

  const closeFooter = useCallback((): boolean => {
    if (isTransitioning || cooldownRef.current) return false;
    if (footerPhase !== "open") return false;

    beginCooldown();
    if (transitionMs === 0) {
      setFooterPhase("closed");
      setIsTerminalReleased(false);
      afterLayoutFrames(() => {
        resetWindowScrollForPager();
      });
      return true;
    }

    setFooterPhase("closing");
    window.clearTimeout(footerTimerRef.current);
    footerTimerRef.current = window.setTimeout(() => {
      setFooterPhase("closed");
      setIsTerminalReleased(false);
      afterLayoutFrames(() => {
        resetWindowScrollForPager();
      });
    }, transitionMs);
    return true;
  }, [beginCooldown, footerPhase, isTransitioning, transitionMs]);

  const goNext = useCallback((): boolean => {
    if (isTransitioning || cooldownRef.current) return false;

    const section = sections[currentIndex];
    if (!section) return false;

    if (effect === "slide" && currentIndex === lastIndex) {
      if (!canGoNext()) return false;
      return openFooter();
    }

    if (isTerminalReleased && currentIndex === lastIndex) {
      if (!canGoNext()) return false;
      beginCooldown();
      afterLayoutFrames(() => {
        scrollToSiteFooter(reducedMotion);
      });
      return true;
    }

    if (!canGoNext()) return false;

    if (section.mode === "terminal" && currentIndex === lastIndex) {
      beginCooldown();
      applyLayoutForIndex(currentIndex);
      return true;
    }

    return goTo(currentIndex + 1);
  }, [
    applyLayoutForIndex,
    beginCooldown,
    canGoNext,
    currentIndex,
    effect,
    goTo,
    isTerminalReleased,
    isTransitioning,
    lastIndex,
    openFooter,
    reducedMotion,
    sections,
  ]);

  const reengageFromFooter = useCallback((): boolean => {
    if (isTransitioning || cooldownRef.current || !isTerminalReleased) {
      return false;
    }

    beginCooldown();
    afterLayoutFrames(() => {
      resetWindowScrollForPager();
    });
    return true;
  }, [beginCooldown, isTerminalReleased, isTransitioning]);

  const goPrev = useCallback((): boolean => {
    if (isTransitioning || cooldownRef.current) return false;

    if (footerPhase === "open") {
      return closeFooter();
    }

    if (isTerminalReleased && currentIndex === lastIndex) {
      if (isAtTerminalPageTop(currentIndex) && currentIndex > 0) {
        return goTo(currentIndex - 1);
      }

      if (shouldReengageFromFooterScroll()) {
        return reengageFromFooter();
      }

      return false;
    }

    if (!canGoPrev()) return false;
    return goTo(currentIndex - 1);
  }, [
    canGoPrev,
    closeFooter,
    currentIndex,
    footerPhase,
    goTo,
    isAtTerminalPageTop,
    isTerminalReleased,
    isTransitioning,
    lastIndex,
    reengageFromFooter,
  ]);

  const releaseTerminal = useCallback(() => {
    setIsTerminalReleased(true);
  }, []);

  const reengageTerminal = useCallback(() => {
    setIsTerminalReleased(false);
  }, []);

  return useMemo(
    () => ({
      sections,
      currentIndex,
      transition,
      isTransitioning,
      isTerminalReleased,
      footerPhase,
      isFooterOpen,
      transitionMs,
      getInnerScroll,
      setInnerScroll,
      syncInnerScrollFromDom,
      goTo,
      goNext,
      goPrev,
      releaseTerminal,
      reengageFromFooter,
      reengageTerminal,
      canGoNext,
      canGoPrev,
    }),
    [
      canGoNext,
      canGoPrev,
      currentIndex,
      getInnerScroll,
      goNext,
      goPrev,
      goTo,
      isFooterOpen,
      isTerminalReleased,
      isTransitioning,
      footerPhase,
      reengageFromFooter,
      reengageTerminal,
      releaseTerminal,
      sections,
      setInnerScroll,
      syncInnerScrollFromDom,
      transition,
      transitionMs,
    ],
  );
}

export type { SectionScrollDirection };
