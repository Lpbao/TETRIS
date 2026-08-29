"use client";

import { ImagePlus } from "lucide-react";
import { useMediaDrawer } from "@/components/admin/media-drawer-context";
import { Button } from "@/components/ui/button";
import { buildMediaMarkdown } from "@/lib/media";

interface MediaPickerProps {
  onInsert: (markdown: string) => void;
}

export function MediaPicker({ onInsert }: MediaPickerProps) {
  const { openMedia } = useMediaDrawer();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() =>
        openMedia({
          onPick: (item) =>
            onInsert(
              buildMediaMarkdown(
                item.type,
                item.url,
                item.title || item.filename,
              ),
            ),
        })
      }
    >
      <ImagePlus className="h-4 w-4" />
      Chèn media
    </Button>
  );
}
