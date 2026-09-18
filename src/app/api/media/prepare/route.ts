import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getMediaTitles } from "@/lib/get-media-titles";
import { validateMediaMeta } from "@/lib/media";
import {
  MEDIA_TITLE_CONFLICT_ERROR,
  findDuplicateTitleConflicts,
} from "@/lib/media-upload-titles";
import {
  buildIncomingPath,
  createSignedMediaUpload,
} from "@/lib/media-storage";
import { mediaPrepareSchema } from "@/lib/validations/media";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = mediaPrepareSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { title, filename, mimeType, size } = parsed.data;
    const validation = validateMediaMeta(mimeType, size);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const existingTitles = await getMediaTitles();
    const conflicts = findDuplicateTitleConflicts([title], existingTitles);
    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: MEDIA_TITLE_CONFLICT_ERROR, conflicts },
        { status: 409 },
      );
    }

    const path = buildIncomingPath(filename);
    const signed = await createSignedMediaUpload(path);

    return NextResponse.json({
      path: signed.path,
      token: signed.token,
      signedUrl: signed.signedUrl,
      bucket: signed.bucket,
      type: validation.type,
    });
  } catch (err) {
    console.error("Prepare media upload error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to prepare media upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
