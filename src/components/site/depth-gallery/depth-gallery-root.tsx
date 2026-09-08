"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { DepthGalleryFallback } from "@/components/site/depth-gallery/depth-gallery-fallback";
import type { DepthGalleryPage } from "@/lib/depth-gallery/types";
import { useViewportBelowHeader } from "@/hooks/use-viewport-below-header";
import { cn } from "@/lib/utils";

const DepthGalleryCanvas = dynamic(
  () =>
    import("@/components/site/depth-gallery/depth-gallery-canvas").then(
      (mod) => mod.DepthGalleryCanvas,
    ),
  { ssr: false },
);

interface DepthGalleryRootProps {
  page: DepthGalleryPage;
  className?: string;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Phase 1: WebGL depth scroll (3 plane) hoặc fallback DOM.
 * Không bọc FullPageScrollRoot — tách khỏi pager Services.
 */
export function DepthGalleryRoot({ page, className }: DepthGalleryRootProps) {
  const { height } = useViewportBelowHeader();
  const [mode, setMode] = useState<"pending" | "webgl" | "fallback">("pending");
  const [focusIndex, setFocusIndex] = useState(0);

  useEffect(() => {
    setMode(prefersReducedMotion() ? "fallback" : "webgl");
  }, []);

  const onUnavailable = useCallback(() => setMode("fallback"), []);
  const onFocusChange = useCallback((index: number) => setFocusIndex(index), []);

  const focus = page.items[focusIndex] ?? page.items[0];
  const viewportStyle = {
    height: height > 0 ? height : "100dvh",
  } as const;

  if (mode === "fallback") {
    return (
      <div className={cn("w-full bg-background", className)}>
        <DepthGalleryFallback items={page.items} />
      </div>
    );
  }

  return (
    <div
      data-depth-gallery=""
      className={cn("relative w-full overflow-hidden bg-background", className)}
      style={viewportStyle}
    >
      {mode === "webgl" ? (
        <DepthGalleryCanvas
          items={page.items}
          className="absolute inset-0"
          onFocusChange={onFocusChange}
          onUnavailable={onUnavailable}
        />
      ) : null}

      {/* Overlay text Phase 1 — sync focus index (chưa mood blend) */}
      {focus ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-background/90 via-background/50 to-transparent px-4 pb-10 pt-24 md:px-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {focusIndex + 1} / {page.items.length}
          </p>
          <h1
            data-service-title=""
            className="mt-2 max-w-xl text-sm font-bold uppercase md:text-base"
          >
            {focus.title}
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            {focus.description}
          </p>
          <p className="mt-6 text-xs text-muted-foreground/80">
            Cuộn hoặc vuốt để đi vào chiều sâu
          </p>
        </div>
      ) : null}
    </div>
  );
}
