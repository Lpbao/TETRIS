import { prisma } from "@/lib/prisma";

export async function getMediaTitles(excludeId?: string) {
  const rows = await prisma.media.findMany({
    where: excludeId ? { id: { not: excludeId } } : undefined,
    select: { title: true },
  });
  return rows.map((row) => row.title);
}
