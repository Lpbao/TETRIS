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

export function ProjectFilter({ stickTo = "header" }: ProjectFilterProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { navigateWithLoading } = useSiteLoading();
  const active = parseProjectCategory(searchParams.get("category") ?? undefined);

  return (
    <nav
      className={cn(
        "sticky z-20 shrink-0 bg-background",
        stickTo === "scroller"
          ? "top-0"
          : "top-[var(--site-header-total-height)]",
      )}
      aria-label="Lọc dự án theo danh mục"
    >
      <ul className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 md:py-6">
        {projectCategories.map((category) => {
          const isActive = active === category.id;
          const href = isActive
            ? pathname
            : `${pathname}?category=${category.id}`;

          return (
            <li key={category.id} className="flex min-w-0 flex-1 justify-center">
              <Link
                href={href}
                scroll={false}
                prefetch={false}
                onClick={(event) => {
                  event.preventDefault();
                  navigateWithLoading(href, { scroll: false });
                }}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center touch-manipulation text-xs font-medium uppercase tracking-[0.25em] md:text-sm",
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
