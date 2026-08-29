"use client";

import { SiteImage } from "@/components/site/site-image";
import { cn } from "@/lib/utils";

interface AboutHeroProps {
  src: string;
  alt: string;
  className?: string;
}

export function AboutHero({ src, alt, className }: AboutHeroProps) {
  return (
    <div
      data-morph-pin-image=""
      className={cn(
        "relative z-10 min-h-0 w-full flex-1 overflow-hidden",
        className,
      )}
    >
      <SiteImage
        src={src}
        alt={alt}
        fill
        priority
        grayscale
        blur={false}
        className="object-contain p-4 md:p-8"
        sizes="100vw"
      />
    </div>
  );
}
