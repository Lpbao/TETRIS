"use client";

import { ImageIcon, X } from "lucide-react";
import { useMediaDrawer } from "@/components/admin/media-drawer-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface MediaMultiImagePickerProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  description?: string;
  emptyText?: string;
  buttonText?: string;
}

export function MediaMultiImagePicker({
  value,
  onChange,
  label = "Ảnh",
  description = "Chọn nhiều ảnh từ Media",
  emptyText = "Chưa chọn ảnh",
  buttonText = "Chọn ảnh từ Media",
}: MediaMultiImagePickerProps) {
  const { openMedia } = useMediaDrawer();
  const images = value ?? [];

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <p className="text-xs text-muted-foreground">{description}</p>

      {images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((src) => (
            <li
              key={src}
              className="relative overflow-hidden rounded-lg border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="h-32 w-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-7 w-7"
                onClick={() => onChange(images.filter((item) => item !== src))}
                aria-label="Gỡ ảnh"
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed bg-muted/30">
          <div className="text-center text-sm text-muted-foreground">
            <ImageIcon className="mx-auto mb-2 h-6 w-6" />
            {emptyText}
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          openMedia({
            accept: "image",
            selectedUrls: images,
            onConfirm: (urls) => onChange(urls),
          })
        }
      >
        {buttonText}
        {images.length > 0 ? ` (${images.length})` : ""}
      </Button>
    </div>
  );
}
