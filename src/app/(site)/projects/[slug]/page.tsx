import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailContent } from "@/components/site/project-detail-content";
import { ProjectDetailCover } from "@/components/site/project-detail-cover";
import { ProjectDetailImages } from "@/components/site/project-detail-images";
import { ProjectShowcase } from "@/components/site/project-showcase";
import {
  getPublishedProjectSlugs,
  getRelatedSiteProjects,
  getSiteProjectBySlug,
} from "@/lib/get-site-project";
import { getProjectCover, getProjectImages } from "@/lib/site-content";
import { createPageMetadata } from "@/lib/site-metadata";

type ProjectDetailPageProps = {
  params: Promise<{ slug: string }>;
};

/** CMS đổi là thấy ngay — không cache trang chi tiết dự án. */
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const slugs = await getPublishedProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getSiteProjectBySlug(slug);
  if (!project) {
    return createPageMetadata({
      title: "Dự án không tồn tại",
      path: `/projects/${slug}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: project.title,
    description: project.description,
    path: `/projects/${project.slug}`,
    image: getProjectCover(project),
  });
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = await getSiteProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const images = getProjectImages(project);
  const related = await getRelatedSiteProjects(project);

  return (
    <article data-project-detail>
      <ProjectDetailCover
        title={project.title}
        src={getProjectCover(project)}
        concept={project.categoryLabel}
        address={project.location}
      />

      {images.length > 0 ? (
        <ProjectDetailImages images={images} title={project.title} />
      ) : null}

      {project.description ? (
        <ProjectDetailContent
          concept={project.categoryLabel}
          address={project.location}
          description={project.description}
        />
      ) : null}

      <ProjectShowcase projects={related} scrollEffectMode />
    </article>
  );
}
