import { NextResponse } from "next/server";
import { dueDigests, markDigestSent, type Digest } from "@/lib/db/push";
import { dictionaries } from "@/lib/i18n";
import { pushConfigured, sendToDevices } from "@/lib/push/send";

export const dynamic = "force-dynamic";

/**
 * Kunlik yig'ma xabar.
 *
 * Tashqi rejalashtiruvchi (cron) shu yo'lni har soat chaqiradi —
 * ichkarida kimning soati kelganini o'zi hisoblaydi. Nega ilova
 * ichida taymer emas: serverless muhitda jarayon so'rovlar orasida
 * yashamaydi, ya'ni setInterval hech qachon ishlamaydi.
 *
 * Himoya — CRON_SECRET. Yo'q bo'lsa yo'l umuman yopiq: ochiq
 * qoldirilsa istalgan odam hammaga xabar yuborishi mumkin edi.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "cron_secret_yoq" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!pushConfigured()) {
    return NextResponse.json({ ok: false, error: "vapid_yoq" }, { status: 503 });
  }

  const now = new Date();
  const digests = await dueDigests(now);

  let users = 0;
  let sent = 0;
  let failed = 0;

  for (const digest of digests) {
    const result = await sendToDevices(digest.devices, {
      title: title(digest),
      body: body(digest),
      url: "/jobs",
      // Bitta tag — yangi yig'ma xabar eskisining o'rniga tushadi
      tag: "ish-digest",
    });
    // Qurilmalarning bittasi ham qabul qilmagan bo'lsa qayta urinamiz
    if (result.sent > 0) {
      await markDigestSent(digest.userId, now);
      users++;
      sent += result.sent;
    } else {
      failed++;
    }
  }

  /*
   * `failed` javobda ataylab: yuborish uzilib qolsa natija "0 ta odam"
   * bo'lardi va bu "yuboradigan odam yo'q" dan farq qilmasdi. Cron
   * jurnalida ikkalasi bir xil ko'rinsa nosozlik haftalab sezilmaydi.
   */
  return NextResponse.json({ ok: true, users, sent, failed });
}

function title(digest: Digest): string {
  const t = dictionaries[digest.locale].push;
  const total = digest.channels.reduce((sum, channel) => sum + channel.yangi, 0);
  return t.digestTitle.replace("{count}", String(total));
}

/*
 * Bitta kanal bo'lsa nomi bilan, ko'p bo'lsa ikkitasi va "yana N".
 * To'liq ro'yxat berilsa xabar telefon pardasida kesilib qolardi.
 */
function body(digest: Digest): string {
  const t = dictionaries[digest.locale].push;
  const parts = digest.channels.map((channel) => `${channel.nom} — ${channel.yangi}`);

  if (parts.length <= 2) return parts.join(", ");
  return `${parts.slice(0, 2).join(", ")}, ${t.digestMore.replace("{count}", String(parts.length - 2))}`;
}
