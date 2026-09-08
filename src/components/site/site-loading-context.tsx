"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SiteLoadingRun } from "@/components/site/site-loading-run";

interface SiteLoadingContextValue {
  show: () => void;
}

const SiteLoadingContext = createContext<SiteLoadingContextValue>({
  show: () => {},
});

export function SiteLoadingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ show }), [show]);

  return (
    <SiteLoadingContext.Provider value={value}>
      {open ? <SiteLoadingRun onDone={hide} /> : null}
      {children}
    </SiteLoadingContext.Provider>
  );
}

export function useSiteLoading() {
  return useContext(SiteLoadingContext);
}
