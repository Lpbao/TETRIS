import Link from "next/link";
import type { SiteProject } from "@/lib/site-content";
import { HomeProjectCurtainList } from "@/components/site/home-project-curtain-list";
import { cn } from "@/lib/utils";

interface ProjectGridProps {
  projects: SiteProject[];
  className?: string;
  showViewAll?: boolean;
  emptyMessage?: string;
  variant?: "default" | "home";
  id?: string;
}

export function ProjectGrid({
  projects,
  className,
  showViewAll = false,
  emptyMessage = "Chưa có dự án trong danh mục này.",
  variant = "default",
  id,
}: ProjectGridProps) {
  const isHome = variant === "home";

  return (
    <section
      id={id}
      className={cn(
        isHome
          ? "flex min-h-[calc(100dvh-var(--site-header-total-height))] w-full flex-col justify-start px-3 py-8 md:px-4 md:py-12"
          : "px-4 py-10 md:py-14",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto w-full",
          isHome ? "flex max-w-lg flex-1 flex-col justify-start md:max-w-6xl" : "max-w-6xl",
        )}
      >
        {projects.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <HomeProjectCurtainList
            projects={projects}
            sectionId={id}
            cardVariant={variant}
            gate={isHome ? "anchor" : "immediate"}
          />
        )}

        {showViewAll && projects.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              href="/projects"
              className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-brand-red"
            >
              Xem tất cả dự án →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
