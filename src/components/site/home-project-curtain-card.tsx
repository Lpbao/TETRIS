"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteProject } from "@/lib/site-content";
import {
  CARD_FALLBACK_VISIBLE_RATIO,
  CARD_REVEAL_VISIBLE_RATIO,
  getCurtainScrollRoot,
  isCardFullyVisible,
  isCardSubstantiallyVisible,
} from "@/lib/home-scroll";
import { ProjectCard } from "@/components/site/project-card";
import { cn } from "@/lib/utils";

const CURTAIN_DURATION_MS = 2000;
/** Card lộ ≥55% quá lâu mà chưa đủ 92% → reveal fallback (tránh curtain che mãi) */
const CURTAIN_FALLBACK_MS = 2500;

interface HomeProjectCurtainCardProps {
  project: SiteProject;
  sectionReady: boolean;
  headerOffset: number;
  reduceMotion: boolean;
  variant?: "default" | "home" | "gallery";
  image?: string;
}

export function HomeProjectCurtainCard({
  project,
  sectionReady,
  headerOffset,
  reduceMotion,
  variant = "home",
  image,
}: HomeProjectCurtainCardProps) {
  const slotRef = useRef<HTMLLIElement>(null);
  const revealedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);

  const reveal = () => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setRevealed(true));
    });
  };

  useEffect(() => {
    if (reduceMotion) {
      setRevealed(true);
      return;
    }

    const el = slotRef.current;
    if (!el || !sectionReady || revealedRef.current) return;

    const scrollRoot = getCurtainScrollRoot(el);

    const tryReveal = () => {
      if (
        isCardFullyVisible(
          el,
          headerOffset,
          CARD_REVEAL_VISIBLE_RATIO,
          scrollRoot,
        )
      ) {
        reveal();
      }
    };

    tryReveal();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry?.isIntersecting &&
          entry.intersectionRatio >= CARD_REVEAL_VISIBLE_RATIO
        ) {
          tryReveal();
          if (revealedRef.current) observer.disconnect();
        }
      },
      {
        root: scrollRoot,
        threshold: [0, 0.5, 0.75, CARD_REVEAL_VISIBLE_RATIO, 1],
        rootMargin: scrollRoot
          ? "0px"
          : `-${headerOffset}px 0px 0px 0px`,
      },
    );

    observer.observe(el);

    const onScroll = () => tryReveal();
    if (scrollRoot) {
      scrollRoot.addEventListener("scroll", onScroll, { passive: true });
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("scrollend", onScroll, { passive: true });
    }
    window.addEventListener("resize", onScroll, { passive: true });

    const fallbackTimer = window.setTimeout(() => {
      if (revealedRef.current) return;
      if (
        isCardSubstantiallyVisible(
          el,
          headerOffset,
          CARD_FALLBACK_VISIBLE_RATIO,
          scrollRoot,
        )
      ) {
        reveal();
        observer.disconnect();
      }
    }, CURTAIN_FALLBACK_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallbackTimer);
      if (scrollRoot) {
        scrollRoot.removeEventListener("scroll", onScroll);
      } else {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("scrollend", onScroll);
      }
      window.removeEventListener("resize", onScroll);
    };
  }, [sectionReady, headerOffset, reduceMotion]);

  const isHome = variant === "home";

  return (
    <li
      ref={slotRef}
      className={cn(
        "relative",
        isHome && "home-project-card-focus",
        isHome && revealed && "home-project-card-focus--reveal",
      )}
    >
      <div className="relative">
        <ProjectCard project={project} variant={variant} image={image} />
        {!isHome && (
          <div
            aria-hidden
            className={cn(
              "home-project-card-curtain",
              revealed && "home-project-card-curtain--reveal",
            )}
            style={
              revealed
                ? ({
                    "--curtain-duration": `${CURTAIN_DURATION_MS}ms`,
                  } as React.CSSProperties)
                : undefined
            }
          />
        )}
      </div>
    </li>
  );
}
