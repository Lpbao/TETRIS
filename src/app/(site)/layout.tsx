import { Suspense } from "react";
import { ChunkErrorRecovery } from "@/components/site/chunk-error-recovery";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteJsonLd } from "@/components/site/site-json-ld";
import { SiteLoadingIntro } from "@/components/site/site-loading-intro";
import { SiteLoadingProvider } from "@/components/site/site-loading-context";
import { SitePageReset } from "@/components/site/site-page-reset";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteLoadingProvider>
      <SiteJsonLd />
      <ChunkErrorRecovery />
      <SiteLoadingIntro />
      <Suspense fallback={null}>
        <SitePageReset />
      </Suspense>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      {/* File tĩnh, không qua bundle Next — About morph vẫn scale khi chunk lỗi */}
      <script src="/morph-pin.js?v=3" defer />
      <script src="/fps-pager.js?v=3" defer />
    </SiteLoadingProvider>
  );
}
