"use client";

import { ProjectShowcase } from "@/components/site/project-showcase";
import { SiteFooter } from "@/components/site/site-footer";
import type { SiteProject } from "@/lib/site-content";
import type { ContactPageContent } from "@/lib/validations/site-page";

interface ProjectsPageScrollProps {
  projects: SiteProject[];
  contact?: ContactPageContent;
}

/** `/projects` — cuộn document thật. Tab category nằm ngoài Suspense (iOS). */
export function ProjectsPageScroll({
  projects,
  contact,
}: ProjectsPageScrollProps) {
  return (
    <>
      <ProjectShowcase projects={projects} showPagination />
      <SiteFooter className="mt-[var(--projects-footer-gap)]" contact={contact} />
    </>
  );
}
