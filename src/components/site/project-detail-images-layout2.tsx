"use client";

import dynamic from "next/dynamic";
import { ChevronDown, ChevronUp } from "lucide-react";
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

  return (
    <section
      className={cn("project-detail-images-layout2", className)}
      data-infinite-canvas=""
      aria-label={`Ảnh dự án — ${title}`}
    >
      {media.length > 0 ? <InfiniteCanvas media={media} /> : null}
      <nav
        className="project-detail-layout2-nav"
        aria-label="Chuyển màn dự án"
      >
        <button
          type="button"
          className="project-detail-layout2-nav__btn"
          aria-label="Về ảnh bìa dự án"
          onClick={() => pager.goPrev()}
        >
          <ChevronUp className="size-8" strokeWidth={1.25} aria-hidden />
        </button>
        <button
          type="button"
          className="project-detail-layout2-nav__btn"
          aria-label="Xem thêm dự án"
          onClick={() => pager.goNext()}
        >
          <ChevronDown className="size-8" strokeWidth={1.25} aria-hidden />
        </button>
      </nav>
    </section>
  );
}
