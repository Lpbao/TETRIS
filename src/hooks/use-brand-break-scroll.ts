"use client";

import { useMorphPinScroll } from "@/hooks/use-morph-pin-scroll";

const SECTION_ID = "about-brand-break";

export function useBrandBreakScroll() {
  return useMorphPinScroll(SECTION_ID);
}
