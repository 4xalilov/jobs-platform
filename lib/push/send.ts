import "server-only";
import webpush from "web-push";
import { removePushDevice, type PushDevice } from "@/lib/db/push";

/**
 * Web Push yuborish.
 *
 * Shifrlash o'zimiz yozilmadi (RFC 8291 aes128gcm + RFC 8292 VAPID JWT):
 * algoritm murakkab, xatosi esa jim qoladi — xabar shunchaki yetib
 * bormaydi va sababi ko'rinmaydi. Bu yagona joy bunga arziydi.
 */

export type PushPayload = {
  title: string;
  body: string;
  /** Bosilganda ochiladigan manzil */
  url: string;
  /**
   * Bir xil tag'li eski xabar yangisi bilan almashadi — bildirishnoma
   * pardasida ikkita yig'ma xabar yonma-yon turmaydi.
   */
  tag: string;
};

let configured: boolean | null = null;

/** VAPID kalitlari berilganmi. Berilmasa push jim o'chiq turadi. */
export function pushConfigured(): boolean {
  if (configured !== null) return configured;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    configured = false;
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export type SendResult = { sent: number; removed: number };

/**
 * Bitta odamning barcha qurilmalariga yuboradi.
 *
 * Qurilma javob bermasa (404/410 — brauzer o'chirilgan yoki obuna
 * bekor qilingan) yozuv o'chiriladi: aks holda bazada o'lik obunalar
 * yig'ilib qoladi va har kuni behuda so'rov ketadi.
 */
export async function sendToDevices(
  devices: PushDevice[],
  payload: PushPayload,
): Promise<SendResult> {
  if (!pushConfigured()) return { sent: 0, removed: 0 };

  const body = JSON.stringify(payload);
  let sent = 0;
  let removed = 0;

  await Promise.all(
    devices.map(async (device) => {
      try {
        await webpush.sendNotification(
          { endpoint: device.endpoint, keys: { p256dh: device.p256dh, auth: device.auth } },
          body,
          // Qurilma oflayn bo'lsa xabar 24 soat kutadi, keyin tushadi
          { TTL: 86_400 },
        );
        sent++;
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await removePushDevice(device.endpoint);
          removed++;
        }
        // Boshqa xatolar (429, 500) — qurilma tirik, keyingi safar urinamiz
      }
    }),
  );

  return { sent, removed };
}
