"use client";

import { useState } from "react";
import { ContactMapClient } from "@/components/site/contact-map-client";
import { ContactMapEmbedSection } from "@/components/site/contact-map-embed-section";
import { ContactMapZoomControls } from "@/components/site/contact-map-zoom-controls";
import { cn } from "@/lib/utils";

interface ContactMapJsSectionProps {
  className?: string;
}

export function ContactMapJsSection({ className }: ContactMapJsSectionProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [useEmbedFallback, setUseEmbedFallback] = useState(false);

  if (useEmbedFallback) {
    return <ContactMapEmbedSection className={className} />;
  }

  return (
    <section className={cn("w-full", className)}>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted grayscale md:aspect-[21/9]">
        <ContactMapClient
          onMapReady={setMap}
          onError={() => setUseEmbedFallback(true)}
        />
      </div>
      <ContactMapZoomControls map={map} />
    </section>
  );
}
