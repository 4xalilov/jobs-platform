import { NextResponse } from "next/server";
import { digestHourOf, hasPushDevice, setDigestHour } from "@/lib/db/push";
import { currentUserId } from "@/lib/db/session";
import { pushConfigured } from "@/lib/push/send";

export const dynamic = "force-dynamic";

/** Bildirishnoma sozlamalari — yoqilganmi va qaysi soatda */
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  return NextResponse.json({
    available: pushConfigured(),
    enabled: await hasPushDevice(userId),
    hour: await digestHourOf(userId),
  });
}

export async function PUT(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  const { hour } = (await request.json()) as { hour?: number };
  if (typeof hour !== "number" || !Number.isInteger(hour) || hour < 0 || hour > 23) {
    return NextResponse.json({ ok: false, error: "soat_notogri" }, { status: 400 });
  }

  await setDigestHour(userId, hour);
  return NextResponse.json({ ok: true });
}
