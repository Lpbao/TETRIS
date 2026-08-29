import { AboutPageScroll } from "@/components/site/about-page-scroll";
import { siteAbout } from "@/lib/site-content";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata({
  title: "Giới thiệu",
  description:
    "Giới thiệu Tetris Design — công ty thiết kế và thi công nội thất thương mại tại Hà Nội, thành lập 2018.",
  path: "/about",
});

export default function AboutPage() {
  return <AboutPageScroll content={siteAbout} />;
}
