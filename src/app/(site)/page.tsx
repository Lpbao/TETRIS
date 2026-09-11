import { HeroCarousel } from "@/components/site/hero-carousel";
import { HomeSectionPaging } from "@/components/site/home-section-paging";
import { ProjectShowcase } from "@/components/site/project-showcase";
import { SiteFooter } from "@/components/site/site-footer";
import { getHomeHeroSlides } from "@/lib/get-home-hero-slides";
import { getHomeProjects } from "@/lib/get-home-projects";
import { getSiteContact } from "@/lib/get-site-contact";
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
  const [slides, projects, contact] = await Promise.all([
    getHomeHeroSlides(),
    getHomeProjects(),
    getSiteContact(),
  ]);

  return (
    <>
      <HeroCarousel slides={slides} />
      <ProjectShowcase id="home-projects" projects={projects} layout="home" />
      <SiteFooter contact={contact} />
      <HomeSectionPaging sectionId="home-projects" />
    </>
  );
}
