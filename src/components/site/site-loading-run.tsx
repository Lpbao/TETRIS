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
  /** Intro / `show()` — tự ẩn theo token. Route nav: `false` (chờ data). */
  dismissOnTimer?: boolean;
}

export function SiteLoadingRun({
  onDone,
  dismissOnTimer = true,
}: SiteLoadingRunProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => subscribeSiteViewportHeight(), []);

  useEffect(() => {
    if (!dismissOnTimer) return;

    if (reducedMotion) {
      onDone();
      return;
    }

    const root = rootRef.current;
    const styles = root ? getComputedStyle(root) : null;
    const dismissMs = cssTimeToMs(
      styles?.getPropertyValue("--sl-autodismiss-ms") ?? "0.6s",
    );
    const id = window.setTimeout(
      onDone,
      Number.isFinite(dismissMs) && dismissMs > 0 ? dismissMs : 600,
    );

    return () => window.clearTimeout(id);
  }, [onDone, reducedMotion, dismissOnTimer]);

  return (
    <SiteLoadingScreen
      rootRef={rootRef}
      autoDismiss={dismissOnTimer && !reducedMotion}
    />
  );
}
