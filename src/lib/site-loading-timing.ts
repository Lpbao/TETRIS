/** Timing tokens cho site loading — đọc từ `[data-site-loading]` CSS vars. */

const DISMISS_FALLBACK_MS = 7000;

function cssTimeToMs(value: string) {
  const token = value.trim();
  if (!token) return NaN;
  if (token.endsWith("ms")) return Number.parseFloat(token);
  if (token.endsWith("s")) return Number.parseFloat(token) * 1000;
  return Number.parseFloat(token);
}

export function readSiteLoadingDismissMs(node: Element | null): number {
  if (!node) return DISMISS_FALLBACK_MS;
  const styles = getComputedStyle(node);
  const raw =
    styles.getPropertyValue("--sl-dismiss-ms").trim() ||
    styles.getPropertyValue("--sl-autodismiss-ms").trim() ||
    "0.5s";
  const ms = cssTimeToMs(raw);
  return Number.isFinite(ms) && ms > 0 ? ms : DISMISS_FALLBACK_MS;
}
