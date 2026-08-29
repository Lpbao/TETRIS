"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { DesktopNav } from "@/components/site/desktop-nav";
import { MobileNav } from "@/components/site/mobile-nav";
import { SiteLogo } from "@/components/site/site-logo";
import { cn } from "@/lib/utils";

const HEADER_OVERLAY_SCROLL_THRESHOLD = 48;

function subscribeToScroll(onStoreChange: () => void) {
  window.addEventListener("scroll", onStoreChange, { passive: true });
  return () => window.removeEventListener("scroll", onStoreChange);
}

function getScrollPastHeaderOverlayThreshold() {
  return window.scrollY > HEADER_OVERLAY_SCROLL_THRESHOLD;
}

function getScrollPastHeaderOverlayThresholdServer() {
  return false;
}

export function SiteHeader() {
  const pathname = usePathname();

  return <SiteHeaderInner key={pathname} pathname={pathname} />;
}

function SiteHeaderInner({ pathname }: { pathname: string }) {
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    getScrollPastHeaderOverlayThreshold,
    getScrollPastHeaderOverlayThresholdServer,
  );

  const overlayCarousel = isHome && !scrolled;
  const menuActive = menuOpen || menuClosing;
  const lightChrome = overlayCarousel && !menuActive;
  const solidHeader = !overlayCarousel || menuActive;

  return (
    <header
      className={cn(
        "top-0 z-50 w-full border-b transition-[background-color,border-color,backdrop-filter] duration-300 motion-reduce:transition-none",
        isHome ? "fixed" : "sticky",
        menuActive
          ? "border-border/60 bg-background"
          : solidHeader
            ? "border-border/60 bg-background/95 backdrop-blur-sm"
            : "border-transparent bg-transparent",
      )}
    >
      <div className="site-header-bar relative z-10">
        <SiteLogo
          inverted={lightChrome}
          className="site-header-logo relative z-10"
        />
        <div className="relative z-10 ml-auto flex items-center">
          <DesktopNav inverted={lightChrome} />
          <MobileNav
            lightChrome={lightChrome}
            open={menuOpen}
            onOpenChange={setMenuOpen}
            onClosingChange={setMenuClosing}
          />
        </div>
      </div>
    </header>
  );
}
