"use client";

import {
  FullPageScrollRoot,
  type FullPageScrollSection,
} from "@/components/site/full-page-scroll";
import { ServiceSection } from "@/components/site/service-section";
import { getServicesSections } from "@/lib/services-section-config";
import type { SiteService } from "@/lib/site-content";
import type { ContactPageContent } from "@/lib/validations/site-page";

interface ServicesPageScrollProps {
  services: readonly SiteService[];
  contact?: ContactPageContent;
}

export function ServicesPageScroll({
  services,
  contact,
}: ServicesPageScrollProps) {
  const sections = getServicesSections(services.length);
  const lastIndex = services.length - 1;
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
        sectionId={sections[index]!.id}
        showFooter={index === lastIndex}
        contact={index === lastIndex ? contact : undefined}
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
