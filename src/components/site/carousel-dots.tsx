"use client";

import { cn } from "@/lib/utils";

interface CarouselDotsProps {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}

export function CarouselDots({
  count,
  activeIndex,
  onSelect,
  className,
}: CarouselDotsProps) {
  if (count <= 1) return null;

  return (
    <div
      data-carousel-dots
      data-active-index={activeIndex}
      className={cn("flex items-center justify-center", className)}
      onPointerDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
    >
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Slide ${index + 1}`}
          aria-current={index === activeIndex}
          data-carousel-dot={index === activeIndex ? "active" : ""}
          onPointerUp={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onSelect(index);
          }}
          className="relative shrink-0"
        >
          <span className="pointer-events-none absolute top-1/2 left-1/2 size-11 -translate-x-1/2 -translate-y-1/2" />
        </button>
      ))}
    </div>
  );
}
