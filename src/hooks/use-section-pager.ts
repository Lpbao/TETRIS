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
import type {
  FpsTransitionEffect,
  InnerScrollSnapshot,
  SectionDef,
  SectionScrollDirection,
} from "@/lib/full-page-scroll/types";

const DEFAULT_INNER: InnerScrollSnapshot = {
  isAtTop: true,
  isAtBottom: true,
};

export interface SectionPagerTransition {
  from: number;
  to: number;
}

export interface UseSectionPagerResult {
  sections: readonly SectionDef[];
  currentIndex: number;
  transition: SectionPagerTransition | null;
  isTransitioning: boolean;
  transitionMs: number;
  getInnerScroll(index: number): InnerScrollSnapshot;
  setInnerScroll(index: number, snapshot: InnerScrollSnapshot): void;
  syncInnerScrollFromDom(index: number): InnerScrollSnapshot;
  goTo(index: number): boolean;
  goNext(): boolean;
  goPrev(): boolean;
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
  const innerScrollMapRef = useRef<Map<number, InnerScrollSnapshot>>(new Map());
  const cooldownRef = useRef(false);
  const cooldownTimerRef = useRef<number | undefined>(undefined);

  const lastIndex = sections.length - 1;
  const durationMs =
    effect === "slide" ? FPS_SLIDE_TRANSITION_MS : FPS_TRANSITION_MS;
  const transitionMs = reducedMotion ? 0 : durationMs;
  const isTransitioning = transition !== null;

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

  const beginCooldown = useCallback(() => {
    cooldownRef.current = true;
    window.clearTimeout(cooldownTimerRef.current);
    cooldownTimerRef.current = window.setTimeout(() => {
      cooldownRef.current = false;
    }, transitionMs > 0 ? transitionMs + FPS_TRANSITION_COOLDOWN_PAD_MS : 0);
  }, [transitionMs]);

  const canGoNext = useCallback(() => {
    if (isTransitioning || cooldownRef.current) return false;

    const section = sections[currentIndex];
    if (!section) return false;

    if (section.mode === "fixed") return currentIndex < lastIndex;

    const inner = syncInnerScrollFromDom(currentIndex);
    return inner.isAtBottom && currentIndex < lastIndex;
  }, [
    currentIndex,
    isTransitioning,
    lastIndex,
    sections,
    syncInnerScrollFromDom,
  ]);

  const canGoPrev = useCallback(() => {
    if (isTransitioning || cooldownRef.current) return false;
    if (currentIndex === 0) return false;

    const section = sections[currentIndex];
    if (!section) return false;

    if (section.mode === "fixed") return true;

    const inner = syncInnerScrollFromDom(currentIndex);
    return inner.isAtTop;
  }, [
    currentIndex,
    isTransitioning,
    sections,
    syncInnerScrollFromDom,
  ]);

  const goTo = useCallback(
    (index: number): boolean => {
      if (isTransitioning || cooldownRef.current) return false;

      const clamped = Math.max(0, Math.min(index, lastIndex));
      if (clamped === currentIndex) return false;

      beginCooldown();

      const finish = (nextIndex: number) => {
        setCurrentIndex(nextIndex);
        setTransition(null);
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
      beginCooldown,
      currentIndex,
      isTransitioning,
      lastIndex,
      transitionMs,
    ],
  );

  const goNext = useCallback((): boolean => {
    if (!canGoNext()) return false;
    return goTo(currentIndex + 1);
  }, [canGoNext, currentIndex, goTo]);

  const goPrev = useCallback((): boolean => {
    if (!canGoPrev()) return false;
    return goTo(currentIndex - 1);
  }, [canGoPrev, currentIndex, goTo]);

  return useMemo(
    () => ({
      sections,
      currentIndex,
      transition,
      isTransitioning,
      transitionMs,
      getInnerScroll,
      setInnerScroll,
      syncInnerScrollFromDom,
      goTo,
      goNext,
      goPrev,
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
      isTransitioning,
      sections,
      setInnerScroll,
      syncInnerScrollFromDom,
      transition,
      transitionMs,
    ],
  );
}

export type { SectionScrollDirection };
