import { NextResponse } from "next/server";
import { saveAudio } from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** 30 sekundlik opus ≈ 60 KB; keng chegara qo'yamiz, lekin cheksiz emas */
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_MS = 5 * 60 * 1000;
const ALLOWED = ["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav"];

/** Ovozli xabar tanasi xom holda yuboriladi, uzunligi ?ms= da */
export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 401 });

  const mimeType = (request.headers.get("content-type") ?? "").split(";")[0].trim();
  if (!ALLOWED.includes(mimeType)) {
    return NextResponse.json({ error: "Bu format qo'llab-quvvatlanmaydi" }, { status: 415 });
  }

  const durationMs = Number(new URL(request.url).searchParams.get("ms"));
  if (!Number.isFinite(durationMs) || durationMs <= 0 || durationMs > MAX_MS) {
    return NextResponse.json({ error: "Uzunlik noto'g'ri" }, { status: 400 });
  }

  const bytes = Buffer.from(await request.arrayBuffer());
  if (bytes.length === 0) return NextResponse.json({ error: "Bo'sh fayl" }, { status: 400 });
  if (bytes.length > MAX_BYTES) {
    return NextResponse.json({ error: "Fayl juda katta" }, { status: 413 });
  }

  return NextResponse.json({ id: await saveAudio(bytes, mimeType, Math.round(durationMs)) });
}
