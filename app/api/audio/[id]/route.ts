import { NextResponse } from "next/server";
import { getAudioForUser } from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 401 });

  const { id } = await params;
  const audio = await getAudioForUser(id, userId);
  if (!audio) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  return new NextResponse(new Uint8Array(audio.bytes), {
    headers: {
      "content-type": audio.mimeType,
      "content-length": String(audio.bytes.length),
      // Shaxsiy yozishuv — faqat brauzerning o'zida saqlansin
      "cache-control": "private, max-age=31536000, immutable",
    },
  });
}
