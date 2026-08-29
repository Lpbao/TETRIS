"use client";

import {
  FullPageScrollRoot,
  type FullPageScrollSection,
} from "@/components/site/full-page-scroll";
import { ServiceSection } from "@/components/site/service-section";
import { getServicesSections } from "@/lib/services-section-config";
import type { SiteService } from "@/lib/site-content";

interface ServicesPageScrollProps {
  services: readonly SiteService[];
}

export function ServicesPageScroll({ services }: ServicesPageScrollProps) {
  const sections = getServicesSections(services.length);
  const panels: FullPageScrollSection[] = services.map((service, index) => ({
    def: sections[index]!,
    "aria-label": service.imageAlt,
    children: (
      <ServiceSection
        title={service.title}
        description={service.description}
        image={service.image}
        imageAlt={service.imageAlt}
        reverse={index % 2 === 1}
        fullPage
        terminal={index === services.length - 1}
        sectionId={sections[index]!.id}
      />
    ),
  }));

  return (
    <FullPageScrollRoot
      effect="slide"
      sections={sections}
      panels={panels}
    />
  );
}
