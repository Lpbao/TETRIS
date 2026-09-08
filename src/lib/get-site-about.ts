import { prisma } from "@/lib/prisma";
import { getSitePageFallback } from "@/lib/site-page-defaults";
import {
  aboutPageSchema,
  type AboutPageContent,
} from "@/lib/validations/site-page";

/**
 * Trang giới thiệu public: `SitePage` slug `about`.
 * Chưa có row / JSON lệch / DB lỗi → `siteAbout` để landing không trống.
 */
export async function getSiteAbout(): Promise<AboutPageContent> {
  try {
    const row = await prisma.sitePage.findUnique({
      where: { slug: "about" },
    });
    const parsed = aboutPageSchema.safeParse(row?.content);
    if (parsed.success) {
      return parsed.data;
    }
  } catch {
    // giữ copy hardcode khi không kết nối được DB
  }

  return getSitePageFallback("about");
}
