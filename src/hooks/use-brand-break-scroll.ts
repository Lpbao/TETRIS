"use client";

import { useEffect, useRef, useState } from "react";
import { useMorphPinScroll } from "@/hooks/use-morph-pin-scroll";
import { useFullPageScroll } from "@/lib/full-page-scroll/context";
import { getHeaderOffset } from "@/lib/home-scroll";
import { getPrefersReducedMotion } from "@/lib/mobile-paging";

const SECTION_ID = "about-brand-break";
const ENTER_HOLD_FALLBACK_MS = 100;
const ENTER_DURATION_FALLBACK_MS = 450;
const ENTER_STAGGER_FALLBACK_MS = 120;
/** top(ảnh) ≈ đáy menu — desktop */
const UNDER_MENU_TOLERANCE_PX = 28;
/** Phone: header/safe-area/slide lệch nhiều hơn */
const UNDER_MENU_TOLERANCE_COARSE_PX = 72;
/** On-stage quá lâu mà geometry không khớp → vẫn enter (tránh logo kẹt 100vw trên iOS) */
const ENTER_GEOMETRY_FALLBACK_MS = 700;

export type BrandBreakLogoPhase = "waiting" | "enter" | "rest";

function readCssTimeMs(
  root: Element,
  name: string,
  fallbackMs: number,
): number {
  const raw = getComputedStyle(root).getPropertyValue(name).trim();
  if (!raw) return fallbackMs;
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return fallbackMs;
  return raw.endsWith("ms") ? value : value * 1000;
}

function readCssNumber(root: Element, name: string, fallback: number): number {
  const raw = getComputedStyle(root).getPropertyValue(name).trim();
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

function isCoarsePointer(): boolean {
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 767px)").matches
  );
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function blockEnterProgress(
  elapsedMs: number,
  delayMs: number,
  durationMs: number,
): number {
  if (elapsedMs <= delayMs) return 0;
  return easeOutCubic(
    Math.min(1, (elapsedMs - delayMs) / Math.max(1, durationMs)),
  );
}

/** Gán transform px thẳng lên khối — tránh CSS var/vw calc trên iOS. */
function applyBlockShifts(
  root: HTMLElement,
  top: number,
  mid: number,
  bot: number,
) {
  const dx = Math.round(
    (window.visualViewport?.width ?? window.innerWidth) ||
      document.documentElement.clientWidth,
  );
  const shifts = { top, mid, bot } as const;
  for (const id of ["top", "mid", "bot"] as const) {
    const el = root.querySelector(`[data-logo-block="${id}"]`);
    if (!(el instanceof HTMLElement)) continue;
    const x = (1 - shifts[id]) * dx;
    el.style.transform =
      x < 1 ? "translate3d(0,0,0)" : `translate3d(${x}px,0,0)`;
  }
}

/** Bỏ inline transform — để CSS `[data-brand-break-logo=rest]` giữ đích. */
function clearBlockInlineTransforms(root: HTMLElement) {
  for (const id of ["top", "mid", "bot"] as const) {
    const el = root.querySelector(`[data-logo-block="${id}"]`);
    if (el instanceof HTMLElement) el.style.removeProperty("transform");
  }
}

/**
 * Ảnh đã “vào chỗ” dưới menu / đỉnh inner scroller.
 * So khớp cả header và top scroller — phone hay lệch safe-area.
 */
function isBrandBreakImageReady(root: HTMLElement): boolean {
  const image = root.querySelector(
    "[data-brand-break-image], [data-morph-pin-image]",
  );
  if (!(image instanceof HTMLElement)) return false;
  const top = image.getBoundingClientRect().top;
  if (!Number.isFinite(top)) return false;

  const tol = isCoarsePointer()
    ? UNDER_MENU_TOLERANCE_COARSE_PX
    : UNDER_MENU_TOLERANCE_PX;
  const menuBottom = getHeaderOffset();
  if (Math.abs(top - menuBottom) <= tol) return true;

  const scroller = root.closest("[data-fps-inner-scroll]");
  if (scroller instanceof HTMLElement) {
    const scrollerTop = scroller.getBoundingClientRect().top;
    if (Math.abs(top - scrollerTop) <= tol) return true;
  }

  /* Panel đã current: ảnh nằm trong nửa trên viewport → đủ để enter */
  const panel = root.closest("[data-fps-panel]");
  if (
    panel instanceof HTMLElement &&
    (panel.getAttribute("data-fps-slide") === "current" ||
      panel.getAttribute("data-fps-motion") === "active")
  ) {
    const vh = window.visualViewport?.height ?? window.innerHeight;
    if (top >= -tol && top <= vh * 0.45) return true;
  }

  return false;
}

/** Sync token collapse — không ghi height inline (đánh nhau morph → giật). */
function ensureBrandBreakScrollRoom(root: HTMLElement) {
  const scroller = root.closest("[data-fps-inner-scroll]");
  const track = root.querySelector("[data-morph-pin-track]");
  if (!(scroller instanceof HTMLElement)) return;
  const vvh = Math.max(scroller.clientHeight, 1);
  const letterRatio = Math.max(
    0,
    readCssNumber(root, "--morph-pin-letter-ratio", 0.35),
  );
  const imageRatio = Math.max(
    0.01,
    readCssNumber(root, "--morph-pin-image-ratio", 1),
  );
  const alignSpeed = Math.max(
    0.01,
    readCssNumber(root, "--morph-pin-align-speed", 1.35),
  );
  const collapse = vvh * (letterRatio + imageRatio / alignSpeed);
  root.style.setProperty("--morph-pin-vvh", `${Math.round(vvh)}px`);
  root.style.setProperty("--morph-pin-collapse", `${Math.round(collapse)}px`);
  if (track instanceof HTMLElement) {
    track.style.removeProperty("height");
    track.style.removeProperty("min-height");
  }
}

export function useBrandBreakScroll() {
  return useMorphPinScroll(SECTION_ID);
}

/**
 * waiting → enter → rest.
 * Ưu tiên geometry ảnh dưới menu; fallback timeout khi on-stage (iOS hay lệch đo).
 */
export function useBrandBreakLogoEnter(
  rootRef: React.RefObject<HTMLDivElement | null>,
): BrandBreakLogoPhase {
  const { pager, getPanelMotionState } = useFullPageScroll();
  const index = pager.sections.findIndex((section) => section.id === SECTION_ID);
  const motion = index >= 0 ? getPanelMotionState(index) : "inactive";
  const onStage =
    index >= 0 &&
    (pager.currentIndex === index ||
      pager.transition?.to === index ||
      motion === "entering" ||
      motion === "active");
  const leftStage =
    index >= 0 &&
    pager.currentIndex !== index &&
    pager.transition?.to !== index &&
    motion === "inactive";

  const [phase, setPhase] = useState<BrandBreakLogoPhase>("waiting");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const startedRef = useRef(false);

  useEffect(() => {
    if (leftStage) {
      startedRef.current = false;
      const root = rootRef.current;
      if (root) applyBlockShifts(root, 0, 0, 0);
      setPhase("waiting");
      return;
    }

    if (!onStage || startedRef.current) return;
    if (phaseRef.current === "rest") return;

    const root = rootRef.current;
    if (!root) return;

    let frame = 0;
    let holdTimer = 0;
    let fallbackTimer = 0;
    let animFrame = 0;
    let startMs = 0;
    let cancelled = false;

    const holdMs = readCssTimeMs(
      root,
      "--brand-break-enter-hold",
      ENTER_HOLD_FALLBACK_MS,
    );
    const durationMs = readCssTimeMs(
      root,
      "--brand-break-enter-duration",
      ENTER_DURATION_FALLBACK_MS,
    );
    const staggerMs = readCssTimeMs(
      root,
      "--brand-break-enter-stagger",
      ENTER_STAGGER_FALLBACK_MS,
    );

    const finishRest = () => {
      if (cancelled) return;
      applyBlockShifts(root, 1, 1, 1);
      clearBlockInlineTransforms(root);
      ensureBrandBreakScrollRoom(root);
      setPhase("rest");
    };

    const tickEnter = (now: number) => {
      if (cancelled) return;
      if (!startMs) startMs = now;
      const elapsed = now - startMs;
      applyBlockShifts(
        root,
        blockEnterProgress(elapsed, 0, durationMs),
        blockEnterProgress(elapsed, staggerMs, durationMs),
        blockEnterProgress(elapsed, staggerMs * 2, durationMs),
      );
      if (elapsed >= durationMs + staggerMs * 2) {
        finishRest();
        return;
      }
      animFrame = requestAnimationFrame(tickEnter);
    };

    const beginEnter = () => {
      if (cancelled || startedRef.current) return;
      startedRef.current = true;
      window.clearTimeout(fallbackTimer);
      applyBlockShifts(root, 0, 0, 0);
      ensureBrandBreakScrollRoom(root);

      if (getPrefersReducedMotion()) {
        finishRest();
        return;
      }
      setPhase("enter");
      animFrame = requestAnimationFrame(tickEnter);
    };

    const watch = () => {
      if (cancelled || startedRef.current) return;
      if (isBrandBreakImageReady(root)) {
        holdTimer = window.setTimeout(beginEnter, holdMs);
        return;
      }
      frame = requestAnimationFrame(watch);
    };

    frame = requestAnimationFrame(watch);
    /* Geometry iOS hay không khớp — vẫn enter sau khi đã on-stage đủ lâu */
    fallbackTimer = window.setTimeout(beginEnter, ENTER_GEOMETRY_FALLBACK_MS);

    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      if (animFrame) cancelAnimationFrame(animFrame);
      window.clearTimeout(holdTimer);
      window.clearTimeout(fallbackTimer);
      if (phaseRef.current !== "rest") {
        startedRef.current = false;
      }
    };
  }, [leftStage, onStage, rootRef]);

  /* Cuộn về đỉnh ảnh: gắn lại khối ở đích (CSS rest), face theo --morph-pin-letter-x. */
  useEffect(() => {
    if (phase !== "rest") return;
    const root = rootRef.current;
    const scroller = root?.closest("[data-fps-inner-scroll]");
    if (!root || !(scroller instanceof HTMLElement)) return;

    const snapLogoHome = () => {
      if (scroller.scrollTop > 12) return;
      clearBlockInlineTransforms(root);
    };

    snapLogoHome();
    scroller.addEventListener("scroll", snapLogoHome, { passive: true });
    return () => scroller.removeEventListener("scroll", snapLogoHome);
  }, [phase, rootRef]);

  return phase;
}
