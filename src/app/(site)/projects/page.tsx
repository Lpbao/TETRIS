import { ProjectsPageScroll } from "@/components/site/projects-page-scroll";
import {
  getProjectsByCategory,
  parseProjectCategory,
} from "@/lib/site-content";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata({
  title: "Dự án",
  description:
    "Portfolio dự án kiến trúc và nội thất — nhà hàng, showroom, lưu trú bởi Tetris Design.",
  path: "/projects",
});

type ProjectsPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { category: categoryParam } = await searchParams;
  const category = parseProjectCategory(categoryParam);
  const projects = getProjectsByCategory(category);

  return (
    <ProjectsPageScroll key={category ?? "all"} projects={projects} />
  );
}
