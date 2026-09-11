"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SiteImage } from "@/components/site/site-image";
import { Button } from "@/components/ui/button";

const SWIPE_MIN_PX = 48;

interface ProjectDetailLightboxProps {
  images: string[];
  title: string;
  /** Index ảnh được click — `null` = đóng. */
  index: number | null;
  onClose: () => void;
}

export function ProjectDetailLightbox({
  images,
  title,
  index,
  onClose,
}: ProjectDetailLightboxProps) {
  const open = index !== null && images.length > 0;
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (index === null) return;
    setCurrent(((index % images.length) + images.length) % images.length);
  }, [index, images.length]);

  const goTo = useCallback(
    (next: number) => {
      if (images.length === 0) return;
      setCurrent(((next % images.length) + images.length) % images.length);
    },
    [images.length],
  );

  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);
  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);

  const handleClose = useCallback(
    (event: React.SyntheticEvent) => {
      event.preventDefault();
      event.stopPropagation();
      /* Defer unmount — nếu đóng ngay trong click, sự kiện lọt xuống nút menu header. */
      window.setTimeout(onClose, 0);
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.setAttribute("data-lightbox-open", "");

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      document.documentElement.removeAttribute("data-lightbox-open");
    };
  }, [open, onClose, goPrev, goNext]);

  if (!mounted || !open) return null;

  const src = images[current];
  if (!src) return null;

  return createPortal(
    <div
      className="project-detail-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Xem ảnh ${title}`}
      onClick={(event) => event.stopPropagation()}
    >
      <div
        className="project-detail-lightbox__stage"
        onPointerDown={(event) => {
          touchStartX.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (touchStartX.current === null) return;
          const delta = event.clientX - touchStartX.current;
          touchStartX.current = null;
          if (delta > SWIPE_MIN_PX) goPrev();
          if (delta < -SWIPE_MIN_PX) goNext();
        }}
        onPointerCancel={() => {
          touchStartX.current = null;
        }}
      >
        <SiteImage
          key={`${src}-${current}`}
          src={src}
          alt={`${title} — ${current + 1}`}
          fill
          blur={false}
          sizes="100vw"
          className="object-contain"
        />
      </div>

      <p className="project-detail-lightbox__count">
        {String(current + 1).padStart(2, "0")} /{" "}
        {String(images.length).padStart(2, "0")}
      </p>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="project-detail-lightbox__close"
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        onClick={handleClose}
        aria-label="Đóng"
      >
        <X className="h-6 w-6" />
      </Button>

      {images.length > 1 ? (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="project-detail-lightbox__nav project-detail-lightbox__nav--prev"
            onClick={goPrev}
            aria-label="Ảnh trước"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="project-detail-lightbox__nav project-detail-lightbox__nav--next"
            onClick={goNext}
            aria-label="Ảnh sau"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      ) : null}
    </div>,
    document.body,
  );
}
