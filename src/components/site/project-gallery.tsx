import { HomeProjectCurtainList } from "@/components/site/home-project-curtain-list";
import { getProjectImages, type SiteProject } from "@/lib/site-content";
import { cn } from "@/lib/utils";

const PROJECT_GALLERY_SECTION_ID = "project-gallery";

interface ProjectGalleryProps {
  project: SiteProject;
  className?: string;
}

export function ProjectGallery({ project, className }: ProjectGalleryProps) {
  const images = getProjectImages(project);
  if (images.length === 0) return null;

  return (
    <section
      id={PROJECT_GALLERY_SECTION_ID}
      className={cn("mx-auto max-w-6xl px-4 pb-16", className)}
    >
      <HomeProjectCurtainList
        items={images.map((src) => ({
          key: src,
          project,
          image: src,
        }))}
        sectionId={PROJECT_GALLERY_SECTION_ID}
        cardVariant="gallery"
        gate="immediate"
      />
    </section>
  );
}
