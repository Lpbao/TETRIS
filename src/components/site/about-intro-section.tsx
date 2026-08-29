"use client";

import type { ReactNode } from "react";
import { useScrollYBlur } from "@/hooks/use-scroll-y-blur";
import { cn } from "@/lib/utils";

interface AboutIntroSectionProps {
  children: ReactNode;
  className?: string;
}

export function AboutIntroSection({
  children,
  className,
}: AboutIntroSectionProps) {
  const rootRef = useScrollYBlur("about-hero");

  return (
    <div
      ref={rootRef}
      id="about-intro"
      data-about-intro=""
      data-morph-pin-content=""
      className={cn("relative w-full", className)}
    >
      {children}
    </div>
  );
}
