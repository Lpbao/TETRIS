"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Search, Trash2, Upload } from "lucide-react";
import { useMediaDrawer } from "@/components/admin/media-drawer-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet } from "@/components/ui/sheet";
import type { MediaItem } from "@/lib/media";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function displayTitle(item: MediaItem) {
  return item.title?.trim() || item.filename;
}

export function AdminMediaDrawer() {
  const { open, accept, onPick, closeMedia } = useMediaDrawer();
  const [title, setTitle] = useState("");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchMedia = useCallback(async (search: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      const res = await fetch(`/api/media?${params.toString()}`);
      if (!res.ok) throw new Error("Không thể tải media");
      const items: MediaItem[] = await res.json();
      setMedia(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải media");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void fetchMedia(debouncedQuery);
  }, [open, debouncedQuery, fetchMedia]);

  const handleUpload = async (files: FileList | File[] | null) => {
    const list = files ? Array.from(files) : [];
    if (!list.length) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Nhập title ảnh trước khi upload");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      for (const file of list) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", trimmedTitle);

        const res = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const result = await res.json();
          throw new Error(result.error || "Upload thất bại");
        }
      }
      setTitle("");
      await fetchMedia(debouncedQuery);
      window.dispatchEvent(new Event("admin-media-changed"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload thất bại");
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
      setMedia((prev) => prev.filter((entry) => entry.id !== item.id));
      window.dispatchEvent(new Event("admin-media-changed"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xóa thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  const visibleMedia =
    accept === "image" ? media.filter((item) => item.type === "image") : media;

  const pickerMode = Boolean(onPick);

  return (
    <Sheet open={open} onOpenChange={(next) => !next && closeMedia()} title="Media">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="space-y-4 border-b px-4 py-4">
          {pickerMode && (
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              Chọn một ảnh trong danh sách để gắn vào form.
            </p>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="media-title">Title ảnh</Label>
            <Input
              id="media-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: D.Chic showroom"
              maxLength={200}
            />
          </div>

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
              void handleUpload(e.dataTransfer.files);
            }}
          >
            <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-medium">Kéo thả hoặc chọn file</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Nhập title trước, rồi upload.
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
              onChange={(e) => void handleUpload(e.target.files)}
            />
            <Button
              type="button"
              size="sm"
              className="mt-3"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
              Chọn file
            </Button>
          </div>
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
            <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {visibleMedia.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-lg border p-2"
                >
                  <button
                    type="button"
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded bg-muted ${
                      pickerMode ? "cursor-pointer" : "cursor-default"
                    }`}
                    disabled={!pickerMode}
                    onClick={() => {
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
                    {pickerMode && (
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
              ))}
            </ul>
          )}
        </div>
      </div>
    </Sheet>
  );
}
