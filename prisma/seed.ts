import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";
import {
  projectCategories,
  siteAbout,
  siteContact,
  siteProjects,
} from "../src/lib/site-content";
import { categorySchema } from "../src/lib/validations/category";
import { postSchema } from "../src/lib/validations/post";
import {
  parseSitePageContent,
  type SitePageSlug,
} from "../src/lib/validations/site-page";

const prisma = new PrismaClient();

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function asJson(value: unknown): Prisma.InputJsonValue {
  return cloneJson(value) as Prisma.InputJsonValue;
}

const sitePageSeeds: { slug: SitePageSlug; content: unknown }[] = [
  { slug: "about", content: cloneJson(siteAbout) },
  {
    slug: "projects",
    content: { note: "Danh sách dự án quản lý ở Bài đăng" },
  },
  {
    slug: "contact",
    content: {
      email: siteContact.email,
      phone: siteContact.phone,
      addressLine: "Số 31 Ngõ 135 Đội Cấn, Ba Đình",
      province: "Hà Nội",
      address: "Số 31 Ngõ 135 Đội Cấn, Ba Đình, Hà Nội, Việt Nam",
    },
  },
];

async function seedSitePages() {
  for (const page of sitePageSeeds) {
    const parsed = parseSitePageContent(page.slug, page.content);
    if (!parsed.success) {
      throw new Error(
        `Seed SitePage "${page.slug}" không khớp schema: ${parsed.error.message}`,
      );
    }

    const existing = await prisma.sitePage.findUnique({
      where: { slug: page.slug },
    });

    if (existing) {
      console.log(`SitePage "${page.slug}" đã có — bỏ qua`);
      continue;
    }

    await prisma.sitePage.create({
      data: {
        slug: page.slug,
        content: asJson(parsed.data),
      },
    });
    console.log(`SitePage "${page.slug}" đã tạo`);
  }
}

async function seedCategories() {
  const ids = new Map<string, string>();

  for (const [index, category] of projectCategories.entries()) {
    const parsed = categorySchema.parse({
      name: category.label,
      slug: category.id,
      sortOrder: index,
    });

    const row = await prisma.category.upsert({
      where: { slug: parsed.slug },
      create: parsed,
      update: { name: parsed.name, sortOrder: parsed.sortOrder },
    });
    ids.set(row.slug, row.id);
    console.log(`Category "${row.slug}" — ${row.id}`);
  }

  return ids;
}

async function seedPosts(categoryIds: Map<string, string>) {
  for (const project of siteProjects) {
    const categoryId = categoryIds.get(project.category);
    if (!categoryId) {
      throw new Error(`Không có category "${project.category}"`);
    }

    const existing = await prisma.post.findUnique({
      where: { slug: project.slug },
    });
    if (existing) {
      console.log(`Post "${project.slug}" đã có — bỏ qua`);
      continue;
    }

    const description = project.description ?? "";
    const parsed = postSchema.parse({
      title: project.title,
      slug: project.slug,
      address: project.location,
      concept: project.categoryLabel,
      categoryId,
      description,
      coverImage: project.heroImage ?? project.illustration,
      images: project.images ?? project.gallery ?? [],
      published: true,
    });

    await prisma.post.create({
      data: {
        title: parsed.title,
        slug: parsed.slug,
        address: parsed.address,
        concept: parsed.concept,
        categoryId: parsed.categoryId,
        description: parsed.description,
        coverImage: parsed.coverImage || null,
        images: parsed.images,
        published: parsed.published,
        content: description || null,
        excerpt: description.slice(0, 500) || null,
      },
    });
    console.log(`Post "${parsed.slug}" đã tạo`);
  }
}

async function main() {
  await seedSitePages();
  const categoryIds = await seedCategories();
  await seedPosts(categoryIds);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
