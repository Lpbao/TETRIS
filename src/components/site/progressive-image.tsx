"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import {
  CANVAS_FULL_QUALITY,
  CANVAS_PREVIEW_QUALITY,
  optimizedImageSrc,
} from "@/lib/optimized-image-src";
import { isSvgSrc } from "@/lib/site-image";
import { cn } from "@/lib/utils";

type ProgressiveImageProps = {
  src: string;
  alt: string;
  previewWidth: number;
  fullWidth: number;
  previewQuality?: number;
  fullQuality?: number;
  /** Fetch the small image. Offscreen slides stay unloaded. */
  loadPreview?: boolean;
  /** Fetch the sharp image after the preview is visible. */
  loadFull?: boolean;
  /** High priority on the preview request (LCP). */
  priority?: boolean;
  /** Crossfade the sharp layer. Off when a parent already animates opacity. */
  fade?: boolean;
  /** `fill` = absolute crop. `flow` = preview sets height, sharp overlays. */
  layout?: "fill" | "flow";
  loading?: "eager" | "lazy";
  className?: string;
  sizes?: string;
};

export function ProgressiveImage({
  src,
  alt,
  previewWidth,
  fullWidth,
  previewQuality = CANVAS_PREVIEW_QUALITY,
  fullQuality = CANVAS_FULL_QUALITY,
  loadPreview = true,
  loadFull = true,
  priority = false,
  fade = true,
  layout = "fill",
  loading = "eager",
  className,
  sizes = "100vw",
}: ProgressiveImageProps) {
  const reduced = usePrefersReducedMotion();
  const original = src.trim();
  const previewTarget = optimizedImageSrc(original, previewWidth, previewQuality);
  const fullTarget = optimizedImageSrc(original, fullWidth, fullQuality);
  const [previewSrc, setPreviewSrc] = useState(previewTarget);
  const [fullSrc, setFullSrc] = useState(fullTarget);
  const [previewReady, setPreviewReady] = useState(false);
  const [fullReady, setFullReady] = useState(false);
  const targetKey = `${previewTarget}\0${fullTarget}`;
  const targetKeyRef = useRef(targetKey);

  useEffect(() => {
    if (targetKeyRef.current === targetKey) return;
    targetKeyRef.current = targetKey;
    setPreviewSrc(previewTarget);
    setFullSrc(fullTarget);
    setPreviewReady(false);
    setFullReady(false);
  }, [fullTarget, previewTarget, targetKey]);

  const showFull = loadFull && previewReady && previewSrc !== fullSrc;

  useEffect(() => {
    if (!showFull) setFullReady(false);
  }, [showFull]);

  if (!original || isSvgSrc(original)) {
    if (!original) return null;
    if (layout === "flow") {
      return (
        <img
          src={original}
          alt={alt}
          draggable={false}
          decoding="async"
          loading={loading}
          className={cn("block h-auto w-full", className)}
        />
      );
    }
    return (
      <Image
        src={original}
        alt={alt}
        fill
        draggable={false}
        className={className}
        sizes={sizes}
      />
    );
  }

  const layer =
    layout === "flow" ? "block h-auto w-full" : "absolute inset-0 h-full w-full";
  const fullLayer =
    layout === "flow"
      ? "absolute inset-0 !h-full !w-full"
      : layer;

  const preview = loadPreview ? (
        <img
          src={previewSrc}
          alt={fullReady ? "" : alt}
          aria-hidden={fullReady || undefined}
          draggable={false}
          decoding="async"
          loading={loading}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setPreviewReady(true)}
          onError={() => {
            if (previewSrc !== original) setPreviewSrc(original);
          }}
          className={cn(layer, className)}
        />
  ) : null;
  const full = showFull ? (
        <img
          src={fullSrc}
          data-progressive-full=""
          alt={fullReady ? alt : ""}
          aria-hidden={fullReady ? undefined : true}
          draggable={false}
          decoding="async"
          onLoad={() => setFullReady(true)}
          onError={() => {
            if (fullSrc !== original) setFullSrc(original);
          }}
          className={cn(
            fullLayer,
            className,
            !fullReady && "opacity-0",
            fade && fullReady && "opacity-100",
            fade && !reduced && "transition-opacity duration-200",
          )}
        />
  ) : null;

  if (layout === "flow") {
    return (
      <span className="relative block w-full">
        {preview}
        {full}
      </span>
    );
  }

  return (
    <>
      {preview}
      {full}
    </>
  );
}
