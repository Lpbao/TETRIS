import { Suspense } from "react";
import { ProjectFilter } from "@/components/site/project-filter";
import { ProjectsPageScroll } from "@/components/site/projects-page-scroll";
import { SiteLoadingScreen } from "@/components/site/site-loading-screen";
import { getSiteProjects } from "@/lib/get-site-projects";
import {
  parseProjectCategory,
  type ProjectCategory,
} from "@/lib/site-content";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata({
  title: "Dự án",
  description:
    "Portfolio dự án kiến trúc và nội thất — nhà hàng, showroom, lưu trú bởi Tetris Design.",
  path: "/projects",
});

/** CMS bài đăng đổi là thấy ngay — không cache list. */
export const dynamic = "force-dynamic";

type ProjectsPageProps = {
  searchParams: Promise<{ category?: string }>;
};

async function ProjectsPageData({
  category,
}: {
  category: ProjectCategory | null;
}) {
  const projects = await getSiteProjects(category);
  return <ProjectsPageScroll projects={projects} />;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { category: categoryParam } = await searchParams;
  const category = parseProjectCategory(categoryParam);

  return (
    <div data-projects-page="" className="bg-background">
      <Suspense
        fallback={
          <div className="h-[52px] shrink-0 border-b border-border/60 md:h-[60px]" />
        }
      >
        <ProjectFilter stickTo="header" />
      </Suspense>
      <Suspense
        key={category ?? "all"}
        fallback={<SiteLoadingScreen autoDismiss />}
      >
        <ProjectsPageData category={category} />
      </Suspense>
    </div>
  );
}
