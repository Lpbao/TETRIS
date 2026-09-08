"use client";

import { useEffect, useRef } from "react";
import { SiteLoadingScreen } from "@/components/site/site-loading-screen";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { subscribeSiteViewportHeight } from "@/lib/home-scroll";

function cssTimeToMs(value: string) {
  const token = value.trim();
  if (token.endsWith("ms")) return Number.parseFloat(token);
  if (token.endsWith("s")) return Number.parseFloat(token) * 1000;
  const numeric = Number.parseFloat(token);
  return Number.isFinite(numeric) ? numeric : 0;
}

interface SiteLoadingRunProps {
  onDone: () => void;
}

export function SiteLoadingRun({ onDone }: SiteLoadingRunProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => subscribeSiteViewportHeight(), []);

  useEffect(() => {
    if (reducedMotion) {
      onDone();
      return;
    }

    const root = rootRef.current;
    const styles = root ? getComputedStyle(root) : null;
    const holdMs = cssTimeToMs(styles?.getPropertyValue("--sl-hold-ms") ?? "1s");
    const shrinkMs = cssTimeToMs(styles?.getPropertyValue("--sl-shrink-ms") ?? "1.1s");
    const flickerMs = cssTimeToMs(styles?.getPropertyValue("--sl-flicker-ms") ?? "0.84s");
    const total = holdMs + shrinkMs + flickerMs;
    const id = window.setTimeout(
      onDone,
      Number.isFinite(total) && total > 0 ? total : 2940,
    );

    return () => window.clearTimeout(id);
  }, [onDone, reducedMotion]);

  return <SiteLoadingScreen rootRef={rootRef} autoDismiss />;
}
