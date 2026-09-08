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
export type MediaPickMode = "single" | "multiple";

export type OpenMediaOptions = {
  accept?: MediaDrawerAccept;
  /** Chọn 1 ảnh — đóng drawer ngay */
  onPick?: (item: MediaItem) => void;
  /** Chọn nhiều ảnh — bấm Xác nhận ở footer drawer */
  onConfirm?: (urls: string[]) => void;
  /** URL đã chọn (multi) — hiển thị khi mở drawer */
  selectedUrls?: string[];
};

type MediaDrawerContextValue = {
  open: boolean;
  accept: MediaDrawerAccept;
  pickMode: MediaPickMode | null;
  onPick: ((item: MediaItem) => void) | null;
  onConfirm: ((urls: string[]) => void) | null;
  selectedUrls: string[];
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
  const [pickMode, setPickMode] = useState<MediaPickMode | null>(null);
  const [onPick, setOnPick] = useState<((item: MediaItem) => void) | null>(
    null,
  );
  const [onConfirm, setOnConfirm] = useState<
    ((urls: string[]) => void) | null
  >(null);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  const openMedia = useCallback((options?: OpenMediaOptions) => {
    setAccept(options?.accept ?? "all");

    if (options?.onConfirm) {
      setPickMode("multiple");
      setOnConfirm(() => options.onConfirm ?? null);
      setOnPick(null);
      setSelectedUrls(options.selectedUrls ?? []);
    } else {
      setPickMode(options?.onPick ? "single" : null);
      setOnPick(() => options?.onPick ?? null);
      setOnConfirm(null);
      setSelectedUrls([]);
    }

    setOpen(true);
  }, []);

  const closeMedia = useCallback(() => {
    setOpen(false);
    setPickMode(null);
    setOnPick(null);
    setOnConfirm(null);
    setSelectedUrls([]);
    setAccept("all");
  }, []);

  const value = useMemo(
    () => ({
      open,
      accept,
      pickMode,
      onPick,
      onConfirm,
      selectedUrls,
      openMedia,
      closeMedia,
    }),
    [
      open,
      accept,
      pickMode,
      onPick,
      onConfirm,
      selectedUrls,
      openMedia,
      closeMedia,
    ],
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
