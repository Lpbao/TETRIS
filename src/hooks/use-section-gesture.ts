"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import {
  getInnerScrollElForSection,
  measureInnerScroll,
} from "@/hooks/use-section-inner-scroll";
import type { UseSectionPagerResult } from "@/hooks/use-section-pager";
import {
  FPS_FIXED_GESTURE_MIN_PX,
  FPS_INNER_SCROLL_EDGE_PX,
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
/** Room tối thiểu mới được coi là “có cuộn” / chặn rubber-band */
const MIN_SCROLL_ROOM_PX = 64;

function isPartnersHorizontalTouch(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest(PARTNERS_SCROLL_SELECTOR));
}

function isSiteChromeTouch(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(".site-header") ||
      target.closest("#site-mobile-menu") ||
      target.closest("[data-site-loading]"),
  );
}

function getInnerScrollEl(eventTarget: EventTarget | null): HTMLElement | null {
  if (!(eventTarget instanceof Element)) return null;
  const el = eventTarget.closest("[data-fps-inner-scroll]");
  return el instanceof HTMLElement ? el : null;
}

/** Inner của màn đang active — không lấy hero (querySelector đầu tiên). */
function resolveInnerScroll(
  eventTarget: EventTarget | null,
  pager: UseSectionPagerResult,
): HTMLElement | null {
  const section = pager.sections[pager.currentIndex];
  const currentInner = section
    ? getInnerScrollElForSection(section.id)
    : null;

  const fromTarget = getInnerScrollEl(eventTarget);
  if (fromTarget && currentInner && currentInner.contains(fromTarget)) {
    return fromTarget;
  }
  if (fromTarget && section) {
    const panel = document.getElementById(section.id);
    if (panel?.contains(fromTarget)) return fromTarget;
  }
  return currentInner ?? fromTarget;
}

/** Chặn rubber-band chỉ khi thật sự ở đáy nội dung có room cuộn. */
function shouldBlockOverscroll(innerEl: HTMLElement): boolean {
  const maxScroll = innerEl.scrollHeight - innerEl.clientHeight;
  if (maxScroll < MIN_SCROLL_ROOM_PX) return false;

  const live = measureInnerScroll(innerEl);
  if (!live.isAtBottom) return false;

  /* Brand-break: gần đỉnh hoặc logo chưa rest → không bao giờ preventDefault */
  const brand = innerEl.querySelector("[data-brand-break]");
  if (brand instanceof HTMLElement) {
    if (brand.getAttribute("data-brand-break-logo") !== "rest") return false;
    if (innerEl.scrollTop < MIN_SCROLL_ROOM_PX) return false;
  }

  return true;
}

/** Brand-break: footer chỉ sau logo rest. */
function canOpenAboutBrandBreakFooter(): boolean {
  const brand = document
    .getElementById("about-brand-break")
    ?.querySelector("[data-brand-break]");
  if (!(brand instanceof HTMLElement)) return true;
  return brand.getAttribute("data-brand-break-logo") === "rest";
}

export function useSectionGesture({
  pager,
  enabled: _enabled,
  targetRef,
}: UseSectionGestureOptions) {
  const pagerRef = useRef(pager);
  const touchOriginRef = useRef<TouchOrigin | null>(null);
  const swipeAxisRef = useRef<SwipeAxis>(null);
  const innerScrollStartTopRef = useRef<number | null>(null);
  const innerEdgeStartRef = useRef<InnerScrollSnapshot | null>(null);
  const innerTakeoverRef = useRef(false);
  const reengagePendingRef = useRef(false);

  useLayoutEffect(() => {
    pagerRef.current = pager;
  }, [pager]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const resetTouch = () => {
      touchOriginRef.current = null;
      swipeAxisRef.current = null;
      innerScrollStartTopRef.current = null;
      innerEdgeStartRef.current = null;
      innerTakeoverRef.current = false;
    };

    const onTouchStart = (event: TouchEvent) => {
      if (pagerRef.current.isTerminalReleased) {
        resetTouch();
        return;
      }
      if (isSiteChromeTouch(event.target)) {
        resetTouch();
        return;
      }
      if (!target.contains(event.target as Node)) return;
      const touch = event.touches[0];
      if (!touch) return;

      touchOriginRef.current = { x: touch.clientX, y: touch.clientY };
      swipeAxisRef.current = isPartnersHorizontalTouch(event.target)
        ? "horizontal"
        : null;

      const innerEl = resolveInnerScroll(event.target, pagerRef.current);
      innerScrollStartTopRef.current = innerEl?.scrollTop ?? null;
      innerEdgeStartRef.current = innerEl
        ? measureInnerScroll(innerEl)
        : pagerRef.current.syncInnerScrollFromDom(
            pagerRef.current.currentIndex,
          );
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

      const innerEl = resolveInnerScroll(event.target, pagerRef.current);
      const startTop = innerScrollStartTopRef.current;
      /* Mobile/coarse: để native inner scroll — takeover + morph-pin → giật/stuck. */
      const preferNativeInnerScroll =
        window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(max-width: 767px)").matches;

      if (
        !preferNativeInnerScroll &&
        innerEl &&
        startTop !== null &&
        swipeAxisRef.current === "vertical" &&
        absY >= SECTION_AXIS_LOCK_MIN
      ) {
        const nativeMoved = Math.abs(innerEl.scrollTop - startTop) > 2;
        const goingDown = deltaY < 0;
        const goingUp = deltaY > 0;
        const live = measureInnerScroll(innerEl);
        const maxScroll = innerEl.scrollHeight - innerEl.clientHeight;
        const hasRoom = maxScroll >= MIN_SCROLL_ROOM_PX;
        /* Chỉ takeover khi native không cuộn — đừng force (đánh nhau → giật). */
        if (
          !innerTakeoverRef.current &&
          !nativeMoved &&
          hasRoom &&
          ((goingDown && !live.isAtBottom) || (goingUp && !live.isAtTop))
        ) {
          innerTakeoverRef.current = true;
        }
        if (innerTakeoverRef.current) {
          const nextTop = Math.max(
            0,
            Math.min(maxScroll, startTop - deltaY),
          );
          innerEl.scrollTop = nextTop;
          if (event.cancelable) event.preventDefault();
          return;
        }
      }

      if (
        innerEl &&
        deltaY < 0 &&
        absY >= SECTION_AXIS_LOCK_MIN &&
        shouldBlockOverscroll(innerEl) &&
        event.cancelable
      ) {
        event.preventDefault();
      }
    };

    const finishTouch = (event: TouchEvent) => {
      if (isSiteChromeTouch(event.target)) {
        resetTouch();
        return;
      }
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

      const innerEl = resolveInnerScroll(event.target, pagerRef.current);
      const innerScrollStartTop = innerScrollStartTopRef.current;
      const startedAtBottom = innerEdgeStartRef.current?.isAtBottom ?? false;
      const startedAtTop = innerEdgeStartRef.current?.isAtTop ?? false;
      resetTouch();

      const p = pagerRef.current;
      /* Released / footer: giao handler riêng — tránh nuốt vuốt đóng footer. */
      if (
        p.isTerminalReleased ||
        p.footerPhase === "open" ||
        p.footerPhase === "opening" ||
        p.footerPhase === "closing"
      ) {
        return;
      }
      if (p.isTransitioning) return;
      if (axis !== "vertical") return;
      if (absY < FPS_FIXED_GESTURE_MIN_PX) return;

      const inner = p.syncInnerScrollFromDom(p.currentIndex);
      const lastIndex = p.sections.length - 1;
      const isLastTerminal =
        p.currentIndex === lastIndex &&
        p.sections[lastIndex]?.mode === "terminal";
      const innerMoved =
        innerEl &&
        innerScrollStartTop !== null &&
        Math.abs(innerEl.scrollTop - innerScrollStartTop) >
          INNER_SCROLL_GESTURE_PX;

      /*
       * Finger lên (deltaY < 0) = xuống nội dung / màn sau / footer.
       * Finger xuống (deltaY > 0) = lên nội dung / màn trước.
       * Không return sớm ở last-terminal khi deltaY > 0 — trước đây nuốt goPrev
       * (Services panel ngắn: isAtTop && isAtBottom → mọi vuốt dính nhánh đáy).
       */
      if (deltaY < 0) {
        if (innerMoved && !startedAtBottom && !inner.isAtBottom) {
          return;
        }
        if (!(startedAtBottom || inner.isAtBottom)) return;

        if (isLastTerminal) {
          const sectionId = p.sections[p.currentIndex]?.id;
          if (
            sectionId === "about-brand-break" &&
            !canOpenAboutBrandBreakFooter()
          ) {
            return;
          }
          if (p.canGoNext()) p.goNext();
          return;
        }

        p.goNext();
        return;
      }

      if (innerMoved && !startedAtTop && !inner.isAtTop) {
        return;
      }
      if (startedAtTop || inner.isAtTop) {
        p.goPrev();
      }
    };

    const onWheel = (event: WheelEvent) => {
      const p = pagerRef.current;
      if (
        p.isTerminalReleased ||
        p.footerPhase === "open" ||
        p.footerPhase === "opening" ||
        p.footerPhase === "closing"
      ) {
        return;
      }
      if (p.isTransitioning) return;
      if (Math.abs(event.deltaY) < FPS_WHEEL_NOTCH_MIN) return;

      const section = p.sections[p.currentIndex];
      const innerScrollEl = resolveInnerScroll(event.target, p);
      const inner = p.syncInnerScrollFromDom(p.currentIndex);

      if (
        section &&
        (section.mode === "scrollable" || section.mode === "terminal") &&
        innerScrollEl &&
        inner
      ) {
        if (event.deltaY > 0 && !inner.isAtBottom) {
          innerScrollEl.scrollTop += event.deltaY;
          p.syncInnerScrollFromDom(p.currentIndex);
          return;
        }
        if (event.deltaY < 0 && !inner.isAtTop) {
          innerScrollEl.scrollTop += event.deltaY;
          p.syncInnerScrollFromDom(p.currentIndex);
          return;
        }
      }

      if (event.deltaY > 0) {
        const lastIndex = p.sections.length - 1;
        const isLastTerminal =
          p.currentIndex === lastIndex &&
          p.sections[lastIndex]?.mode === "terminal";
        if (isLastTerminal && inner.isAtBottom) {
          if (
            section?.id === "about-brand-break" &&
            !canOpenAboutBrandBreakFooter()
          ) {
            return;
          }
          if (p.canGoNext()) p.goNext();
          return;
        }
        p.goNext();
        return;
      }

      p.goPrev();
    };

    document.addEventListener("touchstart", onTouchStart, {
      capture: true,
      passive: true,
    });
    document.addEventListener("touchmove", onTouchMove, {
      capture: true,
      passive: false,
    });
    document.addEventListener("touchend", finishTouch, {
      capture: true,
      passive: true,
    });
    document.addEventListener("touchcancel", finishTouch, {
      capture: true,
      passive: true,
    });
    target.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart, true);
      document.removeEventListener("touchmove", onTouchMove, true);
      document.removeEventListener("touchend", finishTouch, true);
      document.removeEventListener("touchcancel", finishTouch, true);
      target.removeEventListener("wheel", onWheel);
    };
  }, [targetRef]);

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
      if (absY < FPS_FIXED_GESTURE_MIN_PX) return;

      /* Footer hiện: vuốt lên (docs) hoặc vuốt xuống / scroll lên nội dung → ẩn */
      if (pager.footerPhase === "open" || pager.footerPhase === "opening") {
        if (pager.canGoPrev()) pager.goPrev();
        return;
      }

      if (deltaY >= 0) return;
      if (pager.canGoPrev()) pager.goPrev();
    };

    const onReleasedWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < FPS_WHEEL_NOTCH_MIN) return;
      if (pager.footerPhase === "open" || pager.footerPhase === "opening") {
        if (pager.canGoPrev()) pager.goPrev();
        return;
      }
      if (event.deltaY >= 0) return;
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
    if (pager.footerPhase !== "open" && pager.footerPhase !== "opening") return;

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

      if (axis !== "vertical") return;
      if (absY < FPS_FIXED_GESTURE_MIN_PX) return;
      /* Vuốt lên hoặc xuống trên footer → đóng */
      if (pager.canGoPrev()) pager.goPrev();
    };

    const onFooterWheel = (event: WheelEvent) => {
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
