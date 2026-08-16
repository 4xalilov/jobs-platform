/*
 * Service worker — uchinchi kesh qatlami (Cache Storage).
 *
 * Uch xil resurs, uch xil strategiya:
 *
 *   /_next/static/*   cache-first  — fayl nomida hash bor, o'zgarmaydi
 *   navigatsiya       network-first — yangi ma'lumot muhim, lekin
 *                     tarmoq yo'q bo'lsa keshdan chiziladi
 *   /api/* (GET)      network-first — xuddi shunday
 *
 * POST va boshqa yozuvchi so'rovlar umuman keshlanmaydi.
 */

const VERSION = "v1";
const STATIC_CACHE = `ish-static-${VERSION}`;
const PAGES_CACHE = `ish-pages-${VERSION}`;
const API_CACHE = `ish-api-${VERSION}`;

/*
 * Zaxira sahifa — oddiy HTML fayl, Next sahifasi emas.
 * Next sahifasi boshqa manzil o'rniga qaytarilganda o'z RSC
 * ma'lumotini topolmay gidratsiyada yiqilardi.
 */
const OFFLINE_URL = "/oflayn.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.endsWith(VERSION)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

/** Keshni cheksiz o'stirmaslik uchun — eng eski yozuvlar o'chadi */
async function trim(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)));
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName, maxEntries) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
      void trim(cacheName, maxEntries);
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Statik fayllar — nomida hash bor, hech qachon eskirmaydi
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Sahifalar
  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(request, PAGES_CACHE, 30).catch(async () => {
        const cached = await caches.match(request);
        return cached ?? (await caches.match(OFFLINE_URL)) ?? Response.error();
      }),
    );
    return;
  }

  // API — faqat o'qish so'rovlari
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, API_CACHE, 60));
  }
});

/* Chiqishda kesh tozalanadi — keyingi foydalanuvchi ko'rmasin */
self.addEventListener("message", (event) => {
  if (event.data === "clear-cache") {
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))));
  }
});

/* ==========================================================================
   PUSH BILDIRISHNOMALAR (v4, §1.5)

   Kuniga bitta yig'ma xabar keladi — har vakansiyaga alohida emas.
   Server payload ni tayyor holda yuboradi, bu yerda faqat ko'rsatiladi.
   ========================================================================== */

self.addEventListener("push", (event) => {
  let data;
  try {
    data = event.data ? event.data.json() : null;
  } catch {
    data = null;
  }
  if (!data || !data.title) return;

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body ?? "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      // Bir xil tag'li eski xabar yangisi bilan almashadi
      tag: data.tag ?? "ish",
      data: { url: data.url ?? "/jobs" },
    }),
  );
});

/*
 * Bosilganda: ilova ochiq bo'lsa o'sha oynaga o'tamiz, yopiq bo'lsa
 * yangisini ochamiz. Ikkinchi nusxa ochilsa odam ikkita bir xil
 * ilovada qolib ketardi.
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url ?? "/jobs", self.location.origin);

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if (new URL(client.url).origin === target.origin && "focus" in client) {
          client.navigate(target.href);
          return client.focus();
        }
      }
      return self.clients.openWindow(target.href);
    }),
  );
});
