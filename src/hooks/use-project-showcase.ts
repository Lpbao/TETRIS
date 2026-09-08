"use client";

import { useEffect, useMemo, useState } from "react";
import type { SiteProject } from "@/lib/site-content";

export const PROJECT_SHOWCASE_PAGE_SIZE = 12;

export interface UseProjectShowcaseOptions {
  projects: readonly SiteProject[];
  tabsDisplay?: boolean;
  showSearch?: boolean;
  showPagination?: boolean;
  scrollEffectMode?: boolean;
  pageSize?: number;
}

export function useProjectShowcase({
  projects,
  tabsDisplay = false,
  showSearch = false,
  showPagination = false,
  scrollEffectMode = false,
  pageSize = PROJECT_SHOWCASE_PAGE_SIZE,
}: UseProjectShowcaseOptions) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!showSearch) return [...projects];
    const needle = query.trim().toLowerCase();
    if (!needle) return [...projects];
    return projects.filter((project) => {
      const hay = [
        project.title,
        project.location,
        project.categoryLabel,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [projects, query, showSearch]);

  const pageCount = showPagination
    ? Math.max(1, Math.ceil(filtered.length / pageSize))
    : 1;

  const visible = useMemo(() => {
    if (!showPagination) return filtered;
    const safePage = Math.min(page, pageCount);
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageCount, pageSize, showPagination]);

  useEffect(() => {
    setPage(1);
  }, [query, projects]);

  return {
    visible,
    query,
    setQuery,
    page: Math.min(page, pageCount),
    pageCount,
    setPage,
    mode: scrollEffectMode ? ("scroll" as const) : ("grid" as const),
    tabsDisplay,
    showSearch,
    showPagination,
  };
}
