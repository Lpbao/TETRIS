import { AboutPageScroll } from "@/components/site/about-page-scroll";
import { getSiteAbout } from "@/lib/get-site-about";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata({
  title: "Giới thiệu",
  description:
    "Giới thiệu Tetris Design — công ty thiết kế và thi công nội thất thương mại tại Hà Nội, thành lập 2018.",
  path: "/about",
});

/** CMS đổi là thấy ngay — không cache trang giới thiệu. */
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const content = await getSiteAbout();
  return <AboutPageScroll content={content} />;
}
