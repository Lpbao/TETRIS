"use client";

import { ProjectShowcase } from "@/components/site/project-showcase";
import type { SiteProject } from "@/lib/site-content";

interface ProjectsPageScrollProps {
  projects: SiteProject[];
}

/** `/projects` — cuộn document thật. Tab category nằm ngoài Suspense (iOS). */
export function ProjectsPageScroll({ projects }: ProjectsPageScrollProps) {
  return <ProjectShowcase projects={projects} />;
}
