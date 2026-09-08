"use client";

import { Suspense } from "react";
import { HomeProjectCurtainList } from "@/components/site/home-project-curtain-list";
import { ProjectDetailRelated } from "@/components/site/project-detail-related";
import { ProjectFilter } from "@/components/site/project-filter";
import { Input } from "@/components/ui/input";
import { useProjectShowcase } from "@/hooks/use-project-showcase";
import type { SiteProject } from "@/lib/site-content";
import { cn } from "@/lib/utils";

export interface ProjectShowcaseProps {
  projects: SiteProject[];
  className?: string;
  id?: string;
  layout?: "home" | "page";
  tabsDisplay?: boolean;
  showSearch?: boolean;
  showPagination?: boolean;
  scrollEffectMode?: boolean;
  emptyMessage?: string;
}

export function ProjectShowcase({
  projects,
  className,
  id,
  layout = "page",
  tabsDisplay = false,
  showSearch = false,
  showPagination = false,
  scrollEffectMode = false,
  emptyMessage = "Chưa có dự án trong danh mục này.",
}: ProjectShowcaseProps) {
  const {
    visible,
    query,
    setQuery,
    page,
    pageCount,
    setPage,
    mode,
  } = useProjectShowcase({
    projects,
    tabsDisplay,
    showSearch,
    showPagination,
    scrollEffectMode,
  });

  const isHome = layout === "home";

  if (mode === "scroll") {
    return <ProjectDetailRelated projects={visible} className={className} />;
  }

  return (
    <section
      id={id}
      data-home-section={isHome ? "projects" : undefined}
      className={cn(
        isHome
          ? "flex min-h-[calc(100lvh-var(--site-header-total-height))] w-full flex-col justify-start px-3 py-8 md:px-4 md:py-12"
          : "flex min-h-0 w-full flex-col justify-start",
        className,
      )}
    >
      {tabsDisplay ? (
        <Suspense
          fallback={
            <div className="h-[52px] shrink-0 border-b border-border/60 md:h-[60px]" />
          }
        >
          <ProjectFilter stickTo="header" />
        </Suspense>
      ) : null}

      {showSearch ? (
        <div className="mx-auto w-full max-w-6xl px-4 py-4">
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm dự án"
            aria-label="Tìm dự án"
          />
        </div>
      ) : null}

      <div
        className={cn(
          "mx-auto w-full",
          isHome
            ? "flex max-w-lg flex-1 flex-col justify-start px-0 md:max-w-6xl"
            : "max-w-6xl px-4 py-6 md:py-8",
        )}
      >
        {visible.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <HomeProjectCurtainList
            projects={visible}
            sectionId={id}
            cardVariant={isHome ? "home" : "default"}
            gate={isHome ? "anchor" : "immediate"}
          />
        )}
      </div>

      {showPagination && pageCount > 1 ? (
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-4 px-4 pb-8">
          <button
            type="button"
            className="text-xs uppercase tracking-[0.2em] text-foreground disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Trước
          </button>
          <span className="text-xs text-muted-foreground">
            {page} / {pageCount}
          </span>
          <button
            type="button"
            className="text-xs uppercase tracking-[0.2em] text-foreground disabled:opacity-40"
            disabled={page >= pageCount}
            onClick={() => setPage(page + 1)}
          >
            Sau
          </button>
        </div>
      ) : null}
    </section>
  );
}
