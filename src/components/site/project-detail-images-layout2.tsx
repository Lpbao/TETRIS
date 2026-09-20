"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ProjectDetailLightbox } from "@/components/site/project-detail-lightbox";
import { useFullPageScroll } from "@/lib/full-page-scroll/context";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/components/site/infinite-canvas";

const InfiniteCanvas = dynamic(
  () =>
    import("@/components/site/infinite-canvas").then((mod) => mod.InfiniteCanvas),
  { ssr: false },
);

interface ProjectDetailImagesLayout2Props {
  images: string[];
  title: string;
  className?: string;
}

const DEFAULT_MEDIA_WIDTH = 1600;
const DEFAULT_MEDIA_HEIGHT = 1200;

function toMediaItems(images: string[]): MediaItem[] {
  return images
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => ({
      url,
      width: DEFAULT_MEDIA_WIDTH,
      height: DEFAULT_MEDIA_HEIGHT,
    }));
}

/** Gallery LAYOUT2 — Infinite Canvas. Thoát màn bằng mũi tên, không bằng wheel. */
export function ProjectDetailImagesLayout2({
  images,
  title,
  className,
}: ProjectDetailImagesLayout2Props) {
  const { pager } = useFullPageScroll();
  const media = toMediaItems(images);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <section
      className={cn("project-detail-images-layout2", className)}
      data-infinite-canvas=""
      aria-label={`Ảnh dự án — ${title}`}
    >
      {media.length > 0 ? (
        <InfiniteCanvas media={media} onMediaSelect={setLightboxIndex} />
      ) : null}
      <nav
        className="project-detail-layout2-nav"
        aria-label="Chuyển màn dự án"
      >
        <button
          type="button"
          className="project-detail-layout2-nav__btn project-detail-layout2-nav__btn--down"
          aria-label="Xem thêm dự án"
          onClick={() => pager.goNext()}
        >
          <svg
            className="project-detail-layout2-nav__arrow"
            viewBox="0 0 48 72"
            fill="none"
            aria-hidden
          >
            <path
              className="project-detail-layout2-nav__chevron project-detail-layout2-nav__chevron--1"
              d="M8 16L24 32L40 16"
            />
            <path
              className="project-detail-layout2-nav__chevron project-detail-layout2-nav__chevron--2"
              d="M8 34L24 50L40 34"
            />
            <path
              className="project-detail-layout2-nav__chevron project-detail-layout2-nav__chevron--3"
              d="M8 52L24 68L40 52"
            />
          </svg>
        </button>
      </nav>
      <ProjectDetailLightbox
        images={images}
        title={title}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </section>
  );
}
