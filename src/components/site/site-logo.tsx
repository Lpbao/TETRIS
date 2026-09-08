import Link from "next/link";
import {
  TETRIS_LOGO_BLOCKS,
  TETRIS_LOGO_VIEW_H,
  TETRIS_LOGO_VIEW_W,
  TETRIS_LOGO_VIEW_X,
  TETRIS_LOGO_VIEW_Y,
} from "@/lib/tetris-logo-mark";
import { siteBrand } from "@/lib/site-content";
import { cn } from "@/lib/utils";

interface SiteLogoProps {
  className?: string;
  inverted?: boolean;
  /** Trang chủ: tắt prefetch — `force-dynamic` + logo luôn visible sẽ GET / lặp */
  prefetch?: boolean;
}

function TetrisLogoMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`${TETRIS_LOGO_VIEW_X} ${TETRIS_LOGO_VIEW_Y} ${TETRIS_LOGO_VIEW_W} ${TETRIS_LOGO_VIEW_H}`}
      fill="currentColor"
      className={className}
      aria-hidden
    >
      {Object.values(TETRIS_LOGO_BLOCKS).map((block) => (
        <rect
          key={`${block.x}-${block.y}`}
          x={block.x}
          y={block.y}
          width={block.w}
          height={block.h}
        />
      ))}
    </svg>
  );
}

export function SiteLogo({ className, inverted, prefetch = true }: SiteLogoProps) {
  return (
    <Link
      href="/"
      prefetch={prefetch}
      className={cn(
        "site-header-logo inline-flex items-center gap-[0.35em] font-[family-name:var(--logo-default-font)] text-base tracking-[0.12em] uppercase transition-colors duration-300 motion-reduce:transition-none lg:text-lg",
        inverted ? "text-white" : "text-foreground",
        className,
      )}
    >
      <TetrisLogoMark className="h-[1em] w-auto shrink-0" />
      {siteBrand.name}
    </Link>
  );
}
