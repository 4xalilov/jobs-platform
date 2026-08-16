"use client";

/**
 * IndexedDB — ikkinchi kesh qatlami (v3, oflayn bo'limi).
 *
 * Uch qatlam bor va har birining o'z vazifasi:
 *
 *   1. localStorage    — kichik va sinxron: sessiya, til, ko'rinish, filtr
 *   2. IndexedDB       — bu yer: ro'yxatlar va yozishuvlar (bir necha MB)
 *   3. Cache Storage   — service worker: HTML, JS, CSS
 *
 * Kutubxona olinmadi: kerak bo'lgani "kalit bo'yicha yoz va o'qi",
 * bu esa 60 qatorda sig'adi va paketga hech narsa qo'shmaydi.
 */

const DB_NAME = "ish-top";
const DB_VERSION = 1;
const STORE = "cache";

/** Kesh yozuvi shu muddatdan eski bo'lsa ishlatilmaydi (24 soat) */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

type Entry<T> = { key: string; value: T; savedAt: number };

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    // Xususiy rejimda yoki joy tugaganda IndexedDB ochilmaydi — ilova
    // baribir ishlashi kerak, shuning uchun jim null qaytaramiz
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
  return dbPromise;
}

function run<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest,
): Promise<T | null> {
  return openDb().then(
    (db) =>
      new Promise<T | null>((resolve) => {
        if (!db) return resolve(null);
        try {
          const tx = db.transaction(STORE, mode);
          const request = fn(tx.objectStore(STORE));
          request.onsuccess = () => resolve(request.result as T);
          request.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      }),
  );
}

/** Keshdan o'qish. Yozuv eski bo'lsa null qaytadi. */
export async function idbGet<T>(key: string): Promise<T | null> {
  const entry = await run<Entry<T>>("readonly", (store) => store.get(key));
  if (!entry) return null;
  if (Date.now() - entry.savedAt > MAX_AGE_MS) return null;
  return entry.value;
}

/**
 * Keshdan o'qish, muddatiga qaramay.
 * Oflaynda eski ma'lumot hech narsadan yaxshiroq.
 */
export async function idbGetStale<T>(key: string): Promise<T | null> {
  const entry = await run<Entry<T>>("readonly", (store) => store.get(key));
  return entry ? entry.value : null;
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
  await run("readwrite", (store) =>
    store.put({ key, value, savedAt: Date.now() } satisfies Entry<T>),
  );
}

export async function idbDelete(key: string): Promise<void> {
  await run("readwrite", (store) => store.delete(key));
}

/** Chiqishda hammasi tozalanadi — keyingi foydalanuvchi ko'rmasin */
export async function idbClear(): Promise<void> {
  await run("readwrite", (store) => store.clear());
}

/* ——— Kalitlar bir joyda: nom xatosi jim ketmasin ——— */
export const cacheKey = {
  channels: () => "channels",
  catalog: () => "channels:catalog",
  channel: (id: string) => `channel:${id}`,
  channelVacancies: (id: string, filter: string) => `channel:${id}:vacancies:${filter}`,
  applications: () => "applications",
  chats: () => "chats",
  chat: (id: string) => `chat:${id}`,
  saved: () => "saved",
};
