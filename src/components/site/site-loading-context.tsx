"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { SiteLoadingRun } from "@/components/site/site-loading-run";
import { readSiteLoadingDismissMs } from "@/lib/site-loading-timing";

export type NavigateWithLoadingOptions = {
  /** Mặc định `true`. Category tabs: `false`. */
  scroll?: boolean;
};

interface SiteLoadingContextValue {
  show: () => void;
  /**
   * Loading trước → paint → rồi `router.push`.
   * Ẩn khi URL đích khớp và `main` không còn `[data-site-loading]` (Suspense / loading.tsx xong),
   * rồi chờ `--sl-dismiss-ms` (7s) trước khi unmount overlay.
   */
  navigateWithLoading: (
    href: string,
    options?: NavigateWithLoadingOptions,
  ) => void;
}

const SiteLoadingContext = createContext<SiteLoadingContextValue>({
  show: () => {},
  navigateWithLoading: () => {},
});

type LoadingMode = "timer" | "route";

function locationMatchesHref(href: string): boolean {
  const target = new URL(href, window.location.origin);
  if (target.pathname !== window.location.pathname) return false;
  const targetQuery = target.searchParams.toString();
  const currentQuery = new URLSearchParams(window.location.search).toString();
  return targetQuery === currentQuery;
}

const ROUTE_LOADING_FAILSAFE_MS = 15_000;

export function SiteLoadingProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<LoadingMode>("timer");
  const pendingHrefRef = useRef<string | null>(null);
  const dismissTimerRef = useRef<number | null>(null);
  const dismissScheduledRef = useRef(false);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current != null) {
      window.clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const hideNow = useCallback(() => {
    clearDismissTimer();
    dismissScheduledRef.current = false;
    pendingHrefRef.current = null;
    setOpen(false);
    setMode("timer");
  }, [clearDismissTimer]);

  /** Route ready / failsafe: chờ `--sl-dismiss-ms` rồi unmount. */
  const hideAfterDismissDelay = useCallback(() => {
    if (dismissScheduledRef.current) return;
    dismissScheduledRef.current = true;
    clearDismissTimer();
    const root = document.querySelector("[data-site-loading]");
    const dismissMs = readSiteLoadingDismissMs(root);
    dismissTimerRef.current = window.setTimeout(hideNow, dismissMs);
  }, [clearDismissTimer, hideNow]);

  const show = useCallback(() => {
    clearDismissTimer();
    dismissScheduledRef.current = false;
    pendingHrefRef.current = null;
    setMode("timer");
    setOpen(true);
  }, [clearDismissTimer]);

  const navigateWithLoading = useCallback(
    (href: string, options?: NavigateWithLoadingOptions) => {
      if (typeof window === "undefined") return;
      if (locationMatchesHref(href)) return;

      const scroll = options?.scroll ?? true;
      clearDismissTimer();
      dismissScheduledRef.current = false;
      pendingHrefRef.current = href;

      flushSync(() => {
        setMode("route");
        setOpen(true);
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          router.push(href, { scroll });
        });
      });
    },
    [router, clearDismissTimer],
  );

  useEffect(() => {
    if (!open || mode !== "route") return;

    let raf = 0;
    let finished = false;
    const failsafe = window.setTimeout(() => {
      finished = true;
      hideAfterDismissDelay();
    }, ROUTE_LOADING_FAILSAFE_MS);

    const tick = () => {
      if (finished || dismissScheduledRef.current) return;

      const pending = pendingHrefRef.current;
      if (!pending) {
        finished = true;
        hideAfterDismissDelay();
        return;
      }

      if (locationMatchesHref(pending)) {
        const busy = document.querySelector("main [data-site-loading]");
        if (!busy) {
          finished = true;
          hideAfterDismissDelay();
          return;
        }
      }

      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
    };
  }, [open, mode, hideAfterDismissDelay]);

  useEffect(() => () => clearDismissTimer(), [clearDismissTimer]);

  const value = useMemo(
    () => ({ show, navigateWithLoading }),
    [show, navigateWithLoading],
  );

  return (
    <SiteLoadingContext.Provider value={value}>
      {open ? (
        <SiteLoadingRun
          onDone={hideNow}
          dismissOnTimer={mode === "timer"}
        />
      ) : null}
      {children}
    </SiteLoadingContext.Provider>
  );
}

export function useSiteLoading() {
  return useContext(SiteLoadingContext);
}
