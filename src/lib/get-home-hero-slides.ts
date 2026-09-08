import { prisma } from "@/lib/prisma";
import { siteHeroSlides, type HeroSlide } from "@/lib/site-content";
import { homePageSchema } from "@/lib/validations/site-page";

/**
 * Slider trang chủ public: `SitePage` slug `home`.
 * Chưa có row / JSON lệch / DB lỗi → `siteHeroSlides` để landing không trống.
 */
export async function getHomeHeroSlides(): Promise<HeroSlide[]> {
  try {
    const row = await prisma.sitePage.findUnique({ where: { slug: "home" } });
    const parsed = homePageSchema.safeParse(row?.content);
    if (parsed.success && parsed.data.slides.length > 0) {
      return parsed.data.slides;
    }
  } catch {
    // giữ hero hardcode khi không kết nối được DB
  }

  return siteHeroSlides;
}
