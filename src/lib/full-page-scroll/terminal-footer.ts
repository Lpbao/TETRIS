import { getInnerScrollElForSection } from "@/hooks/use-section-inner-scroll";
import { getHeaderOffset } from "@/lib/home-scroll";

export function getSiteFooter(): HTMLElement | null {
  return document.getElementById("site-footer");
}

/** Footer đã cuộn lên — chỉ dùng cho scroll listener (không gesture) */
export function shouldReengageFromFooterScroll(): boolean {
  const footer = getSiteFooter();
  if (!footer) return true;

  const footerTop = footer.getBoundingClientRect().top;
  return footerTop >= window.innerHeight - getHeaderOffset();
}

export function scrollToSiteFooter(reducedMotion: boolean): void {
  const footer = getSiteFooter();
  if (!footer) return;

  const top =
    footer.getBoundingClientRect().top + window.scrollY - getHeaderOffset();

  window.scrollTo({
    top: Math.max(0, top),
    behavior: reducedMotion ? "auto" : "smooth",
  });
}

/** Re-engage pager — luôn instant để tránh giật khi khóa lại overflow */
export function resetWindowScrollForPager(): void {
  window.scrollTo({ top: 0, behavior: "auto" });
}

export function scrollTerminalInnerToBottom(sectionId: string): void {
  const inner = getInnerScrollElForSection(sectionId);
  if (!inner) return;

  inner.scrollTop = inner.scrollHeight;
}

/** Chờ React commit layout released/locked trước khi scroll */
export function afterLayoutFrames(callback: () => void): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
}
