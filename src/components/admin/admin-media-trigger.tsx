"use client";

import { ImageIcon } from "lucide-react";
import { useMediaDrawer } from "@/components/admin/media-drawer-context";
import { Button } from "@/components/ui/button";

export function AdminMediaTrigger() {
  const { openMedia } = useMediaDrawer();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => openMedia()}
    >
      <ImageIcon className="h-4 w-4" />
      Media
    </Button>
  );
}
