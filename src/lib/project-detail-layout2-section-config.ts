import type { SectionDef } from "@/lib/full-page-scroll/types";

/** LAYOUT2 — canvas → mô tả/related/footer (không cover) */
export const PROJECT_DETAIL_LAYOUT2_SECTIONS: readonly SectionDef[] = [
  { id: "project-detail-canvas", mode: "fixed" },
  { id: "project-detail-more", mode: "scrollable" },
] as const;
