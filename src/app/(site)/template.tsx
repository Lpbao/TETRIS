import type { ReactNode } from "react";

/** Remount page khi đổi route — mọi client state của trang reset. */
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return children;
}
