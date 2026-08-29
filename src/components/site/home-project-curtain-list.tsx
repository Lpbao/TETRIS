"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SiteProject } from "@/lib/site-content";
import { getHeaderOffset, isSectionGateOpen } from "@/lib/home-scroll";
import { HomeProjectCurtainCard } from "@/components/site/home-project-curtain-card";
import { cn } from "@/lib/utils";

export type ProjectCurtainItem = {
  key: string;
  project: SiteProject;
  image?: string;
};

interface HomeProjectCurtainListProps {
  projects?: SiteProject[];
  items?: ProjectCurtainItem[];
  sectionId?: string;
  className?: string;
  cardVariant?: "default" | "home" | "gallery";
  /** `anchor` = Home snap dưới menu; `immediate` = chỉ chờ card lộ đủ */
  gate?: "anchor" | "immediate";
}

export function HomeProjectCurtainList({
  projects = [],
  items,
  sectionId = "home-projects",
  className,
  cardVariant = "home",
  gate = "anchor",
}: HomeProjectCurtainListProps) {
  const sectionReadyRef = useRef(false);
  const [sectionReady, setSectionReady] = useState(false);
  const [headerOffset, setHeaderOffset] = useState(64);
  const [reduceMotion, setReduceMotion] = useState(false);

  const latchSection = useCallback(() => {
    if (sectionReadyRef.current) return;
    sectionReadyRef.current = true;
    setSectionReady(true);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setReduceMotion(reduced);
    setHeaderOffset(getHeaderOffset());
  }, []);

  useEffect(() => {
    const syncOffset = () => setHeaderOffset(getHeaderOffset());
    syncOffset();

    if (reduceMotion || gate === "immediate") {
      latchSection();
    }

    if (reduceMotion) return;

    if (gate === "immediate") {
      window.addEventListener("resize", syncOffset, { passive: true });
      return () => window.removeEventListener("resize", syncOffset);
    }

    const section = document.getElementById(sectionId);
    if (!section) return;

    const sync = () => {
      syncOffset();
      if (isSectionGateOpen(section)) {
        latchSection();
      }
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    window.addEventListener("scrollend", sync, { passive: true });

    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("scrollend", sync);
    };
  }, [sectionId, reduceMotion, latchSection, gate]);

  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-10 lg:grid-cols-4",
        className,
      )}
    >
      {(items ?? projects.map((project) => ({ key: project.slug, project }))).map(
        (item) => (
          <HomeProjectCurtainCard
            key={item.key}
            project={item.project}
            image={item.image}
            variant={cardVariant}
            sectionReady={sectionReady}
            headerOffset={headerOffset}
            reduceMotion={reduceMotion}
          />
        ),
      )}
    </ul>
  );
}
