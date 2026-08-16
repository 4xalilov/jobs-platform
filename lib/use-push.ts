"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost, apiPut } from "@/lib/api";

export type PushState = {
  /** Brauzer push'ni bilarmi va serverda VAPID kalitlari bormi */
  available: boolean;
  enabled: boolean;
  /** Foydalanuvchi ruxsatni "bloklangan" ga qo'ygan — sozlamalardan ochish kerak */
  blocked: boolean;
  hour: number;
  busy: boolean;
};

type Settings = { available: boolean; enabled: boolean; hour: number };

/**
 * Push bildirishnomalar (v4, §1.5).
 *
 * Ruxsat faqat foydalanuvchi tugmani bosganda so'raladi. Sahifa
 * ochilishi bilan so'ralsa brauzer "bloklangan" ga o'tkazib yuboradi
 * va keyin uni faqat brauzer sozlamalaridan qaytarish mumkin.
 */
export function usePush(publicKey: string | null) {
  const [state, setState] = useState<PushState>({
    available: false,
    enabled: false,
    blocked: false,
    hour: 9,
    busy: true,
  });

  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  // Serverdagi holat — effektda o'qiladi, chunki u so'rovga bog'liq
  useEffect(() => {
    let alive = true;

    apiGet<Settings>("/push/settings")
      .then((settings) => {
        if (!alive) return;
        setState({
          available: supported && settings.available && Boolean(publicKey),
          enabled: settings.enabled,
          blocked: supported && Notification.permission === "denied",
          hour: settings.hour,
          busy: false,
        });
      })
      .catch(() => {
        if (alive) setState((prev) => ({ ...prev, busy: false }));
      });

    return () => {
      alive = false;
    };
  }, [supported, publicKey]);

  const enable = useCallback(async () => {
    if (!publicKey) return;
    setState((prev) => ({ ...prev, busy: true }));

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setState((prev) => ({ ...prev, busy: false, blocked: permission === "denied" }));
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      // Boshqa saytlar bizning obunamizni o'qiy olmasin
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    await apiPost("/push/subscribe", subscription.toJSON());
    setState((prev) => ({ ...prev, enabled: true, busy: false }));
  }, [publicKey]);

  const disable = useCallback(async () => {
    setState((prev) => ({ ...prev, busy: true }));

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await apiPost("/push/unsubscribe", { endpoint: subscription.endpoint });
      await subscription.unsubscribe();
    }

    setState((prev) => ({ ...prev, enabled: false, busy: false }));
  }, []);

  const setHour = useCallback(async (hour: number) => {
    setState((prev) => ({ ...prev, hour }));
    await apiPut("/push/settings", { hour }).catch(() => undefined);
  }, []);

  return { ...state, enable, disable, setHour };
}

/**
 * VAPID kalit base64url da keladi, `subscribe` esa bayt massivini
 * kutadi — brauzer o'zi o'girmaydi.
 */
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const raw = atob(padded);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}
