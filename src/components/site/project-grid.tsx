import {
  ProjectShowcase,
  type ProjectShowcaseProps,
} from "@/components/site/project-showcase";
import type { SiteProject } from "@/lib/site-content";

interface ProjectGridProps {
  projects: SiteProject[];
  className?: string;
  emptyMessage?: string;
  variant?: "default" | "home";
  id?: string;
  tabsDisplay?: boolean;
  showSearch?: boolean;
  showPagination?: boolean;
  scrollEffectMode?: boolean;
}

/** @deprecated Dùng `ProjectShowcase`. Giữ để import cũ không gãy. */
export function ProjectGrid({
  projects,
  className,
  emptyMessage,
  variant = "default",
  id,
  tabsDisplay,
  showSearch,
  showPagination,
  scrollEffectMode,
}: ProjectGridProps) {
  const layout: ProjectShowcaseProps["layout"] =
    variant === "home" ? "home" : "page";

  return (
    <ProjectShowcase
      id={id}
      projects={projects}
      className={className}
      layout={layout}
      emptyMessage={emptyMessage}
      tabsDisplay={tabsDisplay}
      showSearch={showSearch}
      showPagination={showPagination}
      scrollEffectMode={scrollEffectMode}
    />
  );
}
