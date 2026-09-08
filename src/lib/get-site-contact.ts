import { prisma } from "@/lib/prisma";
import {
  getSitePageFallback,
  normalizeContactPageContent,
} from "@/lib/site-page-defaults";
import type { ContactPageContent } from "@/lib/validations/site-page";

/**
 * Trang liên hệ public: `SitePage` slug `contact`.
 * Chưa có row / JSON lệch / DB lỗi → fallback từ `siteContact`.
 * Map iframe / pin link derive từ `address` đã ghép (Phase B).
 */
export async function getSiteContact(): Promise<ContactPageContent> {
  try {
    const row = await prisma.sitePage.findUnique({
      where: { slug: "contact" },
    });
    const normalized = normalizeContactPageContent(row?.content);
    if (normalized) {
      return normalized;
    }
  } catch {
    // giữ copy hardcode khi không kết nối được DB
  }

  return getSitePageFallback("contact");
}
