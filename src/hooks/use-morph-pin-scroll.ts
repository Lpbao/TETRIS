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

function readPositiveRatio(
  root: HTMLElement,
  name: string,
  fallback: number,
): number {
  const value = readCssNumber(root, name, fallback);
  return value > 0 ? value : fallback;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Đáy photo đã paint (object-contain), không phải đáy khung wrapper. */
function measureVisualImageBottom(wrapper: HTMLElement): number {
  const img = wrapper.querySelector("img");
  const fallback = wrapper.getBoundingClientRect().bottom;
  if (!(img instanceof HTMLImageElement)) return fallback;
  if (img.naturalWidth < 1 || img.naturalHeight < 1) return fallback;

  const rect = img.getBoundingClientRect();
  const style = getComputedStyle(img);
  const scaleX = img.offsetWidth > 0 ? rect.width / img.offsetWidth : 1;
  const scaleY = img.offsetHeight > 0 ? rect.height / img.offsetHeight : 1;
  const padT = (Number.parseFloat(style.paddingTop) || 0) * scaleY;
  const padB = (Number.parseFloat(style.paddingBottom) || 0) * scaleY;
  const padL = (Number.parseFloat(style.paddingLeft) || 0) * scaleX;
  const padR = (Number.parseFloat(style.paddingRight) || 0) * scaleX;

  const contentTop = rect.top + padT;
  const contentW = Math.max(0, rect.width - padL - padR);
  const contentH = Math.max(0, rect.height - padT - padB);
  if (contentW < 1 || contentH < 1) return fallback;

  const fit = Math.min(
    contentW / img.naturalWidth,
    contentH / img.naturalHeight,
  );
  const renderedH = img.naturalHeight * fit;
  const extraH = contentH - renderedH;

  let posY = 0.5;
  const pos = style.objectPosition.trim().split(/\s+/);
  const yToken = pos[1] ?? pos[0];
  if (yToken === "top") posY = 0;
  else if (yToken === "bottom") posY = 1;
  else if (yToken === "center") posY = 0.5;
  else if (yToken?.endsWith("%")) posY = Number.parseFloat(yToken) / 100;
  if (!Number.isFinite(posY)) posY = 0.5;

  return contentTop + extraH * posY + renderedH;
}

function measurePhotoClipPercent(root: HTMLElement): number {
  const pin = root.querySelector("[data-morph-pin-pin]");
  const image = root.querySelector("[data-morph-pin-image]");
  if (!(pin instanceof HTMLElement) || !(image instanceof HTMLElement)) {
    return 0;
  }

  const pinRect = pin.getBoundingClientRect();
  if (pinRect.height < 1) return 0;

  const photoBottom = measureVisualImageBottom(image);
  const clipPx = Math.max(0, pinRect.bottom - photoBottom);
  return Math.min(100, (clipPx / pinRect.height) * 100);
}

function measureContentShiftPx(
  root: HTMLElement,
  titleGapPx: number,
  appliedShiftPx: number,
): number | null {
  const image = root.querySelector("[data-morph-pin-image]");
  const title = root.querySelector(
    "[data-morph-pin-content] [data-section-title]",
  );
  if (!(image instanceof HTMLElement) || !(title instanceof HTMLElement)) {
    return null;
  }

  const naturalTop = title.getBoundingClientRect().top - appliedShiftPx;
  return measureVisualImageBottom(image) + titleGapPx - naturalTop;
}

/** Chữ (tùy chọn) → ảnh scale → pin dưới menu đến khi title cách photo `--morph-pin-title-gap`. */
export function useMorphPinScroll(sectionId: string) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frozenTopRef = useRef<number | null>(null);
  const frozenShrinkRef = useRef<number | null>(null);
  const frozenShiftRef = useRef<number | null>(null);
  const shiftRef = useRef(0);
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
      const vvh = scroller.clientHeight;
      if (vvh <= 0) return;

      const letterRatio = Math.max(
        0,
        readCssNumber(root, "--morph-pin-letter-ratio", 0),
      );
      const imageRatio = readPositiveRatio(
        root,
        "--morph-pin-image-ratio",
        1,
      );
      const shrinkSpeed = readPositiveRatio(
        root,
        "--morph-pin-shrink-speed",
        1.2,
      );
      const topSpeed = readPositiveRatio(root, "--morph-pin-top-speed", 0.8);
      const alignSpeed = readPositiveRatio(
        root,
        "--morph-pin-align-speed",
        1.2,
      );
      const titleGapPx = readCssNumber(root, "--morph-pin-title-gap", 0);

      const letterDist = vvh * letterRatio;
      const imageDist = vvh * imageRatio;
      const scrollTop = scroller.scrollTop;

      const pLetter = letterDist > 0 ? clamp01(scrollTop / letterDist) : 1;
      const lettersOut = pLetter >= 1;
      let pImage =
        lettersOut && imageDist > 0
          ? clamp01((scrollTop - letterDist) / imageDist)
          : 0;
      let pShrink = lettersOut ? clamp01(pImage * shrinkSpeed) : 0;
      let pTop = lettersOut ? clamp01(pImage * topSpeed) : 0;
      const pAlign = lettersOut ? clamp01(pImage * alignSpeed) : 0;
      const unstickDist =
        letterDist + (alignSpeed > 0 ? imageDist / alignSpeed : imageDist);

      const titleArrived = lettersOut && pAlign >= 1;
      const imageMorphDone = lettersOut && (pShrink >= 1 || titleArrived);

      if (!imageMorphDone) {
        frozenTopRef.current = null;
        frozenShrinkRef.current = null;
        frozenShiftRef.current = null;
      } else {
        if (frozenTopRef.current === null) {
          frozenTopRef.current = pTop;
        }
        if (frozenShrinkRef.current === null) {
          frozenShrinkRef.current = pShrink;
        }
        pTop = frozenTopRef.current;
        pShrink = frozenShrinkRef.current;
      }

      let phase = "letter";
      if (imageMorphDone) phase = "pin";
      else if (lettersOut) phase = "image";

      root.dataset.morphPinPhase = phase;
      root.style.setProperty("--morph-pin-vvh", `${vvh}px`);
      root.style.setProperty("--morph-pin-p-letter", String(pLetter));
      root.style.setProperty("--morph-pin-p-image", String(pImage));
      root.style.setProperty("--morph-pin-p-shrink", String(pShrink));
      root.style.setProperty("--morph-pin-p-top", String(pTop));

      let contentShift = 0;
      if (lettersOut) {
        const targetShift = measureContentShiftPx(
          root,
          titleGapPx,
          shiftRef.current,
        );
        if (targetShift !== null) {
          if (imageMorphDone) {
            if (frozenShiftRef.current === null) {
              frozenShiftRef.current = targetShift;
            }
            contentShift = frozenShiftRef.current;
          } else {
            contentShift = pAlign * targetShift;
          }
        }
      }

      shiftRef.current = contentShift;
      const collapse = unstickDist;

      root.style.setProperty("--morph-pin-collapse", `${collapse}px`);
      root.style.setProperty("--morph-pin-content-shift", `${contentShift}px`);
      root.style.setProperty(
        "--morph-pin-photo-clip",
        lettersOut ? `${measurePhotoClipPercent(root)}%` : "0%",
      );
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    };

    const img = root.querySelector("[data-morph-pin-image] img");
    const onImageLoad = () => sync();

    sync();
    if (!enabled) {
      return;
    }

    scroller.addEventListener("scroll", onScroll, { passive: true });
    img?.addEventListener("load", onImageLoad);
    const observer = new ResizeObserver(sync);
    observer.observe(scroller);
    observer.observe(root);

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      img?.removeEventListener("load", onImageLoad);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return rootRef;
}
