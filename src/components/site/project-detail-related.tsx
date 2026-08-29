"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { getProjectCover, type SiteProject } from "@/lib/site-content";
import { cn } from "@/lib/utils";

const RELATED_COLUMNS_MOBILE = 3;
const RELATED_COLUMNS_DESKTOP = 7;
const RELATED_ROWS_DESKTOP = 5;
const RELATED_CELLS = RELATED_COLUMNS_DESKTOP * RELATED_ROWS_DESKTOP;
const RELATED_TITLE = "Các dự án khác";
const RELATED_DESKTOP_MQ = "(min-width: 1024px)";

interface ProjectDetailRelatedProps {
  projects: SiteProject[];
  className?: string;
}

function fillGrid(projects: SiteProject[], cells: number) {
  if (projects.length === 0) return [];
  return Array.from({ length: cells }, (_, index) => ({
    project: projects[index % projects.length]!,
    slot: index,
  }));
}

function countGridColumns(grid: HTMLElement, fallback: number) {
  const raw = getComputedStyle(grid).getPropertyValue("grid-template-columns");
  const count = raw.split(/\s+/).filter(Boolean).length;
  return count > 0 ? count : fallback;
}

export function ProjectDetailRelated({
  projects,
  className,
}: ProjectDetailRelatedProps) {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);
  const cells = fillGrid(projects, RELATED_CELLS);
  const titleChars = [...RELATED_TITLE];

  useEffect(() => {
    const mq = window.matchMedia(RELATED_DESKTOP_MQ);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced || cells.length === 0) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const textElement = root.querySelector<HTMLElement>(".text");
      const chars = textElement?.querySelectorAll<HTMLElement>(".char");
      const gridFull = root.querySelector<HTMLElement>(".grid--full");

      if (textElement && chars && chars.length > 0) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: textElement,
              start: "top 90%",
              end: "top 45%",
              scrub: true,
            },
          })
          .fromTo(
            chars,
            { yPercent: 300, autoAlpha: 0 },
            {
              yPercent: 0,
              autoAlpha: 1,
              ease: "sine",
              stagger: {
                each: 0.04,
                from: "center",
              },
            },
          );
      }

      if (!gridFull) return;

      const gridFullItems = [
        ...gridFull.querySelectorAll<HTMLElement>(".grid__item"),
      ].filter((item) => getComputedStyle(item).display !== "none");
      const numColumns = countGridColumns(
        gridFull,
        isDesktop ? RELATED_COLUMNS_DESKTOP : RELATED_COLUMNS_MOBILE,
      );
      const middleColumnIndex = Math.floor(numColumns / 2);
      const columns: HTMLElement[][] = Array.from(
        { length: numColumns },
        () => [],
      );

      gridFullItems.forEach((item, index) => {
        columns[index % numColumns]?.push(item);
      });

      columns.forEach((columnItems, columnIndex) => {
        if (columnItems.length === 0) return;
        const delayFactor = Math.abs(columnIndex - middleColumnIndex) * 0.2;
        const images = columnItems
          .map((item) => item.querySelector<HTMLElement>(".grid__item-img"))
          .filter((img): img is HTMLElement => Boolean(img));

        gsap
          .timeline({
            scrollTrigger: {
              trigger: gridFull,
              start: "top bottom",
              end: "center center",
              scrub: true,
            },
          })
          .from(columnItems, {
            yPercent: 450,
            autoAlpha: 0,
            delay: delayFactor,
            ease: "sine",
          })
          .from(
            images,
            {
              transformOrigin: "50% 0%",
              ease: "sine",
            },
            0,
          );
      });
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    const raf = window.requestAnimationFrame(refresh);
    window.addEventListener("resize", refresh);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", refresh);
      ctx.revert();
    };
  }, [cells.length, isDesktop, reduced]);

  if (cells.length === 0) return null;

  return (
    <section
      ref={rootRef}
      className={cn("project-detail-related", className)}
      aria-label="Dự án khác"
    >
      <div className="project-detail-related__intro">
        <h2 className="text" aria-label={RELATED_TITLE}>
          {titleChars.map((char, index) => (
            <span
              key={`${char}-${index}`}
              className="char"
              aria-hidden="true"
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h2>
      </div>

      <div className="grid grid--full">
        {cells.map(({ project, slot }) => (
          <figure key={`${project.slug}-${slot}`} className="grid__item">
            <Link href={`/projects/${project.slug}`}>
              <div
                className="grid__item-img"
                style={{
                  backgroundImage: `url("${getProjectCover(project)}")`,
                }}
              />
              <span className="sr-only">{project.title}</span>
            </Link>
          </figure>
        ))}
      </div>

      <div className="project-detail-related__spacer" aria-hidden />
    </section>
  );
}
