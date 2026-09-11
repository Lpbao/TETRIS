const MENU_PANEL_ID = "site-mobile-menu";

/** Tắt restore scroll của trình duyệt — mỗi lần vào trang luôn từ đầu. */
export function disableBrowserScrollRestoration(): void {
  try {
    window.history.scrollRestoration = "manual";
  } catch {
    /* Safari private / unsupported */
  }
}

export function clearSiteMenuHash(): void {
  if (window.location.hash !== `#${MENU_PANEL_ID}`) return;
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}`,
  );
}

/** Scroll + DOM attrs về trạng thái trang mới (không đụng overlay loading). */
export function resetSitePage(): void {
  disableBrowserScrollRestoration();
  clearSiteMenuHash();

  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  document.querySelectorAll("[data-fps-inner-scroll]").forEach((node) => {
    if (node instanceof HTMLElement) node.scrollTop = 0;
  });
  document.querySelectorAll("[data-hero-track]").forEach((node) => {
    if (node instanceof HTMLElement) node.scrollLeft = 0;
  });

  document.body.style.overflow = "";
}
