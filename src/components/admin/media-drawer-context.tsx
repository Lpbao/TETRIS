"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { MediaItem } from "@/lib/media";

export type MediaDrawerAccept = "image" | "all";

export type OpenMediaOptions = {
  onPick?: (item: MediaItem) => void;
  accept?: MediaDrawerAccept;
};

type MediaDrawerContextValue = {
  open: boolean;
  accept: MediaDrawerAccept;
  onPick: ((item: MediaItem) => void) | null;
  openMedia: (options?: OpenMediaOptions) => void;
  closeMedia: () => void;
};

const MediaDrawerContext = createContext<MediaDrawerContextValue | null>(null);

export function MediaDrawerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [accept, setAccept] = useState<MediaDrawerAccept>("all");
  const [onPick, setOnPick] = useState<((item: MediaItem) => void) | null>(
    null,
  );

  const openMedia = useCallback((options?: OpenMediaOptions) => {
    setAccept(options?.accept ?? "all");
    setOnPick(() => options?.onPick ?? null);
    setOpen(true);
  }, []);

  const closeMedia = useCallback(() => {
    setOpen(false);
    setOnPick(null);
    setAccept("all");
  }, []);

  const value = useMemo(
    () => ({ open, accept, onPick, openMedia, closeMedia }),
    [open, accept, onPick, openMedia, closeMedia],
  );

  return (
    <MediaDrawerContext.Provider value={value}>
      {children}
    </MediaDrawerContext.Provider>
  );
}

export function useMediaDrawer() {
  const context = useContext(MediaDrawerContext);
  if (!context) {
    throw new Error("useMediaDrawer must be used within MediaDrawerProvider");
  }
  return context;
}
