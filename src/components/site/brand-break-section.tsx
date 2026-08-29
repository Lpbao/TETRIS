"use client";

import { BrandBreakImage } from "@/components/site/brand-break";
import { BrandBreakLines } from "@/components/site/brand-break-lines";
import { ContentPartnerSection } from "@/components/site/content-partner-section";
import { useBrandBreakScroll } from "@/hooks/use-brand-break-scroll";
import { useSectionEnterOnce } from "@/hooks/use-section-enter-once";
import { cn } from "@/lib/utils";

interface BrandBreakSectionProps {
  image: string;
  imageAlt: string;
  journeyTitle: string;
  journeyParagraphs: readonly string[];
  partnersTitle: string;
  partners: readonly { name: string; logo: string }[];
  className?: string;
}

export function BrandBreakSection({
  image,
  imageAlt,
  journeyTitle,
  journeyParagraphs,
  partnersTitle,
  partners,
  className,
}: BrandBreakSectionProps) {
  const animate = useSectionEnterOnce("about-brand-break");
  const rootRef = useBrandBreakScroll();

  return (
    <div
      ref={rootRef}
      data-morph-pin=""
      data-brand-break=""
      data-brand-break-animate={animate}
      data-morph-pin-phase="letter"
      className={cn("relative w-full bg-background", className)}
    >
      <div data-morph-pin-track="">
        <div
          data-morph-pin-pin=""
          className="relative flex min-h-0 w-full flex-col"
        >
          <BrandBreakLines />
          <BrandBreakImage image={image} imageAlt={imageAlt} />
        </div>
      </div>
      <ContentPartnerSection
        journeyTitle={journeyTitle}
        journeyParagraphs={journeyParagraphs}
        partnersTitle={partnersTitle}
        partners={partners}
        lettersSectionId="about-brand-break"
      />
    </div>
  );
}
