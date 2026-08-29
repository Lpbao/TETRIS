"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { CONTACT_MAP_ZOOM } from "@/lib/contact-map-config";
import { cn } from "@/lib/utils";

interface ContactMapZoomControlsProps {
  map: google.maps.Map | null;
  className?: string;
}

export function ContactMapZoomControls({ map, className }: ContactMapZoomControlsProps) {
  const [zoom, setZoom] = useState<number>(CONTACT_MAP_ZOOM.default);

  useEffect(() => {
    if (!map) return;

    const syncZoom = () => {
      setZoom(map.getZoom() ?? CONTACT_MAP_ZOOM.default);
    };

    syncZoom();
    const listener = map.addListener("zoom_changed", syncZoom);

    return () => {
      listener.remove();
    };
  }, [map]);

  if (!map) return null;

  const zoomIn = () => {
    const current = map.getZoom() ?? zoom;
    map.setZoom(Math.min(CONTACT_MAP_ZOOM.max, current + 1));
  };

  const zoomOut = () => {
    const current = map.getZoom() ?? zoom;
    map.setZoom(Math.max(CONTACT_MAP_ZOOM.min, current - 1));
  };

  return (
    <div className={cn("flex justify-center bg-background py-3", className)}>
      <div
        className="inline-flex items-center overflow-hidden rounded-sm border border-border bg-muted shadow-sm"
        role="group"
        aria-label="Điều khiển zoom bản đồ"
      >
        <button
          type="button"
          onClick={zoomOut}
          disabled={zoom <= CONTACT_MAP_ZOOM.min}
          aria-label="Thu nhỏ bản đồ"
          className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="h-4 w-4" strokeWidth={2.5} />
        </button>
        <span className="h-6 w-px bg-border" aria-hidden="true" />
        <button
          type="button"
          onClick={zoomIn}
          disabled={zoom >= CONTACT_MAP_ZOOM.max}
          aria-label="Phóng to bản đồ"
          className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
