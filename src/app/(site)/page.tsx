import { HeroCarousel } from "@/components/site/hero-carousel";
import { HomeSectionPaging } from "@/components/site/home-section-paging";
import { ProjectGrid } from "@/components/site/project-grid";
import { getHomeProjects, siteHeroSlides } from "@/lib/site-content";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata({
  title: "Trang chủ",
  description:
    "TETRIS DESIGN — thiết kế kiến trúc, nội thất và thi công nhà hàng, showroom, khách sạn tại Việt Nam.",
  path: "/",
});

export default function HomePage() {
  const projects = getHomeProjects(8);

  return (
    <>
      <HeroCarousel slides={siteHeroSlides} />
      <ProjectGrid id="home-projects" projects={projects} variant="home" />
      <HomeSectionPaging sectionId="home-projects" />
    </>
  );
}
