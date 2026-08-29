"use client";

import { useLayoutEffect, useRef } from "react";
import { useFullPageScroll } from "@/lib/full-page-scroll/context";

function readCssNumber(
  root: HTMLElement,
  name: string,
  fallback: number,
): number {
  const raw = getComputedStyle(root).getPropertyValue(name);
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** 0 = max blur (dưới màn), 1 = nét (đã vào vùng `--about-scroll-blur-to`). */
export function useScrollYBlur(sectionId: string) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { pager, getPanelMotionState } = useFullPageScroll();
  const index = pager.sections.findIndex((section) => section.id === sectionId);
  const motion = index >= 0 ? getPanelMotionState(index) : "inactive";
  const enabled = motion === "active" || motion === "entering";

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const scroller = root.closest("[data-fps-inner-scroll]");
    if (!(scroller instanceof HTMLElement)) return;

    let frame = 0;

    const sync = () => {
      const nodes = root.querySelectorAll<HTMLElement>("[data-scroll-blur]");
      if (prefersReducedMotion()) {
        nodes.forEach((node) => {
          node.style.setProperty("--about-scroll-blur-p", "1");
        });
        return;
      }

      const clip = scroller.getBoundingClientRect();
      if (clip.height < 1) return;

      const fromRatio = readCssNumber(root, "--about-scroll-blur-from", 1);
      const toRatio = readCssNumber(root, "--about-scroll-blur-to", 0.4);
      const startY = clip.top + clip.height * fromRatio;
      const endY = clip.top + clip.height * toRatio;
      const span = startY - endY || 1;

      nodes.forEach((node) => {
        const top = node.getBoundingClientRect().top;
        node.style.setProperty(
          "--about-scroll-blur-p",
          String(clamp01((startY - top) / span)),
        );
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    };

    sync();
    if (!enabled) return;

    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const observer = new ResizeObserver(sync);
    observer.observe(scroller);
    observer.observe(root);

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return rootRef;
}
