"use client";

import { useLayoutEffect, useRef } from "react";
import { FPS_INNER_SCROLL_EDGE_PX } from "@/lib/full-page-scroll/constants";
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

function shouldSkipBlur() {
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 767px)").matches
  );
}

function isScrollerAtBottom(scroller: HTMLElement): boolean {
  const { scrollTop, scrollHeight, clientHeight } = scroller;
  const maxScrollTop = scrollHeight - clientHeight;
  if (maxScrollTop <= FPS_INNER_SCROLL_EDGE_PX) return true;
  return scrollTop >= maxScrollTop - FPS_INNER_SCROLL_EDGE_PX;
}

function clearBlur(nodes: NodeListOf<HTMLElement>) {
  nodes.forEach((node) => {
    node.style.setProperty("--about-scroll-blur-p", "1");
  });
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
    let settleTimer = 0;

    const setSettled = (settled: boolean) => {
      if (settled) root.setAttribute("data-scroll-blur-settled", "");
      else root.removeAttribute("data-scroll-blur-settled");
    };

    const cancelSettle = () => {
      if (settleTimer) {
        window.clearTimeout(settleTimer);
        settleTimer = 0;
      }
    };

    const sync = () => {
      const nodes = root.querySelectorAll<HTMLElement>("[data-scroll-blur]");
      if (shouldSkipBlur()) {
        cancelSettle();
        setSettled(true);
        clearBlur(nodes);
        return;
      }

      const atBottom = isScrollerAtBottom(scroller);

      if (atBottom) {
        if (root.hasAttribute("data-scroll-blur-settled")) {
          clearBlur(nodes);
          return;
        }
        if (!settleTimer) {
          const delay = readCssNumber(root, "--about-scroll-blur-settle-ms", 200);
          settleTimer = window.setTimeout(() => {
            settleTimer = 0;
            if (!isScrollerAtBottom(scroller)) return;
            setSettled(true);
            clearBlur(root.querySelectorAll<HTMLElement>("[data-scroll-blur]"));
          }, delay);
        }
        /* Vẫn sync blur bình thường trong lúc chờ settle */
      } else {
        cancelSettle();
        setSettled(false);
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
    if (!enabled || shouldSkipBlur()) {
      return () => {
        cancelSettle();
        if (frame) cancelAnimationFrame(frame);
      };
    }

    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const observer = new ResizeObserver(sync);
    observer.observe(scroller);
    observer.observe(root);

    return () => {
      cancelSettle();
      setSettled(false);
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return rootRef;
}
