import { ProgressiveImage } from "@/components/site/progressive-image";
import {
  CANVAS_FULL_WIDTH,
  CANVAS_PREVIEW_WIDTH,
} from "@/lib/optimized-image-src";
import { cn } from "@/lib/utils";

interface ProjectDetailImagesDefaultProps {
  images: string[];
  title: string;
  className?: string;
}

const EAGER_COUNT = 4;

/** Gallery LAYOUTDEFAULT — stack ảnh full width, pad ngang token header, không animation/lightbox. */
export function ProjectDetailImagesDefault({
  images,
  title,
  className,
}: ProjectDetailImagesDefaultProps) {
  if (images.length === 0) return null;

  return (
    <section
      className={cn("project-detail-images-default", className)}
      aria-label="Ảnh dự án"
    >
      {images.map((src, index) => (
        <figure
          key={`${src}-${index}`}
          className="project-detail-images-default__item"
        >
          <ProgressiveImage
            src={src}
            alt={`${title} — ${index + 1}`}
            previewWidth={CANVAS_PREVIEW_WIDTH}
            fullWidth={CANVAS_FULL_WIDTH}
            layout="flow"
            loading={index < EAGER_COUNT ? "eager" : "lazy"}
            sizes="100vw"
            className="project-detail-images-default__img"
          />
        </figure>
      ))}
    </section>
  );
}
