"use client";

import { useEffect, useRef, useState } from "react";
import { ContentSection } from "@/components/site/content-section";
import { PartnersRow } from "@/components/site/partners-row";
import { cn } from "@/lib/utils";

interface ContentPartnerSectionProps {
  journeyTitle: string;
  journeyParagraphs: readonly string[];
  partnersTitle: string;
  partners: readonly { name: string; logo: string }[];
  className?: string;
  /** Pager section id — ml2 play khi heading vào view */
  lettersSectionId?: string;
}

function useScrollerInViewOnce() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;

    const scroller = el.closest("[data-fps-inner-scroll]");
    const isVisible = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return false;
      const clip = scroller?.getBoundingClientRect();
      const top = Math.max(rect.top, clip?.top ?? 0, 0);
      const bottom = Math.min(
        rect.bottom,
        clip?.bottom ?? window.innerHeight,
        window.innerHeight,
      );
      return bottom - top > 32;
    };

    const tryStart = () => {
      if (isVisible()) setVisible(true);
    };

    tryStart();
    scroller?.addEventListener("scroll", tryStart, { passive: true });
    window.addEventListener("resize", tryStart);
    const observer = new IntersectionObserver(tryStart, { threshold: 0 });
    observer.observe(el);

    return () => {
      scroller?.removeEventListener("scroll", tryStart);
      window.removeEventListener("resize", tryStart);
      observer.disconnect();
    };
  }, [visible]);

  return { ref, visible };
}

export function ContentPartnerSection({
  journeyTitle,
  journeyParagraphs,
  partnersTitle,
  partners,
  className,
  lettersSectionId = "about-brand-break",
}: ContentPartnerSectionProps) {
  const { ref, visible } = useScrollerInViewOnce();

  return (
    <div
      ref={ref}
      id="content-partner"
      data-content-partner=""
      data-morph-pin-content=""
      data-content-partner-animate={visible ? "in" : "out"}
      className={cn("relative w-full bg-background", className)}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col justify-start px-4 py-6 md:py-8">
        <ContentSection
          title={journeyTitle}
          paragraphs={journeyParagraphs}
          className="mx-auto w-full max-w-3xl py-4 md:py-6"
          headingEffect="ml2"
          bodyEffect="text-focus-in"
          movingLettersSectionId={lettersSectionId}
        />
        <PartnersRow
          title={partnersTitle}
          partners={partners}
          className="mt-6 w-full py-4 pb-6 md:py-6 md:pb-8"
          headingEffect="ml2"
          logoEffect="text-focus-in"
          lettersSectionId={lettersSectionId}
        />
      </div>
    </div>
  );
}
