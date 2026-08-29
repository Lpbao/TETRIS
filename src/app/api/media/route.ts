import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { mediaQuerySchema, mediaUploadSchema } from "@/lib/validations/media";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsed = mediaQuerySchema.safeParse({
      q: searchParams.get("q") ?? undefined,
    });
    const q = parsed.success ? parsed.data.q : undefined;

    const media = await prisma.media.findMany({
      where: q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { filename: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(media);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch media" },
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
    const formData = await request.formData();
    const file = formData.get("file");
    const titleValue = formData.get("title");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const parsedTitle = mediaUploadSchema.safeParse({
      title: typeof titleValue === "string" ? titleValue : "",
    });
    if (!parsedTitle.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsedTitle.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { validateMediaFile, sanitizeFilename } = await import("@/lib/media");
    const validation = validateMediaFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { createSupabaseAdmin, getPublicUrl, getStorageBucket } =
      await import("@/lib/supabase");

    const supabase = createSupabaseAdmin();
    const bucket = getStorageBucket();
    const safeName = sanitizeFilename(file.name);
    const path = `${Date.now()}-${safeName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message || "Upload failed" },
        { status: 500 },
      );
    }

    const url = getPublicUrl(path);
    const media = await prisma.media.create({
      data: {
        filename: file.name,
        title: parsedTitle.data.title,
        path,
        url,
        mimeType: file.type,
        size: file.size,
        type: validation.type,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to upload media";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
