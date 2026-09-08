"use client";

import { useEffect } from "react";
import { GripVertical, Loader2 } from "lucide-react";
import { buildMediaMarkdown, type MediaItem } from "@/lib/media";
import { useMediaDrawer } from "@/components/admin/media-drawer-context";
import { useMediaInfiniteList } from "@/hooks/use-media-infinite-list";

interface MediaDragPanelProps {
  onInsert: (markdown: string) => void;
}

export function MediaDragPanel({ onInsert }: MediaDragPanelProps) {
  const { openMedia } = useMediaDrawer();
  const {
    media,
    hasMore,
    loading,
    loadingMore,
    reload,
    listRef,
    sentinelRef,
  } = useMediaInfiniteList({ enabled: true });

  useEffect(() => {
    const refresh = () => void reload();
    window.addEventListener("admin-media-changed", refresh);
    return () => window.removeEventListener("admin-media-changed", refresh);
  }, [reload]);

  const getMarkdown = (item: MediaItem) =>
    buildMediaMarkdown(item.type, item.url, item.filename);

  const handleDragStart = (e: React.DragEvent, item: MediaItem) => {
    const markdown = getMarkdown(item);
    e.dataTransfer.setData("application/x-media-markdown", markdown);
    e.dataTransfer.setData("text/plain", markdown);
    e.dataTransfer.effectAllowed = "copy";
  };

  if (loading && media.length === 0) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg border bg-muted/30">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-lg border bg-muted/20">
      <div className="border-b px-3 py-2">
        <p className="text-sm font-medium">Media</p>
        <p className="text-xs text-muted-foreground">
          Kéo vào editor hoặc double-click để chèn
        </p>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto p-2">
        {media.length === 0 ? (
          <div className="px-2 py-6 text-center">
            <p className="text-xs text-muted-foreground">
              Chưa có media. Upload từ nút Media trên header.
            </p>
            <button
              type="button"
              className="mt-2 text-xs font-medium text-primary hover:underline"
              onClick={() => openMedia()}
            >
              Mở Media
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {media.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onDoubleClick={() => onInsert(getMarkdown(item))}
                className="group flex cursor-grab items-center gap-2 rounded-md border bg-background p-2 transition-colors hover:border-primary active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                  {item.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="h-full w-full object-cover"
                      muted
                      draggable={false}
                    />
                  )}
                </div>
                <p className="min-w-0 flex-1 truncate text-xs" title={item.filename}>
                  {item.filename}
                </p>
              </div>
            ))}
            {hasMore ? (
              <div
                ref={sentinelRef}
                className="flex items-center justify-center py-2"
              >
                {loadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Cuộn để tải thêm
                  </span>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
