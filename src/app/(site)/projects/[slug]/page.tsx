import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailContent } from "@/components/site/project-detail-content";
import { ProjectDetailCover } from "@/components/site/project-detail-cover";
import { ProjectDetailImages } from "@/components/site/project-detail-images";
import { ProjectDetailRelated } from "@/components/site/project-detail-related";
import {
  getProjectBySlug,
  getProjectCover,
  getProjectImages,
  getRelatedProjects,
  siteProjects,
} from "@/lib/site-content";
import { createPageMetadata } from "@/lib/site-metadata";

type ProjectDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return siteProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
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
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const images = getProjectImages(project);
  const related = getRelatedProjects(project.slug);

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

      <ProjectDetailRelated projects={related} />
    </article>
  );
}
