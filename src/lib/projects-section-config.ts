import type { SectionDef } from "@/lib/full-page-scroll/types";

/** Projects full-page scroll — 1 màn list + filter, terminal + footer auto-height */
export const PROJECTS_SECTIONS: readonly SectionDef[] = [
  { id: "projects-list", mode: "terminal" },
] as const;

export const PROJECTS_TERMINAL_SECTION_ID = "projects-list";
