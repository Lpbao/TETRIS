import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validations/post";
import { slugSchema } from "@/lib/validations/shared";
import { slugify } from "@/lib/utils";

async function resolvePostSlug(title: string, slug: string) {
  const finalSlug = slug || slugify(title);
  const parsed = slugSchema.safeParse(finalSlug);
  if (!parsed.success) {
    return {
      error: NextResponse.json(
        {
          error: "Validation failed",
          details: {
            fieldErrors: {
              slug: ["Slug không hợp lệ — nhập slug hoặc dùng tiêu đề không dấu"],
            },
          },
        },
        { status: 400 },
      ),
    };
  }
  return { slug: parsed.data };
}

async function assertCategory(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    return NextResponse.json(
      { error: "Category không tồn tại" },
      { status: 400 },
    );
  }
  return null;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const posts = await prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      include: { category: { select: { id: true, name: true } } },
    });
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = postSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const {
      title,
      slug,
      coverImage,
      images,
      published,
      address,
      concept,
      description,
      categoryId,
    } = parsed.data;

    const resolved = await resolvePostSlug(title, slug);
    if ("error" in resolved) return resolved.error;

    const categoryError = await assertCategory(categoryId);
    if (categoryError) return categoryError;

    const existing = await prisma.post.findUnique({
      where: { slug: resolved.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 },
      );
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug: resolved.slug,
        address,
        concept,
        description,
        categoryId,
        coverImage: coverImage || null,
        images,
        published,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error("Create post error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
