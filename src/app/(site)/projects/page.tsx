import { Suspense } from "react";
import { ProjectFilter } from "@/components/site/project-filter";
import { ProjectsPageScroll } from "@/components/site/projects-page-scroll";
import { SiteLoadingScreen } from "@/components/site/site-loading-screen";
import { getSiteContact } from "@/lib/get-site-contact";
import { getSiteProjects } from "@/lib/get-site-projects";
import {
  parseProjectCategory,
  type ProjectCategory,
} from "@/lib/site-content";
import { createPageMetadata } from "@/lib/site-metadata";
import type { ContactPageContent } from "@/lib/validations/site-page";

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
  contact,
}: {
  category: ProjectCategory | null;
  contact: ContactPageContent;
}) {
  const projects = await getSiteProjects(category);
  return <ProjectsPageScroll projects={projects} contact={contact} />;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { category: categoryParam } = await searchParams;
  const category = parseProjectCategory(categoryParam);
  const contact = await getSiteContact();

  return (
    <div data-projects-page="" className="bg-background">
      <Suspense
        fallback={
          <div className="h-[52px] shrink-0 md:h-[60px]" />
        }
      >
        <ProjectFilter stickTo="header" />
      </Suspense>
      <Suspense
        key={category ?? "all"}
        fallback={<SiteLoadingScreen autoDismiss />}
      >
        <ProjectsPageData category={category} contact={contact} />
      </Suspense>
    </div>
  );
}
