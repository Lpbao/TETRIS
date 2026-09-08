import { appendFile } from "fs/promises";
import { NextResponse } from "next/server";

/** Chỉ dùng khi debug thiết bị thật qua LAN (dev). Xoá khi xong. */
const LOG_PATH = "/tmp/cms-mobile-debug.log";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  const body = await request.text();
  await appendFile(LOG_PATH, `${new Date().toISOString()} ${body}\n`, "utf8");
  return NextResponse.json({ ok: true });
}
