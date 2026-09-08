import { prisma } from "@/lib/prisma";
import { mapPostToSiteProject, postCoverSrc } from "@/lib/map-post-to-site-project";
import { pickBalancedLatest } from "@/lib/pick-balanced-latest";
import {
  getHomeProjects as getHardcodedHomeProjects,
  type SiteProject,
} from "@/lib/site-content";

export const HOME_PROJECTS_LIMIT = 8;

/**
 * Lưới dự án trang chủ: bài published, mới nhất trong từng category.
 * Ưu tiên 1: đủ `limit` bài. Ưu tiên 2: chia đều các category (round-robin).
 * DB lỗi / chưa có bài → hardcode `siteProjects`.
 */
export async function getHomeProjects(
  limit = HOME_PROJECTS_LIMIT,
): Promise<SiteProject[]> {
  try {
    const [categories, posts] = await Promise.all([
      prisma.category.findMany({
        orderBy: { sortOrder: "asc" },
        select: { id: true },
      }),
      prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        select: {
          slug: true,
          title: true,
          address: true,
          concept: true,
          description: true,
          coverImage: true,
          images: true,
          categoryId: true,
          category: { select: { slug: true, name: true } },
        },
      }),
    ]);

    const visible = posts.filter((post) => postCoverSrc(post));
    if (visible.length === 0) {
      return getHardcodedHomeProjects(limit);
    }

    const keyOrder = [
      ...categories.map((category) => category.id),
      "",
    ];
    const picked = pickBalancedLatest(
      visible,
      limit,
      (post) => post.categoryId ?? "",
      keyOrder,
    );
    return picked.map(mapPostToSiteProject);
  } catch {
    return getHardcodedHomeProjects(limit);
  }
}
