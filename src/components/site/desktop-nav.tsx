import { SiteNavLinks } from "@/components/site/site-nav-links";

interface DesktopNavProps {
  inverted?: boolean;
}

export function DesktopNav({ inverted }: DesktopNavProps) {
  return (
    <SiteNavLinks
      className="hidden lg:block"
      linkClassName="text-xs lg:text-sm"
      inverted={inverted}
    />
  );
}
