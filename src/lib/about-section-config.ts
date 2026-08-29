import type { SectionDef } from "@/lib/full-page-scroll/types";

/** About full-page scroll — 2 màn; hero+intro và brand-break đều inner-scroll morph */
export const ABOUT_SECTIONS: readonly SectionDef[] = [
  { id: "about-hero", mode: "scrollable" },
  { id: "about-brand-break", mode: "terminal" },
] as const;

export const ABOUT_TERMINAL_SECTION_ID = "about-brand-break";
