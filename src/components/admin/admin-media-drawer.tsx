"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search, Trash2, Upload, X } from "lucide-react";
import { useMediaDrawer } from "@/components/admin/media-drawer-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet } from "@/components/ui/sheet";
import { useMediaInfiniteList } from "@/hooks/use-media-infinite-list";
import { validateMediaFile, type MediaItem } from "@/lib/media";
import { cn } from "@/lib/utils";
import {
  MEDIA_TITLE_CONFLICT_ERROR,
  MEDIA_TITLE_MAX,
  applySeedTitles,
  applyTitleConflicts,
  commitSeedTitle,
  type MediaTitleConflict,
  updatePendingTitle,
} from "@/lib/media-upload-titles";

type PendingUpload = {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  dirty: boolean;
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function displayTitle(item: MediaItem) {
  return item.title?.trim() || item.filename;
}

function revokeAll(items: PendingUpload[]) {
  for (const item of items) {
    URL.revokeObjectURL(item.previewUrl);
  }
}

function readTitleConflicts(payload: unknown): MediaTitleConflict[] {
  if (!payload || typeof payload !== "object") return [];
  const conflicts = (payload as { conflicts?: unknown }).conflicts;
  if (!Array.isArray(conflicts)) return [];
  return conflicts.filter((item): item is MediaTitleConflict => {
    if (!item || typeof item !== "object") return false;
    const row = item as Partial<MediaTitleConflict>;
    return (
      typeof row.index === "number" &&
      typeof row.title === "string" &&
      typeof row.suggested === "string"
    );
  });
}

function payloadError(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }
  return null;
}

export function AdminMediaDrawer() {
  const {
    open,
    accept,
    pickMode,
    onPick,
    onConfirm,
    selectedUrls,
    closeMedia,
  } = useMediaDrawer();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [seedId, setSeedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conflictIds, setConflictIds] = useState<Set<string>>(() => new Set());
  const [dragging, setDragging] = useState(false);
  const [pickerSelection, setPickerSelection] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    media,
    hasMore,
    loading,
    loadingMore,
    error: listError,
    reload,
    removeItem,
    listRef,
    sentinelRef,
  } = useMediaInfiniteList({
    enabled: open,
    query: debouncedQuery,
    type: accept === "image" ? "image" : undefined,
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (open) return;
    setPending((items) => {
      revokeAll(items);
      return [];
    });
    setSeedId(null);
    setError(null);
    setConflictIds(new Set());
    setPickerSelection([]);
  }, [open]);

  useEffect(() => {
    if (!open || pickMode !== "multiple") return;
    setPickerSelection(selectedUrls);
  }, [open, pickMode, selectedUrls]);

  const queueFiles = (files: FileList | File[] | null) => {
    const list = files ? Array.from(files) : [];
    if (!list.length) return;

    const allowed = list.filter((file) => {
      if (accept === "image") return file.type.startsWith("image/");
      return file.type.startsWith("image/") || file.type.startsWith("video/");
    });
    if (!allowed.length) return;

    const accepted: File[] = [];
    const rejected: string[] = [];
    for (const file of allowed) {
      const check = validateMediaFile(file);
      if (check.valid) accepted.push(file);
      else rejected.push(`${file.name}: ${check.error}`);
    }
    if (rejected.length) {
      setError(rejected.join(" "));
    }
    if (!accepted.length) return;

    const additions: PendingUpload[] = accepted.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      title: "",
      dirty: false,
    }));

    setPending((prev) => {
      const next = [...prev, ...additions];
      if (!seedId) return next;
      const seed = next.find((item) => item.id === seedId);
      if (!seed?.title.trim()) return next;
      return applySeedTitles(next, seedId, seed.title);
    });
    if (!rejected.length) setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleTitleChange = (itemId: string, value: string) => {
    setPending(updatePendingTitle(pending, itemId, value));
    setConflictIds((prev) => {
      if (!prev.has(itemId)) return prev;
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const handleTitleBlur = (itemId: string, value: string) => {
    const withValue = updatePendingTitle(pending, itemId, value);
    const result = commitSeedTitle(withValue, itemId);
    if (!result.committed) {
      setPending(withValue);
      return;
    }
    setPending(result.pending);
    setSeedId(result.seedId);
  };

  const removePending = (id: string) => {
    const removed = pending.find((item) => item.id === id);
    if (removed) URL.revokeObjectURL(removed.previewUrl);

    const next = pending.filter((item) => item.id !== id);
    const nextSeed = seedId === id ? null : seedId;
    const seed = nextSeed
      ? next.find((item) => item.id === nextSeed)
      : undefined;

    setSeedId(nextSeed);
    setPending(
      seed && nextSeed
        ? applySeedTitles(next, nextSeed, seed.title)
        : next,
    );
    setConflictIds((prev) => {
      if (!prev.has(id)) return prev;
      const nextIds = new Set(prev);
      nextIds.delete(id);
      return nextIds;
    });
  };

  const handleUploadPending = async () => {
    if (!pending.length) return;
    if (pending.some((item) => !item.title.trim())) {
      setError("Nhập title cho mọi file trước khi upload");
      return;
    }

    setUploading(true);
    setError(null);
    setConflictIds(new Set());

    const uploadedIds: string[] = [];
    let uploadConflict: { id: string; suggested: string } | null = null;

    try {
      const checkRes = await fetch("/api/media/check-titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titles: pending.map((item) => item.title.trim()),
        }),
      });
      const checkResult: unknown = await checkRes.json().catch(() => null);

      if (checkRes.status === 409) {
        const conflicts = readTitleConflicts(checkResult);
        const ids = new Set(
          conflicts
            .map((conflict) => pending[conflict.index]?.id)
            .filter((id): id is string => Boolean(id)),
        );
        setPending(applyTitleConflicts(pending, conflicts));
        setConflictIds(ids);
        setError(
          `${payloadError(checkResult) ?? MEDIA_TITLE_CONFLICT_ERROR}. Đã điền tên gợi ý vào ô trùng, kiểm tra rồi bấm Upload lại.`,
        );
        return;
      }

      if (!checkRes.ok) {
        throw new Error(
          payloadError(checkResult) ?? "Không thể kiểm tra title ảnh",
        );
      }

      for (const item of pending) {
        const formData = new FormData();
        formData.append("file", item.file);
        formData.append("title", item.title.trim());

        const res = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const result: unknown = await res.json().catch(() => null);
          if (res.status === 409) {
            const suggested = readTitleConflicts(result)[0]?.suggested;
            if (suggested) {
              uploadConflict = { id: item.id, suggested };
            }
          }
          throw new Error(
            payloadError(result) ?? `Upload thất bại: ${item.file.name}`,
          );
        }

        uploadedIds.push(item.id);
        URL.revokeObjectURL(item.previewUrl);
      }
      setPending([]);
      setSeedId(null);
      setConflictIds(new Set());
      await reload();
      window.dispatchEvent(new Event("admin-media-changed"));
    } catch (err) {
      const remaining = pending
        .filter((item) => !uploadedIds.includes(item.id))
        .map((item) =>
          uploadConflict && item.id === uploadConflict.id
            ? { ...item, title: uploadConflict.suggested, dirty: true }
            : item,
        );
      setPending(remaining);
      if (seedId && !remaining.some((item) => item.id === seedId)) {
        setSeedId(null);
      }
      if (uploadConflict) {
        setConflictIds(new Set([uploadConflict.id]));
        setError(
          `${err instanceof Error ? err.message : MEDIA_TITLE_CONFLICT_ERROR}. Đã điền tên gợi ý vào ô trùng, kiểm tra rồi bấm Upload lại.`,
        );
      } else {
        setError(err instanceof Error ? err.message : "Upload thất bại");
      }
      await reload();
      window.dispatchEvent(new Event("admin-media-changed"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async (item: MediaItem) => {
    const confirmed = window.confirm(`Xóa "${displayTitle(item)}"?`);
    if (!confirmed) return;

    setDeletingId(item.id);
    try {
      const res = await fetch(`/api/media/${item.id}`, { method: "DELETE" });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Xóa thất bại");
      }
      removeItem(item.id);
      window.dispatchEvent(new Event("admin-media-changed"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xóa thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  const visibleMedia =
    accept === "image" ? media.filter((item) => item.type === "image") : media;

  const multiPickerMode = pickMode === "multiple";
  const singlePickerMode = pickMode === "single";
  const pickerMode = multiPickerMode || singlePickerMode;
  const titlesReady =
    pending.length > 0 && pending.every((item) => item.title.trim());

  const togglePickerSelection = (url: string) => {
    setPickerSelection((prev) =>
      prev.includes(url) ? prev.filter((item) => item !== url) : [...prev, url],
    );
  };

  const visibleUrls = visibleMedia.map((item) => item.url);
  const allVisibleSelected =
    visibleUrls.length > 0 &&
    visibleUrls.every((url) => pickerSelection.includes(url));

  const toggleSelectVisible = () => {
    if (allVisibleSelected) {
      const visibleSet = new Set(visibleUrls);
      setPickerSelection((prev) => prev.filter((url) => !visibleSet.has(url)));
      return;
    }

    setPickerSelection((prev) => {
      const existing = new Set(prev);
      const additions = visibleUrls.filter((url) => !existing.has(url));
      return additions.length ? [...prev, ...additions] : prev;
    });
  };

  const handleConfirmSelection = () => {
    onConfirm?.(pickerSelection);
    closeMedia();
  };

  const resolvePickerLabel = (url: string) => {
    const item = media.find((entry) => entry.url === url);
    return item ? displayTitle(item) : url.split("/").pop() ?? url;
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && closeMedia()} title="Media">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="space-y-4 border-b px-4 py-4">
          {singlePickerMode && (
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              Chọn một ảnh trong danh sách để gắn vào form.
            </p>
          )}
          {multiPickerMode && (
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              Chọn nhiều ảnh — lọc title rồi bấm Chọn tất cả, hoặc chọn từng dòng. Xác nhận để gắn vào form.
            </p>
          )}

          {(error || listError) && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error || listError}
            </div>
          )}

          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
              dragging ? "border-primary bg-muted/50" : "border-input"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              queueFiles(e.dataTransfer.files);
            }}
          >
            <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-medium">Kéo thả hoặc chọn file</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Chọn file, nhập title, rồi Upload. JPEG/PNG/WebP tối đa 50MB (server nén). SVG 10MB, video 100MB.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={
                accept === "image"
                  ? "image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                  : "image/jpeg,image/png,image/gif,image/webp,image/svg+xml,video/mp4,video/webm,video/quicktime"
              }
              multiple
              className="hidden"
              onChange={(e) => queueFiles(e.target.files)}
            />
            <Button
              type="button"
              size="sm"
              className="mt-3"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              Chọn file
            </Button>
          </div>

          {pending.length > 0 && (
            <div className="space-y-3">
              <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {pending.map((item, index) => (
                  <li
                    key={item.id}
                    className="flex gap-3 rounded-lg border p-2"
                  >
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded bg-muted">
                      {item.file.type.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <video
                          src={item.previewUrl}
                          className="h-full w-full object-cover"
                          muted
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate text-xs text-muted-foreground">
                        {item.file.name} · {formatSize(item.file.size)}
                      </p>
                      <Label
                        htmlFor={`pending-title-${item.id}`}
                        className="sr-only"
                      >
                        Title ảnh {index + 1}
                      </Label>
                      <Input
                        id={`pending-title-${item.id}`}
                        value={item.title}
                        onChange={(e) =>
                          handleTitleChange(item.id, e.target.value)
                        }
                        onBlur={(e) => handleTitleBlur(item.id, e.target.value)}
                        placeholder={`Title ảnh ${index + 1}`}
                        maxLength={MEDIA_TITLE_MAX}
                        disabled={uploading}
                        aria-invalid={conflictIds.has(item.id)}
                        className={
                          conflictIds.has(item.id)
                            ? "border-destructive focus-visible:ring-destructive"
                            : undefined
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => removePending(item.id)}
                      disabled={uploading}
                      aria-label={`Gỡ ${item.file.name} khỏi hàng đợi`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                className="w-full"
                disabled={uploading || !titlesReady}
                onClick={() => void handleUploadPending()}
              >
                {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                Upload {pending.length} file
              </Button>
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-4 py-4">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Lọc theo title ảnh"
              className="pl-9"
            />
          </div>

          {multiPickerMode && visibleMedia.length > 0 && !loading && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mb-3 w-full"
              onClick={toggleSelectVisible}
            >
              {allVisibleSelected
                ? `Bỏ chọn đã tải (${visibleUrls.length})`
                : `Chọn tất cả đã tải (${visibleUrls.length})`}
            </Button>
          )}

          {multiPickerMode && (
            <div className="mb-3 space-y-2 rounded-lg border bg-muted/30 p-3">
              <p className="text-xs font-medium">
                Đang chọn ({pickerSelection.length})
              </p>
              {pickerSelection.length > 0 ? (
                <ul className="flex gap-2 overflow-x-auto pb-1">
                  {pickerSelection.map((url) => (
                    <li key={url} className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={resolvePickerLabel(url)}
                        title={resolvePickerLabel(url)}
                        className="h-16 w-16 rounded border object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -right-1 -top-1 h-5 w-5"
                        onClick={() => togglePickerSelection(url)}
                        aria-label={`Bỏ chọn ${resolvePickerLabel(url)}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Chưa chọn ảnh nào — bấm ảnh trong danh sách bên dưới.
                </p>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : visibleMedia.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {debouncedQuery
                ? "Không tìm thấy media với title này."
                : "Chưa có media nào."}
            </p>
          ) : (
            <div
              ref={listRef}
              className="min-h-0 flex-1 overflow-y-auto pr-1"
            >
              <ul className="space-y-2">
                {visibleMedia.map((item) => {
                const isSelected =
                  multiPickerMode && pickerSelection.includes(item.url);

                return (
                  <li
                    key={item.id}
                    className={cn(
                      "flex gap-3 rounded-lg border p-2",
                      isSelected && "border-primary bg-primary/5",
                    )}
                  >
                    <button
                      type="button"
                      className={cn(
                        "h-16 w-20 shrink-0 overflow-hidden rounded bg-muted",
                        pickerMode ? "cursor-pointer" : "cursor-default",
                      )}
                      disabled={!pickerMode}
                      onClick={() => {
                        if (multiPickerMode) {
                          togglePickerSelection(item.url);
                          return;
                        }
                        if (!onPick) return;
                        onPick(item);
                        closeMedia();
                      }}
                    >
                      {item.type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt={displayTitle(item)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <video
                          src={item.url}
                          className="h-full w-full object-cover"
                          muted
                        />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-medium"
                        title={displayTitle(item)}
                      >
                        {displayTitle(item)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.filename} · {formatSize(item.size)}
                      </p>
                      {singlePickerMode && (
                        <Button
                          type="button"
                          size="sm"
                          className="mt-1 h-7"
                          onClick={() => {
                            onPick?.(item);
                            closeMedia();
                          }}
                        >
                          Chọn
                        </Button>
                      )}
                      {multiPickerMode && (
                        <Button
                          type="button"
                          size="sm"
                          variant={isSelected ? "secondary" : "default"}
                          className="mt-1 h-7"
                          onClick={() => togglePickerSelection(item.url)}
                        >
                          {isSelected ? "Bỏ chọn" : "Chọn"}
                        </Button>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                      onClick={() => void handleDelete(item)}
                      disabled={deletingId === item.id}
                      aria-label={`Xóa ${displayTitle(item)}`}
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
              {hasMore ? (
                <div
                  ref={sentinelRef}
                  className="flex items-center justify-center py-3"
                >
                  {loadingMore ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
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

        {multiPickerMode && (
          <div className="flex gap-2 border-t px-4 py-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={closeMedia}
            >
              Hủy
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleConfirmSelection}
            >
              Xác nhận ({pickerSelection.length})
            </Button>
          </div>
        )}
      </div>
    </Sheet>
  );
}
