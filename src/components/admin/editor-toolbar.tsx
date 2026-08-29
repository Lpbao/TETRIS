"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TextAlign } from "@/lib/markdown-format";

interface EditorToolbarProps {
  onAlign: (align: TextAlign) => void;
}

export function EditorToolbar({ onAlign }: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 px-2 py-1.5">
      <span className="mr-1 text-xs text-muted-foreground">Căn lề:</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 px-2"
        onClick={() => onAlign("left")}
        title="Căn trái"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 px-2"
        onClick={() => onAlign("center")}
        title="Căn giữa"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 px-2"
        onClick={() => onAlign("right")}
        title="Căn phải"
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      <span className="ml-2 text-xs text-muted-foreground">
        · Kéo góc ảnh ở khung Preview để chỉnh kích thước
      </span>
    </div>
  );
}
