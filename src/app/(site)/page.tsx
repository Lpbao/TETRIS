import { HeroCarousel } from "@/components/site/hero-carousel";
import { HomeSectionPaging } from "@/components/site/home-section-paging";
import { ProjectShowcase } from "@/components/site/project-showcase";
import { getHomeHeroSlides } from "@/lib/get-home-hero-slides";
import { getHomeProjects } from "@/lib/get-home-projects";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata({
  title: "Trang chủ",
  description:
    "TETRIS DESIGN — thiết kế kiến trúc, nội thất và thi công nhà hàng, showroom, khách sạn tại Việt Nam.",
  path: "/",
});

/** CMS slider đổi là thấy ngay — không cache trang chủ. */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [slides, projects] = await Promise.all([
    getHomeHeroSlides(),
    getHomeProjects(),
  ]);

  return (
    <>
      <HeroCarousel slides={slides} />
      <ProjectShowcase id="home-projects" projects={projects} layout="home" />
      <HomeSectionPaging sectionId="home-projects" />
    </>
  );
}
