"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { projectCategories, type ProjectCategory } from "@/lib/site-content";
import { cn } from "@/lib/utils";

interface ProjectFilterProps {
  /** `header` = dính dưới site header (document). `scroller` = đỉnh inner pager. */
  stickTo?: "header" | "scroller";
}

export function ProjectFilter({ stickTo = "header" }: ProjectFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") as ProjectCategory | null;

  const setCategory = (category: ProjectCategory | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) params.set("category", category);
    else params.delete("category");

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <nav
      className={cn(
        "sticky z-10 shrink-0 border-b border-border/60 bg-background",
        stickTo === "scroller"
          ? "top-0"
          : "top-[var(--site-header-total-height)]",
      )}
      aria-label="Lọc dự án theo danh mục"
    >
      <ul className="mx-auto flex max-w-6xl items-center justify-center gap-8 px-4 py-5 md:gap-12 md:py-6">
        {projectCategories.map((category) => {
          const isActive = active === category.id;
          return (
            <li key={category.id}>
              <button
                type="button"
                onClick={() =>
                  setCategory(isActive ? null : category.id)
                }
                className={cn(
                  "text-xs font-medium uppercase tracking-[0.25em] md:text-sm",
                  isActive
                    ? "text-brand-red"
                    : "text-foreground hover:text-brand-red",
                )}
              >
                {category.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
