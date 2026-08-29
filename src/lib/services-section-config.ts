import type { SectionDef } from "@/lib/full-page-scroll/types";

/** Fallback ids khi CMS có đúng 3 dịch vụ mặc định */
export const SERVICES_SECTIONS: readonly SectionDef[] = [
  { id: "service-branding", mode: "fixed" },
  { id: "service-architecture", mode: "fixed" },
  { id: "service-construction", mode: "terminal" },
] as const;

export const SERVICES_TERMINAL_SECTION_ID = "service-construction";

/** Màn cuối luôn terminal — footer auto-height (fullPage fp-auto-height). */
export function getServicesSections(count: number): SectionDef[] {
  return Array.from({ length: count }, (_, index) => ({
    id: SERVICES_SECTIONS[index]?.id ?? `service-${index}`,
    mode: index === count - 1 ? "terminal" : "fixed",
  }));
}
