"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CarouselDots } from "@/components/site/carousel-dots";
import { SiteImage } from "@/components/site/site-image";
import {
  isHeroGestureActive,
  scrollToProjectsAnchor,
  SECTION_AXIS_LOCK_MIN,
  SECTION_SWIPE_MIN,
} from "@/lib/home-scroll";
import type { HeroSlide } from "@/lib/site-content";
import { cn } from "@/lib/utils";

interface HeroCarouselProps {
  slides: HeroSlide[];
  className?: string;
  projectsAnchorId?: string;
}

const WHEEL_COOLDOWN_MS = 420;
const DOT_SETTLE_FALLBACK_MS = 500;

function readDotSettleMs(root: HTMLElement | null) {
  if (!root) return DOT_SETTLE_FALLBACK_MS;
  const raw = getComputedStyle(root).getPropertyValue("--carousel-dot-settle-ms").trim();
  if (raw.endsWith("ms")) return Number.parseFloat(raw) || DOT_SETTLE_FALLBACK_MS;
  if (raw.endsWith("s")) return Number.parseFloat(raw) * 1000 || DOT_SETTLE_FALLBACK_MS;
  return Number.parseFloat(raw) || DOT_SETTLE_FALLBACK_MS;
}

type Point = { x: number; y: number };

function isControlTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(target.closest("button, a, [data-hero-pager], [data-carousel-dots]"))
  );
}

/** iOS fires mouseenter on touch and often never mouseleave — do not pause autoplay */
function canHoverPauseAutoplay() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

export function HeroCarousel({
  slides,
  className,
  projectsAnchorId = "home-projects",
}: HeroCarouselProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<Point | null>(null);
  const axisRef = useRef<"horizontal" | "vertical" | null>(null);
  const touchArmedRef = useRef(false);
  const ignoreClickUntilRef = useRef(0);
  const wheelLockRef = useRef(0);
  const goToRef = useRef<(index: number) => void>(() => {});
  const activeIndexRef = useRef(0);
  const jumpingRef = useRef(false);
  const jumpTimerRef = useRef(0);
  const dotSettleTimerRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dotIndex, setDotIndex] = useState(0);
  const [isHeroActive, setIsHeroActive] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  activeIndexRef.current = activeIndex;

  const syncSlideWidth = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    section.style.setProperty("--hero-slide-w", `${section.clientWidth}px`);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (slides.length === 0) return;
      const next = (index + slides.length) % slides.length;
      const track = trackRef.current;
      const slide = track?.querySelectorAll<HTMLElement>("[data-hero-slide]")[next];
      setActiveIndex(next);
      if (!track || !slide) return;

      jumpingRef.current = true;
      track.dataset.heroJumping = "";
      window.clearTimeout(jumpTimerRef.current);
      window.clearTimeout(dotSettleTimerRef.current);
      const left = slide.offsetLeft;
      track.scrollLeft = left;
      requestAnimationFrame(() => {
        track.scrollLeft = left;
        jumpTimerRef.current = window.setTimeout(() => {
          jumpingRef.current = false;
          delete track.dataset.heroJumping;
          window.clearTimeout(dotSettleTimerRef.current);
          dotSettleTimerRef.current = window.setTimeout(() => {
            setDotIndex(next);
          }, readDotSettleMs(sectionRef.current));
        }, 80);
      });
    },
    [slides.length],
  );
  goToRef.current = goTo;

  useEffect(() => {
    const sync = () => {
      const active = isHeroGestureActive();
      setIsHeroActive(active);
      if (active && !canHoverPauseAutoplay()) setIsHovered(false);
    };
    const onOrient = () => {
      sync();
      syncSlideWidth();
    };
    sync();
    syncSlideWidth();
    const section = sectionRef.current;
    const resize = section ? new ResizeObserver(syncSlideWidth) : null;
    if (section && resize) resize.observe(section);
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("scrollend", sync, { passive: true });
    window.addEventListener("pageshow", sync);
    window.addEventListener("orientationchange", onOrient);
    window.addEventListener("resize", syncSlideWidth);
    document.addEventListener("visibilitychange", sync);
    return () => {
      resize?.disconnect();
      window.removeEventListener("scroll", sync);
      window.removeEventListener("scrollend", sync);
      window.removeEventListener("pageshow", sync);
      window.removeEventListener("orientationchange", onOrient);
      window.removeEventListener("resize", syncSlideWidth);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [syncSlideWidth]);

  useEffect(() => {
    const clearHover = () => setIsHovered(false);
    window.addEventListener("touchstart", clearHover, { passive: true });
    return () => window.removeEventListener("touchstart", clearHover);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const commitDotFromSlide = () => {
      if (jumpingRef.current) return;
      const width = track.clientWidth;
      if (width <= 0) return;
      const index = Math.min(
        slides.length - 1,
        Math.max(0, Math.round(track.scrollLeft / width)),
      );
      setActiveIndex(index);
      setDotIndex(index);
    };

    const scheduleDotCommit = () => {
      if (jumpingRef.current) return;
      window.clearTimeout(dotSettleTimerRef.current);
      dotSettleTimerRef.current = window.setTimeout(
        commitDotFromSlide,
        readDotSettleMs(sectionRef.current),
      );
    };

    track.addEventListener("scroll", scheduleDotCommit, { passive: true });
    track.addEventListener("scrollend", scheduleDotCommit);
    return () => {
      window.clearTimeout(dotSettleTimerRef.current);
      track.removeEventListener("scroll", scheduleDotCommit);
      track.removeEventListener("scrollend", scheduleDotCommit);
    };
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || !isHeroActive) return;
    if (isHovered && canHoverPauseAutoplay()) return;
    const timer = window.setInterval(() => {
      goToRef.current(activeIndexRef.current + 1);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [slides.length, isHovered, isHeroActive]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const arm = (point: Point) => {
      if (!isHeroGestureActive()) return false;
      originRef.current = point;
      axisRef.current = null;
      return true;
    };

    const finish = (x: number, y: number) => {
      const origin = originRef.current;
      const axis = axisRef.current;
      originRef.current = null;
      axisRef.current = null;
      touchArmedRef.current = false;
      if (!origin) return;

      const deltaX = x - origin.x;
      const deltaY = y - origin.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      const resolved = axis ?? (absX >= absY ? "horizontal" : "vertical");
      const isTap = absX < SECTION_SWIPE_MIN && absY < SECTION_SWIPE_MIN;

      ignoreClickUntilRef.current = Date.now() + 400;

      if (isTap) {
        goToRef.current(activeIndexRef.current + 1);
        return;
      }

      if (resolved === "horizontal") {
        return;
      }

      /* Vuốt lên (deltaY < 0) → xuống projects. Không chặn native scroll. */
      if (deltaY < 0 && absY >= SECTION_SWIPE_MIN) {
        scrollToProjectsAnchor(projectsAnchorId);
      }
    };

    const lockAxis = (x: number, y: number) => {
      const origin = originRef.current;
      if (!origin) return;
      const absX = Math.abs(x - origin.x);
      const absY = Math.abs(y - origin.y);
      if (!axisRef.current && (absX >= SECTION_AXIS_LOCK_MIN || absY >= SECTION_AXIS_LOCK_MIN)) {
        axisRef.current = absX >= absY ? "horizontal" : "vertical";
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1 || isControlTarget(event.target)) return;
      const touch = event.touches[0];
      if (!arm({ x: touch.clientX, y: touch.clientY })) return;
      touchArmedRef.current = true;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!touchArmedRef.current || !originRef.current || event.touches.length !== 1) return;
      const touch = event.touches[0];
      lockAxis(touch.clientX, touch.clientY);
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!touchArmedRef.current) return;
      const touch = event.changedTouches[0];
      finish(touch.clientX, touch.clientY);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch" || isControlTarget(event.target)) return;
      if (!arm({ x: event.clientX, y: event.clientY })) return;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !originRef.current) return;
      lockAxis(event.clientX, event.clientY);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !originRef.current) return;
      finish(event.clientX, event.clientY);
    };

    const onClick = (event: MouseEvent) => {
      if (isControlTarget(event.target)) return;
      if (Date.now() < ignoreClickUntilRef.current) {
        event.preventDefault();
        return;
      }
      if (!isHeroGestureActive()) return;
      goToRef.current(activeIndexRef.current + 1);
    };

    const onWheel = (event: WheelEvent) => {
      if (!isHeroGestureActive()) return;
      const absX = Math.abs(event.deltaX);
      const absY = Math.abs(event.deltaY);
      if (absX < 8 || absX < absY) return;
      event.preventDefault();
      const now = Date.now();
      if (now < wheelLockRef.current) return;
      wheelLockRef.current = now + WHEEL_COOLDOWN_MS;
      if (event.deltaX > 0) goToRef.current(activeIndexRef.current + 1);
      else goToRef.current(activeIndexRef.current - 1);
    };

    section.addEventListener("touchstart", onTouchStart, { passive: true });
    section.addEventListener("touchmove", onTouchMove, { passive: true });
    section.addEventListener("touchend", onTouchEnd);
    section.addEventListener("touchcancel", onTouchEnd);
    section.addEventListener("pointerdown", onPointerDown);
    section.addEventListener("pointermove", onPointerMove, { passive: true });
    section.addEventListener("pointerup", onPointerUp);
    section.addEventListener("pointercancel", onPointerUp);
    section.addEventListener("click", onClick);
    section.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      section.removeEventListener("touchstart", onTouchStart);
      section.removeEventListener("touchmove", onTouchMove);
      section.removeEventListener("touchend", onTouchEnd);
      section.removeEventListener("touchcancel", onTouchEnd);
      section.removeEventListener("pointerdown", onPointerDown);
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerup", onPointerUp);
      section.removeEventListener("pointercancel", onPointerUp);
      section.removeEventListener("click", onClick);
      section.removeEventListener("wheel", onWheel);
    };
  }, [projectsAnchorId]);

  if (slides.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="hero-carousel"
      data-home-section="slides"
      data-hero-active={isHeroActive ? "" : undefined}
      className={cn("relative w-full overflow-hidden bg-[#231f20]", className)}
      aria-roledescription="carousel"
      aria-label="Ảnh nổi bật"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse" && canHoverPauseAutoplay()) {
          setIsHovered(true);
        }
      }}
      onPointerLeave={() => setIsHovered(false)}
    >
      <div ref={trackRef} data-hero-track>
        {slides.map((item, index) => (
          <div key={`${item.image}-${index}`} data-hero-slide aria-hidden={index !== activeIndex}>
            <SiteImage
              src={item.image}
              alt={item.title}
              fill
              priority={index === 0}
              draggable={false}
              className="pointer-events-none object-cover"
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Slide trước"
            className="absolute top-1/2 left-3 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center text-white md:flex"
            onClick={() => goTo(activeIndex - 1)}
          >
            <ChevronLeft className="size-8" strokeWidth={1.25} />
          </button>
          <button
            type="button"
            aria-label="Slide tiếp"
            className="absolute top-1/2 right-3 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center text-white md:flex"
            onClick={() => goTo(activeIndex + 1)}
          >
            <ChevronRight className="size-8" strokeWidth={1.25} />
          </button>
        </>
      ) : null}

      <div data-hero-caption data-hero-pager className="absolute inset-x-0 bottom-0 z-20 px-4">
        <CarouselDots count={slides.length} activeIndex={dotIndex} onSelect={goTo} />
      </div>
    </section>
  );
}
