"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSiteLoading } from "@/components/site/site-loading-context";
import {
  parseProjectCategory,
  projectCategories,
} from "@/lib/site-content";
import { cn } from "@/lib/utils";

interface ProjectFilterProps {
  /** `header` = dính dưới site header (document). `scroller` = đỉnh inner pager. */
  stickTo?: "header" | "scroller";
}

function isTouchUi() {
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 767px)").matches
  );
}

export function ProjectFilter({ stickTo = "header" }: ProjectFilterProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { show } = useSiteLoading();
  const active = parseProjectCategory(searchParams.get("category") ?? undefined);

  return (
    <nav
      className={cn(
        "sticky z-20 shrink-0 border-b border-border/60 bg-background",
        stickTo === "scroller"
          ? "top-0"
          : "top-[var(--site-header-total-height)]",
      )}
      aria-label="Lọc dự án theo danh mục"
    >
      <ul className="mx-auto flex max-w-6xl items-center justify-center gap-8 px-4 py-5 md:gap-12 md:py-6">
        {projectCategories.map((category) => {
          const isActive = active === category.id;
          const href = isActive
            ? pathname
            : `${pathname}?category=${category.id}`;

          return (
            <li key={category.id}>
              <Link
                href={href}
                scroll={false}
                prefetch={false}
                onClick={() => {
                  if (typeof window !== "undefined" && !isTouchUi()) show();
                }}
                className={cn(
                  "inline-flex min-h-11 items-center touch-manipulation text-xs font-medium uppercase tracking-[0.25em] md:text-sm",
                  isActive
                    ? "text-brand-red"
                    : "text-foreground hover:text-brand-red",
                )}
              >
                {category.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
