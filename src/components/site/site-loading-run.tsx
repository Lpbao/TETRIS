"use client";

import { useEffect, useRef } from "react";
import { SiteLoadingScreen } from "@/components/site/site-loading-screen";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { subscribeSiteViewportHeight } from "@/lib/home-scroll";
import { readSiteLoadingDismissMs } from "@/lib/site-loading-timing";

interface SiteLoadingRunProps {
  onDone: () => void;
  /** Intro / `show()` — tự ẩn theo token. Route nav: `false` (chờ data rồi delay dismiss). */
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

    const dismissMs = readSiteLoadingDismissMs(rootRef.current);
    const id = window.setTimeout(onDone, dismissMs);

    return () => window.clearTimeout(id);
  }, [onDone, reducedMotion, dismissOnTimer]);

  return (
    <SiteLoadingScreen
      rootRef={rootRef}
      autoDismiss={dismissOnTimer && !reducedMotion}
    />
  );
}
