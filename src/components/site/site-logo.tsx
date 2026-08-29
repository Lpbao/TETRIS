import Link from "next/link";
import { siteBrand } from "@/lib/site-content";
import { cn } from "@/lib/utils";

interface SiteLogoProps {
  className?: string;
  inverted?: boolean;
}

export function SiteLogo({ className, inverted }: SiteLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "site-header-logo font-[family-name:var(--font-logo)] text-base tracking-[0.12em] uppercase transition-colors duration-300 motion-reduce:transition-none lg:text-lg",
        inverted ? "text-white" : "text-foreground",
        className,
      )}
    >
      {siteBrand.name}
    </Link>
  );
}
