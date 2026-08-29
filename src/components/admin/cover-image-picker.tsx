"use client";

import { ImageIcon, X } from "lucide-react";
import { useMediaDrawer } from "@/components/admin/media-drawer-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface CoverImagePickerProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
}

export function CoverImagePicker({
  value,
  onChange,
  label = "Ảnh tiêu đề",
  description = "Chọn ảnh từ Media (drawer) để làm ảnh cover",
}: CoverImagePickerProps) {
  const { openMedia } = useMediaDrawer();

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <p className="text-xs text-muted-foreground">{description}</p>

      {value ? (
        <div className="relative inline-block overflow-hidden rounded-lg border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Ảnh tiêu đề"
            className="h-40 w-auto max-w-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-7 w-7"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed bg-muted/30">
          <div className="text-center text-sm text-muted-foreground">
            <ImageIcon className="mx-auto mb-2 h-6 w-6" />
            Chưa chọn ảnh tiêu đề
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
            onPick: (item) => onChange(item.url),
          })
        }
      >
        {value ? "Đổi ảnh" : "Chọn ảnh từ Media"}
      </Button>
    </div>
  );
}
