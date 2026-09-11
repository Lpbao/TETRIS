import Link from "next/link";
import { siteBrand } from "@/lib/site-content";
import { cn } from "@/lib/utils";

interface SiteLogoProps {
  className?: string;
  inverted?: boolean;
  /** Trang chủ: tắt prefetch — `force-dynamic` + logo luôn visible sẽ GET / lặp */
  prefetch?: boolean;
}

export function SiteLogo({ className, inverted, prefetch = true }: SiteLogoProps) {
  return (
    <Link
      href="/"
      prefetch={prefetch}
      className={cn(
        "site-header-logo uppercase transition-colors duration-300 motion-reduce:transition-none",
        inverted ? "text-white" : "text-foreground",
        className,
      )}
    >
      <span className="site-header-logo-label">{siteBrand.name}</span>
    </Link>
  );
}
