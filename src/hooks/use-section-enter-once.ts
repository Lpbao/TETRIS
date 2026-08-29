"use client";

import { useState } from "react";
import { useFullPageScroll } from "@/lib/full-page-scroll/context";

/** Latch: animation chỉ chạy lần đầu section xuất hiện. */
export function useSectionEnterOnce(sectionId: string): "in" | "out" {
  const { pager, getPanelMotionState } = useFullPageScroll();
  const index = pager.sections.findIndex((section) => section.id === sectionId);
  const motion = index >= 0 ? getPanelMotionState(index) : "inactive";
  const visible = motion === "entering" || motion === "active";
  const [hasEntered, setHasEntered] = useState(false);
  if (visible && !hasEntered) {
    setHasEntered(true);
  }
  return hasEntered ? "in" : "out";
}
