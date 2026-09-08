"use client";

import { useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { resetSitePage } from "@/lib/site-page-reset";

/**
 * Mỗi lần load / đổi route / đổi query: scroll top + reset DOM state.
 * Page React state reset nhờ `(site)/template.tsx` remount.
 */
export function SitePageReset() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useLayoutEffect(() => {
    resetSitePage();
    const frame = window.requestAnimationFrame(() => resetSitePage());
    const onPageShow = () => resetSitePage();
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [pathname, search]);

  return null;
}
