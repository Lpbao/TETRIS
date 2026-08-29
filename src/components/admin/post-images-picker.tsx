"use client";

import { ImageIcon, X } from "lucide-react";
import { useMediaDrawer } from "@/components/admin/media-drawer-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface PostImagesPickerProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export function PostImagesPicker({ value, onChange }: PostImagesPickerProps) {
  const { openMedia } = useMediaDrawer();
  const images = value ?? [];

  return (
    <div className="space-y-3">
      <Label>Ảnh gallery</Label>
      <p className="text-xs text-muted-foreground">
        Chọn nhiều ảnh từ Media — hiển thị trên trang chi tiết dự án
      </p>

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
            Chưa chọn ảnh gallery
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
            onPick: (item) => {
              if (images.includes(item.url)) return;
              onChange([...images, item.url]);
            },
          })
        }
      >
        Thêm ảnh từ Media
      </Button>
    </div>
  );
}
