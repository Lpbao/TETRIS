import type { SectionDef } from "@/lib/full-page-scroll/types";

/** LAYOUT2 — cover → canvas → mô tả/related/footer */
export const PROJECT_DETAIL_LAYOUT2_SECTIONS: readonly SectionDef[] = [
  { id: "project-detail-cover", mode: "fixed" },
  { id: "project-detail-canvas", mode: "fixed" },
  { id: "project-detail-more", mode: "scrollable" },
] as const;
