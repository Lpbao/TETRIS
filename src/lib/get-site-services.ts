import { prisma } from "@/lib/prisma";
import { siteServices, type SiteService } from "@/lib/site-content";
import { servicesPageSchema } from "@/lib/validations/site-page";

/**
 * Trang dịch vụ public: `SitePage` slug `services`.
 * Chưa có row / JSON lệch / DB lỗi → `siteServices` để landing không trống.
 */
export async function getSiteServices(): Promise<SiteService[]> {
  try {
    const row = await prisma.sitePage.findUnique({
      where: { slug: "services" },
    });
    const parsed = servicesPageSchema.safeParse(row?.content);
    if (parsed.success && parsed.data.items.length > 0) {
      return parsed.data.items;
    }
  } catch {
    // giữ copy hardcode khi không kết nối được DB
  }

  return [...siteServices];
}
