"use client";

import { useCallback, useEffect, useState } from "react";
import { getHeaderOffset } from "@/lib/home-scroll";

export interface ViewportBelowHeader {
  height: number;
  headerOffset: number;
}

export function useViewportBelowHeader(): ViewportBelowHeader {
  const [viewport, setViewport] = useState<ViewportBelowHeader>({
    height: 0,
    headerOffset: 64,
  });

  const sync = useCallback(() => {
    const headerOffset = getHeaderOffset();
    const visualHeight = window.visualViewport?.height ?? window.innerHeight;
    const height = Math.max(0, visualHeight - headerOffset);

    setViewport({ height, headerOffset });
  }, []);

  useEffect(() => {
    sync();

    window.addEventListener("resize", sync, { passive: true });
    window.addEventListener("scroll", sync, { passive: true });
    window.visualViewport?.addEventListener("resize", sync);

    const header = document.querySelector("header");
    let resizeObserver: ResizeObserver | undefined;

    if (header) {
      resizeObserver = new ResizeObserver(() => {
        sync();
      });
      resizeObserver.observe(header);
    }

    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync);
      window.visualViewport?.removeEventListener("resize", sync);
      resizeObserver?.disconnect();
    };
  }, [sync]);

  return viewport;
}
