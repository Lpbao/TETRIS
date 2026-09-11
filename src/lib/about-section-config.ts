import type { SectionDef } from "@/lib/full-page-scroll/types";

/** About full-page scroll — 2 màn scrollable */
export const ABOUT_SECTIONS: readonly SectionDef[] = [
  { id: "about-hero", mode: "scrollable" },
  { id: "about-brand-break", mode: "scrollable" },
] as const;
