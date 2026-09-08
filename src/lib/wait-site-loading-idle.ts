const PROJECT_ENTER_DELAY_FALLBACK_MS = 100;
const PROJECT_COVER_FADE_FALLBACK_MS = 600;
/** iOS: overlay/autodismiss có thể không về opacity đúng 0 — không chờ vô hạn. */
export const PROJECT_ENTER_FAILSAFE_MS = 4000;

function readCssTimeMs(
  node: Element | null,
  property: string,
  fallbackMs: number,
): number {
  if (!node) return fallbackMs;
  const raw = getComputedStyle(node).getPropertyValue(property).trim();
  if (!raw) return fallbackMs;
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) return fallbackMs;
  return raw.endsWith("ms") ? value : value * 1000;
}

export function readProjectEnterDelayMs(node: Element | null): number {
  return readCssTimeMs(node, "--project-enter-delay", PROJECT_ENTER_DELAY_FALLBACK_MS);
}

export function readProjectCoverFadeMs(node: Element | null): number {
  return readCssTimeMs(node, "--project-cover-fade-ms", PROJECT_COVER_FADE_FALLBACK_MS);
}

function isSiteLoadingBlocking(): boolean {
  const nodes = document.querySelectorAll("[data-site-loading]");
  for (const node of nodes) {
    if (!(node instanceof HTMLElement)) continue;
    const style = getComputedStyle(node);
    if (style.display === "none") continue;
    if (style.visibility === "hidden") continue;
    const opacity = Number.parseFloat(style.opacity || "1");
    if (!Number.isFinite(opacity) || opacity < 0.05) continue;
    return true;
  }
  return false;
}

/** Chờ overlay loading hết (gỡ hoặc ẩn) — rồi mới chạy enter-once card. */
export function waitUntilSiteLoadingIdle(onIdle: () => void): () => void {
  if (typeof document === "undefined") return () => {};

  let cancelled = false;
  let settled = false;
  let frameA = 0;
  let frameB = 0;
  let poll = 0;
  let failsafe = 0;

  const cleanupWatch = () => {
    window.clearInterval(poll);
    window.clearTimeout(failsafe);
    observer.disconnect();
  };

  const finish = () => {
    if (cancelled || settled) return;
    settled = true;
    cleanupWatch();
    frameA = window.requestAnimationFrame(() => {
      frameB = window.requestAnimationFrame(() => {
        if (!cancelled) onIdle();
      });
    });
  };

  const check = () => {
    if (isSiteLoadingBlocking()) return;
    finish();
  };

  const observer = new MutationObserver(check);

  if (!isSiteLoadingBlocking()) {
    finish();
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameA);
      window.cancelAnimationFrame(frameB);
    };
  }

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
  });
  poll = window.setInterval(check, 50);
  failsafe = window.setTimeout(finish, PROJECT_ENTER_FAILSAFE_MS);

  return () => {
    cancelled = true;
    cleanupWatch();
    window.cancelAnimationFrame(frameA);
    window.cancelAnimationFrame(frameB);
  };
}
