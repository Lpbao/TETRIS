import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getMediaTitles } from "@/lib/get-media-titles";
import {
  MEDIA_TITLE_CONFLICT_ERROR,
  findDuplicateTitleConflicts,
} from "@/lib/media-upload-titles";
import { mediaTitlesCheckSchema } from "@/lib/validations/media";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = mediaTitlesCheckSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const existing = await getMediaTitles();
    const conflicts = findDuplicateTitleConflicts(
      parsed.data.titles,
      existing,
    );

    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: MEDIA_TITLE_CONFLICT_ERROR, conflicts },
        { status: 409 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Check media titles error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to check media titles";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
