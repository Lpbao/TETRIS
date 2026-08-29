"use client";

import { Suspense } from "react";
import {
  FullPageScrollRoot,
  type FullPageScrollSection,
} from "@/components/site/full-page-scroll";
import { ProjectFilter } from "@/components/site/project-filter";
import { ProjectGrid } from "@/components/site/project-grid";
import { PROJECTS_SECTIONS } from "@/lib/projects-section-config";
import type { SiteProject } from "@/lib/site-content";

interface ProjectsPageScrollProps {
  projects: SiteProject[];
}

export function ProjectsPageScroll({ projects }: ProjectsPageScrollProps) {
  const panels: FullPageScrollSection[] = [
    {
      def: PROJECTS_SECTIONS[0]!,
      "aria-label": "Danh sách dự án",
      children: (
        <div className="flex min-h-full w-full flex-col justify-start bg-background">
          <Suspense
            fallback={
              <div className="h-[52px] shrink-0 border-b border-border/60 md:h-[60px]" />
            }
          >
            <ProjectFilter stickTo="scroller" />
          </Suspense>
          <ProjectGrid
            projects={projects}
            className="flex flex-col justify-start py-6 md:py-8"
          />
        </div>
      ),
    },
  ];

  return (
    <FullPageScrollRoot
      effect="slide"
      sections={PROJECTS_SECTIONS}
      panels={panels}
    />
  );
}
