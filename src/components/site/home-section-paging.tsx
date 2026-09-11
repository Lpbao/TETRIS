"use client";

import { useEffect, useRef } from "react";
import { FPS_WHEEL_NOTCH_MIN } from "@/lib/full-page-scroll/constants";
import {
  attachHomeEnterScrollReset,
  createHomeScrollSession,
  getHomeRestState,
  resolveHomeRestStateOnScrollEnd,
  scrollToSectionAnchor,
  SECTION_AXIS_LOCK_MIN,
  SECTION_EXIT_SWIPE_MIN,
  updateHomeScrollSession,
  type HomeScrollDirection,
  type HomeScrollSession,
  WHEEL_UP_ACCUM_THRESHOLD,
} from "@/lib/home-scroll";

const SCROLL_END_FALLBACK_MS = 120;
const SCROLL_DIRECTION_THRESHOLD_PX = 2;
const WHEEL_ACCUM_RESET_MS = 150;

interface SectionPagingProps {
  heroId?: string;
  sectionId?: string;
}

type TouchOrigin = { x: number; y: number };
type SwipeAxis = "horizontal" | "vertical" | null;

/**
 * Section paging — single listener hub (P1 #8).
 * B→A gesture, wheel, session-aware limbo snap, grid-deep guard (P0 #3).
 */
export function SectionPaging({
  heroId = "hero-carousel",
  sectionId = "home-projects",
}: SectionPagingProps) {
  const scrollDirectionRef = useRef<HomeScrollDirection | null>(null);
  const lastScrollYRef = useRef(0);
  const scrollSessionRef = useRef<HomeScrollSession | null>(null);
  const scrollBurstActiveRef = useRef(false);
  const touchOriginRef = useRef<TouchOrigin | null>(null);
  const swipeAxisRef = useRef<SwipeAxis>(null);
  const atAnchorBRef = useRef(false);
  const wheelUpAccumRef = useRef(0);
  const wheelResetTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => attachHomeEnterScrollReset(), []);

  useEffect(() => {
    if (!document.getElementById(heroId)) return;

    const section = document.getElementById(sectionId);
    if (!section) return;

    lastScrollYRef.current = window.scrollY;

    const beginScrollBurst = () => {
      if (!scrollBurstActiveRef.current) {
        scrollSessionRef.current = createHomeScrollSession(sectionId, heroId);
        scrollBurstActiveRef.current = true;
        scrollDirectionRef.current = null;
      }
    };

    const resolve = () => {
      resolveHomeRestStateOnScrollEnd(
        sectionId,
        scrollDirectionRef.current,
        scrollSessionRef.current,
        heroId,
      );
      scrollSessionRef.current = null;
      scrollBurstActiveRef.current = false;
      scrollDirectionRef.current = null;
    };

    const onScroll = () => {
      beginScrollBurst();

      const scrollY = window.scrollY;
      const session = scrollSessionRef.current;
      if (session) {
        updateHomeScrollSession(session, scrollY, lastScrollYRef.current);
      }

      if (scrollY < lastScrollYRef.current - SCROLL_DIRECTION_THRESHOLD_PX) {
        scrollDirectionRef.current = "up";
      } else if (
        scrollY > lastScrollYRef.current + SCROLL_DIRECTION_THRESHOLD_PX
      ) {
        scrollDirectionRef.current = "down";
      }
      lastScrollYRef.current = scrollY;
    };

    const onScrollEnd = () => {
      onScroll();
      resolve();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", onScrollEnd, { passive: true });

    let scrollEndTimer: number | undefined;
    const onScrollFallback = () => {
      onScroll();
      window.clearTimeout(scrollEndTimer);
      scrollEndTimer = window.setTimeout(onScrollEnd, SCROLL_END_FALLBACK_MS);
    };
    window.addEventListener("scroll", onScrollFallback, { passive: true });

    const resetTouch = () => {
      touchOriginRef.current = null;
      swipeAxisRef.current = null;
      atAnchorBRef.current = false;
    };

    const lockSwipeAxis = (
      origin: TouchOrigin,
      touch: Touch,
      axisRef: { current: SwipeAxis },
    ) => {
      if (axisRef.current) return;
      const absX = Math.abs(touch.clientX - origin.x);
      const absY = Math.abs(touch.clientY - origin.y);
      if (absX >= SECTION_AXIS_LOCK_MIN || absY >= SECTION_AXIS_LOCK_MIN) {
        axisRef.current = absX >= absY ? "horizontal" : "vertical";
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      const rest = getHomeRestState(sectionId, heroId);

      if (rest !== "projects-anchor" && rest !== "grid-deep") {
        resetTouch();
        return;
      }

      const touch = event.touches[0];
      if (!touch) return;

      atAnchorBRef.current = rest === "projects-anchor";
      touchOriginRef.current = { x: touch.clientX, y: touch.clientY };
      swipeAxisRef.current = null;
    };

    const onTouchMove = (event: TouchEvent) => {
      const origin = touchOriginRef.current;
      const touch = event.touches[0];
      if (!origin || !touch) return;
      lockSwipeAxis(origin, touch, swipeAxisRef);
    };

    const onTouchEnd = (event: TouchEvent) => {
      const origin = touchOriginRef.current;
      const touch = event.changedTouches[0];
      if (!origin || !touch) {
        resetTouch();
        return;
      }

      const deltaX = touch.clientX - origin.x;
      const deltaY = touch.clientY - origin.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      const axis =
        swipeAxisRef.current ?? (absX >= absY ? "horizontal" : "vertical");
      const wasAnchorB = atAnchorBRef.current;

      resetTouch();

      if (axis !== "vertical") return;
      if (absY < SECTION_EXIT_SWIPE_MIN) return;
      /* Finger xuống = cuộn nội dung; chỉ finger lên tại B → về hero. */
      if (deltaY >= 0) return;
      if (!wasAnchorB) return;
      if (getHomeRestState(sectionId, heroId) !== "projects-anchor") return;

      scrollDirectionRef.current = "up";
      scrollToSectionAnchor(heroId);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY >= 0) {
        wheelUpAccumRef.current = 0;
        return;
      }

      if (getHomeRestState(sectionId, heroId) !== "projects-anchor") {
        wheelUpAccumRef.current = 0;
        return;
      }

      if (Math.abs(event.deltaY) < FPS_WHEEL_NOTCH_MIN) return;

      wheelUpAccumRef.current += Math.abs(event.deltaY);
      window.clearTimeout(wheelResetTimerRef.current);
      wheelResetTimerRef.current = window.setTimeout(() => {
        wheelUpAccumRef.current = 0;
      }, WHEEL_ACCUM_RESET_MS);

      if (wheelUpAccumRef.current < WHEEL_UP_ACCUM_THRESHOLD) return;

      wheelUpAccumRef.current = 0;
      scrollDirectionRef.current = "up";
      scrollToSectionAnchor(heroId);
    };

    section.addEventListener("touchstart", onTouchStart, { passive: true });
    section.addEventListener("touchmove", onTouchMove, { passive: true });
    section.addEventListener("touchend", onTouchEnd, { passive: true });
    section.addEventListener("touchcancel", resetTouch, { passive: true });
    section.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScrollEnd);
      window.removeEventListener("scroll", onScrollFallback);
      window.clearTimeout(scrollEndTimer);
      window.clearTimeout(wheelResetTimerRef.current);
      section.removeEventListener("touchstart", onTouchStart);
      section.removeEventListener("touchmove", onTouchMove);
      section.removeEventListener("touchend", onTouchEnd);
      section.removeEventListener("touchcancel", resetTouch);
      section.removeEventListener("wheel", onWheel);
    };
  }, [heroId, sectionId]);

  return null;
}

/** @deprecated Prefer `SectionPaging` — kept for home page imports */
export function HomeSectionPaging({
  sectionId = "home-projects",
}: Pick<SectionPagingProps, "sectionId">) {
  return <SectionPaging heroId="hero-carousel" sectionId={sectionId} />;
}
