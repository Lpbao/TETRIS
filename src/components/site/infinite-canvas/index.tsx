"use client";

import * as React from "react";
import type { InfiniteCanvasProps } from "./types";

const LazyInfiniteCanvasScene = React.lazy(() =>
  import("./scene").then((mod) => ({ default: mod.InfiniteCanvasScene })),
);

/** MIT — Codrops Infinite Canvas wrapper (lazy scene). */
export function InfiniteCanvas(props: InfiniteCanvasProps) {
  return (
    <React.Suspense fallback={null}>
      <LazyInfiniteCanvasScene {...props} />
    </React.Suspense>
  );
}

export type { InfiniteCanvasProps, MediaItem } from "./types";
