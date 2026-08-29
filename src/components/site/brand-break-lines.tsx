"use client";

import { useLayoutEffect, useRef } from "react";

export const BRAND_BREAK_LINES = [
  { id: "tetris", text: "TETRIS" },
  { id: "design", text: "DESIGN" },
] as const;

export type BrandBreakLineId = (typeof BRAND_BREAK_LINES)[number]["id"];

const MEASURE_FONT_PX = 100;
const LINE_INSET_FALLBACK_PX = 16;
const LINE_HEIGHT_FALLBACK_VH = 30;

function getScreenWidth(root: HTMLElement): number {
  const section = root.closest("[data-brand-break]");
  if (section instanceof HTMLElement && section.clientWidth > 0) {
    return section.clientWidth;
  }
  return document.documentElement.clientWidth;
}

function parseCssPxOrVh(raw: string, fallbackPx: number): number {
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return fallbackPx;
  if (raw.trim().endsWith("vh")) {
    return (window.innerHeight * value) / 100;
  }
  return value;
}

function getLineInsetPx(sample: HTMLElement): number {
  const raw = getComputedStyle(sample).getPropertyValue(
    "--brand-break-line-inset",
  );
  return parseCssPxOrVh(raw, LINE_INSET_FALLBACK_PX);
}

function getLineTargetHeightPx(root: HTMLElement): number {
  const raw = getComputedStyle(root).getPropertyValue(
    "--brand-break-line-height",
  );
  return parseCssPxOrVh(
    raw,
    (window.innerHeight * LINE_HEIGHT_FALLBACK_VH) / 100,
  );
}

function getLineTargetWidth(root: HTMLElement, sample: HTMLElement): number {
  const inset = getLineInsetPx(sample);
  return Math.max(0, getScreenWidth(root) - inset * 2);
}

function fitLineToWidth(el: HTMLElement, targetWidth: number) {
  if (targetWidth <= 0) return;
  el.style.fontSize = `${MEASURE_FONT_PX}px`;
  const measured = el.scrollWidth;
  if (measured <= 0) return;
  el.style.fontSize = `${(MEASURE_FONT_PX * targetWidth) / measured}px`;
}

function fitLineHeightToVh(el: HTMLElement, targetHeight: number) {
  if (targetHeight <= 0) return;
  const naturalHeight = el.offsetHeight;
  if (naturalHeight <= 0) return;
  el.style.setProperty(
    "--brand-break-line-scale-y",
    String(targetHeight / naturalHeight),
  );
}

export function BrandBreakLines() {
  const rootRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Partial<Record<BrandBreakLineId, HTMLElement | null>>>(
    {},
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const fit = () => {
      const sample = lineRefs.current[BRAND_BREAK_LINES[0].id];
      const targetWidth = sample
        ? getLineTargetWidth(root, sample)
        : Math.max(0, getScreenWidth(root) - LINE_INSET_FALLBACK_PX * 2);
      const targetHeight = getLineTargetHeightPx(root);
      for (const line of BRAND_BREAK_LINES) {
        const el = lineRefs.current[line.id];
        if (!el) continue;
        fitLineToWidth(el, targetWidth);
        fitLineHeightToVh(el, targetHeight);
      }
    };

    fit();
    void document.fonts.ready.then(fit);

    const observer = new ResizeObserver(fit);
    observer.observe(root);
    const section = root.closest("[data-brand-break]");
    if (section instanceof HTMLElement) observer.observe(section);

    window.addEventListener("resize", fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      data-brand-break-lines=""
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    >
      {BRAND_BREAK_LINES.map((line) => (
        <p key={line.id} data-brand-break-line={line.id}>
          <span
            ref={(node) => {
              lineRefs.current[line.id] = node;
            }}
            className="inline-block whitespace-nowrap font-[family-name:var(--font-logo)] uppercase leading-none text-brand-red"
            style={{ fontSize: "16.6vw" }}
          >
            {line.text}
          </span>
        </p>
      ))}
    </div>
  );
}
