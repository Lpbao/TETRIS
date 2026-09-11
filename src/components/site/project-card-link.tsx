"use client";

import Link from "next/link";
import type { ReactNode, MouseEvent } from "react";
import { useSiteLoading } from "@/components/site/site-loading-context";

interface ProjectCardLinkProps {
  href: string;
  children: ReactNode;
  triggerLoading?: boolean;
}

export function ProjectCardLink({
  href,
  children,
  triggerLoading = false,
}: ProjectCardLinkProps) {
  const { navigateWithLoading } = useSiteLoading();

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!triggerLoading) return;
    event.preventDefault();
    navigateWithLoading(href);
  };

  return (
    <Link href={href} className="flex flex-col items-center" onClick={onClick}>
      {children}
    </Link>
  );
}
