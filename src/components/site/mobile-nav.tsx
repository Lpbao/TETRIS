"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { SiteNavLinks, type MobileMenuPhase } from "@/components/site/site-nav-links";
import { cn } from "@/lib/utils";

/** Chrome (logo/icon/header) trước, panel opaque, rồi links stagger */
export const MENU_CHROME_MS = 300;
export const MENU_LINK_STAGGER_MS = 50;
export const MENU_LINK_ANIM_MS = 300;
export const MENU_LINKS_CLOSE_MS = 180;

export const MENU_OPEN_SEQUENCE_MS =
  MENU_CHROME_MS + MENU_LINK_ANIM_MS + 4 * MENU_LINK_STAGGER_MS;

/** Panel giữ opaque đến hết — tránh carousel flash khi chrome revert (P2 #9) */
export const MENU_CLOSE_SEQUENCE_MS = MENU_LINKS_CLOSE_MS + MENU_CHROME_MS;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type { MobileMenuPhase };

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServer() {
  return false;
}

interface MobileNavProps {
  lightChrome?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClosingChange?: (closing: boolean) => void;
}

export function MobileNav({
  lightChrome = false,
  open,
  onOpenChange,
  onClosingChange,
}: MobileNavProps) {
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [phase, setPhase] = useState<MobileMenuPhase>("closed");
  const [panelVisible, setPanelVisible] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getReducedMotionServer,
  );
  const chromeMs = reducedMotion ? 0 : MENU_CHROME_MS;
  const iconTone = lightChrome ? "bg-white" : "bg-foreground";
  const menuExpanded = phase !== "closed";

  const openMenu = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setPhase("opening");
    setPanelVisible(false);
    onClosingChange?.(false);
    onOpenChange(true);
  }, [onOpenChange, onClosingChange]);

  const closeMenu = useCallback(() => {
    if (phase === "closed" || phase === "closing") return;
    setPhase("closing");
    onClosingChange?.(true);
  }, [phase, onClosingChange]);

  useEffect(() => {
    if (phase === "opening") {
      const openSequenceMs = reducedMotion
        ? 0
        : MENU_OPEN_SEQUENCE_MS;

      const panelTimer = window.setTimeout(
        () => setPanelVisible(true),
        chromeMs,
      );
      const openTimer = window.setTimeout(
        () => setPhase("open"),
        openSequenceMs,
      );
      return () => {
        window.clearTimeout(panelTimer);
        window.clearTimeout(openTimer);
      };
    }

    if (phase === "closing") {
      const closeSequenceMs = reducedMotion ? 0 : MENU_CLOSE_SEQUENCE_MS;

      const closeTimer = window.setTimeout(() => {
        setPanelVisible(false);
        setPhase("closed");
        onOpenChange(false);
        onClosingChange?.(false);
      }, closeSequenceMs);
      return () => window.clearTimeout(closeTimer);
    }

    if (phase === "closed") {
      setPanelVisible(false);
    }
  }, [phase, onOpenChange, onClosingChange, chromeMs, reducedMotion]);

  useEffect(() => {
    if (!open && phase !== "closed" && phase !== "closing") {
      setPhase("closed");
      setPanelVisible(false);
      onClosingChange?.(false);
    }
  }, [open, phase, onClosingChange]);

  useEffect(() => {
    document.body.style.overflow = menuExpanded ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuExpanded]);

  useEffect(() => {
    if (!menuExpanded) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }

      if (event.key !== "Tab") return;

      const focusables: HTMLElement[] = [];
      if (toggleRef.current) focusables.push(toggleRef.current);
      if (panelRef.current) {
        panelRef.current
          .querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
          .forEach((element) => focusables.push(element));
      }
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !active || !focusables.includes(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuExpanded, closeMenu]);

  useEffect(() => {
    if (phase !== "open" || !panelRef.current) return;
    panelRef.current.querySelector<HTMLElement>("a[href]")?.focus();
  }, [phase]);

  useEffect(() => {
    if (phase !== "closed") return;
    const target = previousFocusRef.current;
    previousFocusRef.current = null;
    if (target?.isConnected) target.focus();
  }, [phase]);

  return (
    <div className="lg:hidden">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={menuExpanded}
        aria-controls={menuId}
        aria-label={menuExpanded ? "Đóng menu" : "Mở menu"}
        className="site-header-menu-toggle relative z-10 flex shrink-0 items-center justify-center"
        onClick={() => (menuExpanded ? closeMenu() : openMenu())}
      >
        <span className="sr-only">{menuExpanded ? "Đóng menu" : "Mở menu"}</span>
        <span
          className={cn(
            "absolute block h-px w-6 transition-all duration-300 motion-reduce:transition-none",
            iconTone,
            menuExpanded ? "translate-y-0 rotate-45" : "-translate-y-2",
          )}
        />
        <span
          className={cn(
            "absolute block h-px w-6 transition-all duration-300 motion-reduce:transition-none",
            iconTone,
            menuExpanded ? "opacity-0" : "opacity-100",
          )}
        />
        <span
          className={cn(
            "absolute block h-px w-6 transition-all duration-300 motion-reduce:transition-none",
            iconTone,
            menuExpanded ? "translate-y-0 -rotate-45" : "translate-y-2",
          )}
        />
      </button>

      {panelVisible && phase !== "closed" && (
        <div
          ref={panelRef}
          id={menuId}
          role="dialog"
          aria-modal="true"
          aria-label="Menu điều hướng"
          data-phase={phase}
          className="mobile-menu-panel"
          aria-hidden={phase === "closing"}
        >
          <div className="mobile-menu-panel-inner">
            <SiteNavLinks
              menuPhase={phase}
              onNavigate={closeMenu}
            />
          </div>
        </div>
      )}
    </div>
  );
}
