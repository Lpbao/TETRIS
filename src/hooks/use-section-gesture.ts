"use client";

import { useEffect, useRef } from "react";
import { measureInnerScroll } from "@/hooks/use-section-inner-scroll";
import type { UseSectionPagerResult } from "@/hooks/use-section-pager";
import {
  FPS_FIXED_GESTURE_MIN_PX,
  FPS_WHEEL_NOTCH_MIN,
  PARTNERS_SCROLL_SELECTOR,
} from "@/lib/full-page-scroll/constants";
import { shouldReengageFromFooterScroll } from "@/lib/full-page-scroll/terminal-footer";
import { SECTION_AXIS_LOCK_MIN } from "@/lib/home-scroll";
import type { InnerScrollSnapshot } from "@/lib/full-page-scroll/types";

type TouchOrigin = { x: number; y: number };
type SwipeAxis = "horizontal" | "vertical" | null;

interface UseSectionGestureOptions {
  pager: UseSectionPagerResult;
  enabled: boolean;
  targetRef: React.RefObject<HTMLElement | null>;
}

const INNER_SCROLL_GESTURE_PX = 2;

function isPartnersHorizontalTouch(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest(PARTNERS_SCROLL_SELECTOR));
}

function getInnerScrollEl(eventTarget: EventTarget | null): HTMLElement | null {
  if (!(eventTarget instanceof Element)) return null;
  const el = eventTarget.closest("[data-fps-inner-scroll]");
  return el instanceof HTMLElement ? el : null;
}

export function useSectionGesture({
  pager,
  enabled,
  targetRef,
}: UseSectionGestureOptions) {
  const touchOriginRef = useRef<TouchOrigin | null>(null);
  const swipeAxisRef = useRef<SwipeAxis>(null);
  const innerScrollStartTopRef = useRef<number | null>(null);
  const innerEdgeStartRef = useRef<InnerScrollSnapshot | null>(null);
  const reengagePendingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const target = targetRef.current;
    if (!target) return;

    const resetTouch = () => {
      touchOriginRef.current = null;
      swipeAxisRef.current = null;
      innerScrollStartTopRef.current = null;
      innerEdgeStartRef.current = null;
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      touchOriginRef.current = { x: touch.clientX, y: touch.clientY };
      swipeAxisRef.current = isPartnersHorizontalTouch(event.target)
        ? "horizontal"
        : null;

      const innerEl = getInnerScrollEl(event.target);
      innerScrollStartTopRef.current = innerEl?.scrollTop ?? null;
      innerEdgeStartRef.current = innerEl
        ? measureInnerScroll(innerEl)
        : pager.syncInnerScrollFromDom(pager.currentIndex);
    };

    const onTouchMove = (event: TouchEvent) => {
      const origin = touchOriginRef.current;
      const touch = event.touches[0];
      if (!origin || !touch) return;

      const deltaX = touch.clientX - origin.x;
      const deltaY = touch.clientY - origin.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (
        !swipeAxisRef.current &&
        (absX >= SECTION_AXIS_LOCK_MIN || absY >= SECTION_AXIS_LOCK_MIN)
      ) {
        swipeAxisRef.current = absX >= absY ? "horizontal" : "vertical";
      }
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

      const innerEl = getInnerScrollEl(event.target);
      const innerScrollStartTop = innerScrollStartTopRef.current;
      const startedAtEdge = innerEdgeStartRef.current;
      resetTouch();

      if (axis !== "vertical") return;
      if (absY < FPS_FIXED_GESTURE_MIN_PX) return;

      const inner = pager.syncInnerScrollFromDom(pager.currentIndex);
      const innerMoved =
        innerEl &&
        innerScrollStartTop !== null &&
        Math.abs(innerEl.scrollTop - innerScrollStartTop) >
          INNER_SCROLL_GESTURE_PX;

      if (innerMoved) {
        if (deltaY > 0 && !inner.isAtBottom) return;
        if (deltaY < 0 && !inner.isAtTop) return;
      }

      if (deltaY < 0) {
        if (startedAtEdge && !startedAtEdge.isAtTop) return;
        if (pager.canGoPrev()) pager.goPrev();
        return;
      }

      if (startedAtEdge && !startedAtEdge.isAtBottom) return;
      if (pager.canGoNext()) pager.goNext();
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < FPS_WHEEL_NOTCH_MIN) return;

      const section = pager.sections[pager.currentIndex];
      const innerScrollEl = getInnerScrollEl(event.target);
      const inner = pager.syncInnerScrollFromDom(pager.currentIndex);

      if (
        section &&
        (section.mode === "scrollable" || section.mode === "terminal") &&
        innerScrollEl &&
        inner
      ) {
        if (event.deltaY > 0 && !inner.isAtBottom) {
          innerScrollEl.scrollTop += event.deltaY;
          pager.syncInnerScrollFromDom(pager.currentIndex);
          return;
        }
        if (event.deltaY < 0 && !inner.isAtTop) {
          innerScrollEl.scrollTop += event.deltaY;
          pager.syncInnerScrollFromDom(pager.currentIndex);
          return;
        }
      }

      if (event.deltaY > 0 && pager.canGoNext()) {
        pager.goNext();
        return;
      }

      if (event.deltaY < 0 && pager.canGoPrev()) {
        pager.goPrev();
      }
    };

    target.addEventListener("touchstart", onTouchStart, { passive: true });
    target.addEventListener("touchmove", onTouchMove, { passive: true });
    target.addEventListener("touchend", onTouchEnd, { passive: true });
    target.addEventListener("touchcancel", resetTouch, { passive: true });
    target.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      target.removeEventListener("touchstart", onTouchStart);
      target.removeEventListener("touchmove", onTouchMove);
      target.removeEventListener("touchend", onTouchEnd);
      target.removeEventListener("touchcancel", resetTouch);
      target.removeEventListener("wheel", onWheel);
    };
  }, [enabled, pager, targetRef]);

  useEffect(() => {
    if (!pager.isTerminalReleased) {
      reengagePendingRef.current = false;
      return;
    }

    let touchOrigin: TouchOrigin | null = null;
    let swipeAxis: SwipeAxis = null;

    const resetReleasedTouch = () => {
      touchOrigin = null;
      swipeAxis = null;
    };

    const onReleasedTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      touchOrigin = { x: touch.clientX, y: touch.clientY };
      swipeAxis = isPartnersHorizontalTouch(event.target) ? "horizontal" : null;
    };

    const onReleasedTouchMove = (event: TouchEvent) => {
      const origin = touchOrigin;
      const touch = event.touches[0];
      if (!origin || !touch) return;

      const deltaX = touch.clientX - origin.x;
      const deltaY = touch.clientY - origin.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (
        !swipeAxis &&
        (absX >= SECTION_AXIS_LOCK_MIN || absY >= SECTION_AXIS_LOCK_MIN)
      ) {
        swipeAxis = absX >= absY ? "horizontal" : "vertical";
      }
    };

    const onReleasedTouchEnd = (event: TouchEvent) => {
      const origin = touchOrigin;
      const touch = event.changedTouches[0];
      if (!origin || !touch) {
        resetReleasedTouch();
        return;
      }

      const deltaY = touch.clientY - origin.y;
      const absY = Math.abs(deltaY);
      const axis =
        swipeAxis ??
        (Math.abs(touch.clientX - origin.x) >= absY ? "horizontal" : "vertical");

      resetReleasedTouch();

      if (axis !== "vertical") return;
      if (deltaY >= 0) return;
      if (absY < FPS_FIXED_GESTURE_MIN_PX) return;

      if (pager.canGoPrev()) pager.goPrev();
    };

    const onReleasedWheel = (event: WheelEvent) => {
      if (event.deltaY >= 0) return;
      if (Math.abs(event.deltaY) < FPS_WHEEL_NOTCH_MIN) return;
      if (pager.canGoPrev()) pager.goPrev();
    };

    const onWindowScroll = () => {
      if (!shouldReengageFromFooterScroll()) return;
      if (reengagePendingRef.current) return;
      reengagePendingRef.current = true;
      const didReengage = pager.reengageFromFooter();
      if (!didReengage) {
        reengagePendingRef.current = false;
      }
    };

    window.addEventListener("touchstart", onReleasedTouchStart, { passive: true });
    window.addEventListener("touchmove", onReleasedTouchMove, { passive: true });
    window.addEventListener("touchend", onReleasedTouchEnd, { passive: true });
    window.addEventListener("touchcancel", resetReleasedTouch, { passive: true });
    window.addEventListener("wheel", onReleasedWheel, { passive: true });
    window.addEventListener("scroll", onWindowScroll, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onReleasedTouchStart);
      window.removeEventListener("touchmove", onReleasedTouchMove);
      window.removeEventListener("touchend", onReleasedTouchEnd);
      window.removeEventListener("touchcancel", resetReleasedTouch);
      window.removeEventListener("wheel", onReleasedWheel);
      window.removeEventListener("scroll", onWindowScroll);
    };
  }, [pager, pager.isTerminalReleased]);

  useEffect(() => {
    if (pager.footerPhase !== "open") return;

    const footer = document.getElementById("site-footer");
    if (!footer) return;

    let touchOrigin: TouchOrigin | null = null;
    let swipeAxis: SwipeAxis = null;

    const resetFooterTouch = () => {
      touchOrigin = null;
      swipeAxis = null;
    };

    const onFooterTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      touchOrigin = { x: touch.clientX, y: touch.clientY };
      swipeAxis = null;
    };

    const onFooterTouchMove = (event: TouchEvent) => {
      const origin = touchOrigin;
      const touch = event.touches[0];
      if (!origin || !touch) return;
      const absX = Math.abs(touch.clientX - origin.x);
      const absY = Math.abs(touch.clientY - origin.y);
      if (
        !swipeAxis &&
        (absX >= SECTION_AXIS_LOCK_MIN || absY >= SECTION_AXIS_LOCK_MIN)
      ) {
        swipeAxis = absX >= absY ? "horizontal" : "vertical";
      }
    };

    const onFooterTouchEnd = (event: TouchEvent) => {
      const origin = touchOrigin;
      const touch = event.changedTouches[0];
      if (!origin || !touch) {
        resetFooterTouch();
        return;
      }

      const deltaY = touch.clientY - origin.y;
      const absY = Math.abs(deltaY);
      const axis =
        swipeAxis ??
        (Math.abs(touch.clientX - origin.x) >= absY ? "horizontal" : "vertical");
      resetFooterTouch();

      if (axis !== "vertical" || deltaY >= 0) return;
      if (absY < FPS_FIXED_GESTURE_MIN_PX) return;
      if (pager.canGoPrev()) pager.goPrev();
    };

    const onFooterWheel = (event: WheelEvent) => {
      if (event.deltaY >= 0) return;
      if (Math.abs(event.deltaY) < FPS_WHEEL_NOTCH_MIN) return;
      if (pager.canGoPrev()) pager.goPrev();
    };

    footer.addEventListener("touchstart", onFooterTouchStart, { passive: true });
    footer.addEventListener("touchmove", onFooterTouchMove, { passive: true });
    footer.addEventListener("touchend", onFooterTouchEnd, { passive: true });
    footer.addEventListener("touchcancel", resetFooterTouch, { passive: true });
    footer.addEventListener("wheel", onFooterWheel, { passive: true });

    return () => {
      footer.removeEventListener("touchstart", onFooterTouchStart);
      footer.removeEventListener("touchmove", onFooterTouchMove);
      footer.removeEventListener("touchend", onFooterTouchEnd);
      footer.removeEventListener("touchcancel", resetFooterTouch);
      footer.removeEventListener("wheel", onFooterWheel);
    };
  }, [pager, pager.footerPhase]);
}
