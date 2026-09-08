"use client";

import Link from "next/link";
import type { ReactNode } from "react";
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
  const { show } = useSiteLoading();

  return (
    <Link
      href={href}
      className="flex flex-col items-center"
      onClick={() => {
        if (triggerLoading) show();
      }}
    >
      {children}
    </Link>
  );
}
