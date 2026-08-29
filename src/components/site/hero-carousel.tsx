"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { HeroSlide } from "@/lib/site-content";
import {
  HERO_REST_MAX_SCROLL_Y,
  scrollToProjectsAnchor,
  SECTION_AXIS_LOCK_MIN,
  SECTION_EXIT_SWIPE_MIN,
  SECTION_SWIPE_MIN,
} from "@/lib/home-scroll";
import { cn } from "@/lib/utils";

interface HeroCarouselProps {
  slides: HeroSlide[];
  className?: string;
  /** Anchor id of the section below hero (mobile long-swipe scroll target) */
  projectsAnchorId?: string;
}

const MOBILE_QUERY = "(max-width: 767px)";
const SWIPE_MIN = SECTION_SWIPE_MIN;
const AXIS_LOCK_MIN = SECTION_AXIS_LOCK_MIN;
const EXIT_SWIPE_MIN = SECTION_EXIT_SWIPE_MIN;

type TouchOrigin = {
  x: number;
  y: number;
};

type SwipeAxis = "horizontal" | "vertical" | null;

export function HeroCarousel({
  slides,
  className,
  projectsAnchorId = "home-projects",
}: HeroCarouselProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const touchOriginRef = useRef<TouchOrigin | null>(null);
  const swipeAxisRef = useRef<SwipeAxis>(null);
  const isHeroActiveRef = useRef(true);
  const suppressClickRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isHeroActive, setIsHeroActive] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (slides.length === 0) return;
      setActiveIndex((index + slides.length) % slides.length);
    },
    [slides.length],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    isHeroActiveRef.current = isHeroActive;
  }, [isHeroActive]);

  useEffect(() => {
    const sync = () => {
      setIsHeroActive(window.scrollY <= HERO_REST_MAX_SCROLL_Y);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("scrollend", sync, { passive: true });
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("scrollend", sync);
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || isHovered || !isHeroActive) return;
    const timer = window.setInterval(goNext, 6000);
    return () => window.clearInterval(timer);
  }, [goNext, slides.length, isHovered, isHeroActive]);

  const scrollToProjects = useCallback(() => {
    scrollToProjectsAnchor(projectsAnchorId);
  }, [projectsAnchorId]);

  const resetTouch = useCallback(() => {
    touchOriginRef.current = null;
    swipeAxisRef.current = null;
  }, []);

  const handleHorizontalSwipe = useCallback(
    (deltaX: number) => {
      if (Math.abs(deltaX) < SWIPE_MIN) return;
      if (deltaX < 0) goNext();
      else goPrev();
    },
    [goNext, goPrev],
  );

  const handleTouchStart = (event: React.TouchEvent) => {
    if (isMobile && !isHeroActive) return;

    const touch = event.touches[0];
    if (!touch) return;
    touchOriginRef.current = { x: touch.clientX, y: touch.clientY };
    swipeAxisRef.current = null;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (isMobile && !isHeroActive) {
      resetTouch();
      return;
    }

    const origin = touchOriginRef.current;
    if (!origin) return;

    const touch = event.changedTouches[0];
    if (!touch) {
      resetTouch();
      return;
    }

    const deltaX = touch.clientX - origin.x;
    const deltaY = touch.clientY - origin.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const axis =
      swipeAxisRef.current ?? (absX >= absY ? "horizontal" : "vertical");
    const isTap = absX < SWIPE_MIN && absY < SWIPE_MIN;

    resetTouch();

    if (isMobile && isHeroActive) {
      suppressClickRef.current = true;

      if (isTap) {
        goNext();
        return;
      }

      if (axis === "horizontal") {
        handleHorizontalSwipe(deltaX);
        return;
      }

      if (absY >= EXIT_SWIPE_MIN) {
        scrollToProjects();
        return;
      }

      if (absY >= SWIPE_MIN) {
        if (deltaY < 0) goNext();
        else goPrev();
      }
      return;
    }

    if (!isMobile && isHeroActive) {
      if (isTap) {
        goNext();
        return;
      }
      handleHorizontalSwipe(deltaX);
    }
  };

  const handleCarouselClick = () => {
    if (!isHeroActive) return;

    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    goNext();
  };

  useEffect(() => {
    if (!isMobile) return;

    const section = sectionRef.current;
    if (!section) return;

    const onTouchMove = (event: TouchEvent) => {
      if (!isHeroActiveRef.current) return;

      const origin = touchOriginRef.current;
      const touch = event.touches[0];
      if (!origin || !touch) return;

      const deltaX = touch.clientX - origin.x;
      const deltaY = touch.clientY - origin.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (
        !swipeAxisRef.current &&
        (absX >= AXIS_LOCK_MIN || absY >= AXIS_LOCK_MIN)
      ) {
        swipeAxisRef.current = absX >= absY ? "horizontal" : "vertical";
      }

      const axis = swipeAxisRef.current;
      if (axis === "horizontal" || (axis === null && absX >= absY)) {
        event.preventDefault();
        return;
      }

      if (axis === "vertical" && absY < EXIT_SWIPE_MIN) {
        event.preventDefault();
      }
    };

    section.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => section.removeEventListener("touchmove", onTouchMove);
  }, [isMobile]);

  if (slides.length === 0) return null;

  const slide = slides[activeIndex];

  return (
    <section
      ref={sectionRef}
      id="hero-carousel"
      className={cn(
        "relative w-full overflow-hidden bg-[#231f20]",
        "max-md:h-[100dvh] max-md:min-h-[100dvh] max-md:w-screen max-md:max-w-[100vw]",
        isMobile &&
          (isHeroActive
            ? "max-md:touch-none max-md:overscroll-none"
            : "max-md:touch-pan-y"),
        className,
      )}
      aria-roledescription="carousel"
      aria-label="Dự án nổi bật"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={resetTouch}
    >
      <div className="relative h-full min-h-[72vh] w-full md:min-h-[80vh] md:max-h-[900px] max-md:min-h-0">
        <button
          type="button"
          aria-label="Xem slide tiếp theo"
          className={cn(
            "absolute inset-0 z-[1] border-0 bg-transparent p-0",
            isHeroActive
              ? "cursor-pointer max-md:pointer-events-none"
              : "pointer-events-none",
          )}
          onClick={handleCarouselClick}
        />
        {slides.map((item, index) => (
          <div
            key={item.image}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-in-out",
              index === activeIndex ? "opacity-100" : "opacity-0",
            )}
            aria-hidden={index !== activeIndex}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55" />
          </div>
        ))}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-4 pb-10 pt-24 md:pb-12">
          <div className="flex w-full max-w-6xl items-end justify-between gap-4 text-white">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] md:text-xs">
              {slide.title}
            </p>
            <p className="text-right text-[11px] uppercase tracking-[0.18em] text-white/90 md:text-xs">
              {slide.location}
            </p>
          </div>

          <div className="pointer-events-auto mt-6 flex items-center gap-2.5">
            {slides.map((item, index) => (
              <button
                key={item.image}
                type="button"
                aria-label={`Slide ${index + 1}`}
                aria-current={index === activeIndex}
                onClick={() => goTo(index)}
                className={cn(
                  "rounded-full transition-all",
                  index === activeIndex
                    ? "h-1.5 w-1.5 bg-white"
                    : "h-1.5 w-1.5 border border-white/70 bg-transparent hover:border-white",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
