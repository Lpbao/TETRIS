"use client";

import { AboutAwardsSection } from "@/components/site/about-awards-section";
import { AboutHeroSection } from "@/components/site/about-hero-section";
import { AwardsList } from "@/components/site/awards-list";
import { BrandBreakSection } from "@/components/site/brand-break-section";
import { ContentSection } from "@/components/site/content-section";
import {
  FullPageScrollRoot,
  type FullPageScrollSection,
} from "@/components/site/full-page-scroll";
import { ABOUT_SECTIONS } from "@/lib/about-section-config";
import type {
  AboutPageContent,
  ContactPageContent,
} from "@/lib/validations/site-page";

interface AboutPageScrollProps {
  content: AboutPageContent;
  contact?: ContactPageContent;
}

export function AboutPageScroll({ content, contact }: AboutPageScrollProps) {
  const panels: FullPageScrollSection[] = [
    {
      def: ABOUT_SECTIONS[0]!,
      "aria-label": "Ảnh đội ngũ, giới thiệu và giải thưởng",
      children: (
        <AboutHeroSection src={content.heroImage} alt="Đội ngũ Tetris Design">
          <div className="mx-auto max-w-3xl px-4">
            <ContentSection
              title={content.introduction.title}
              paragraphs={content.introduction.paragraphs}
              className="pb-4 pt-0"
              bodyClassName="mt-3"
              scrollBlur
            />
            <AboutAwardsSection>
              <AwardsList
                title={content.awards.title}
                groups={content.awards.groups}
                className="pb-8 pt-2"
              />
            </AboutAwardsSection>
          </div>
        </AboutHeroSection>
      ),
    },
    {
      def: ABOUT_SECTIONS[1]!,
      "aria-label": "Brand break, hành trình và đối tác",
      children: (
        <BrandBreakSection
          image={content.brandBreakImage}
          imageAlt="Đội ngũ Tetris Design"
          journeyTitle={content.journey.title}
          journeyParagraphs={content.journey.paragraphs}
          partnersTitle={content.partners.title}
          partners={content.partners.items}
          contact={contact}
        />
      ),
    },
  ];

  return (
    <FullPageScrollRoot
      effect="slide"
      sections={ABOUT_SECTIONS}
      panels={panels}
    />
  );
}
