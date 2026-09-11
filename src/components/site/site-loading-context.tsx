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

export type NavigateWithLoadingOptions = {
  /** Mặc định `true`. Category tabs: `false`. */
  scroll?: boolean;
};

interface SiteLoadingContextValue {
  show: () => void;
  /**
   * Loading trước → paint → rồi `router.push`.
   * Ẩn khi URL đích khớp và `main` không còn `[data-site-loading]` (Suspense / loading.tsx xong).
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

  const hide = useCallback(() => {
    pendingHrefRef.current = null;
    setOpen(false);
    setMode("timer");
  }, []);

  const show = useCallback(() => {
    pendingHrefRef.current = null;
    setMode("timer");
    setOpen(true);
  }, []);

  const navigateWithLoading = useCallback(
    (href: string, options?: NavigateWithLoadingOptions) => {
      if (typeof window === "undefined") return;
      if (locationMatchesHref(href)) return;

      const scroll = options?.scroll ?? true;
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
    [router],
  );

  useEffect(() => {
    if (!open || mode !== "route") return;

    let raf = 0;
    const failsafe = window.setTimeout(() => {
      hide();
    }, ROUTE_LOADING_FAILSAFE_MS);

    const tick = () => {
      const pending = pendingHrefRef.current;
      if (!pending) {
        hide();
        return;
      }

      if (locationMatchesHref(pending)) {
        const busy = document.querySelector("main [data-site-loading]");
        if (!busy) {
          hide();
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
  }, [open, mode, hide]);

  const value = useMemo(
    () => ({ show, navigateWithLoading }),
    [show, navigateWithLoading],
  );

  return (
    <SiteLoadingContext.Provider value={value}>
      {open ? (
        <SiteLoadingRun
          onDone={hide}
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
