import { NextResponse } from "next/server";
import { savePushDevice } from "@/lib/db/push";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

type Body = {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
};

/** Brauzer bergan obunani saqlaymiz */
export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  const body = (await request.json()) as Body;
  const endpoint = body.endpoint;
  const p256dh = body.keys?.p256dh;
  const auth = body.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ ok: false, error: "toliq_emas" }, { status: 400 });
  }

  await savePushDevice(userId, { endpoint, p256dh, auth });
  return NextResponse.json({ ok: true });
}
