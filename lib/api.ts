"use client";

/** Brauzer tomonidan API bilan ishlash uchun ingichka qatlam */

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: init?.body ? { "content-type": "application/json", ...init?.headers } : init?.headers,
  });

  if (!response.ok) throw await describe(response);
  return (await response.json()) as T;
}

/**
 * Xato matni: iloji bo'lsa serverникi, bo'lmasa hech bo'lmaganda
 * qayerga qarash kerakligi. Ilgari bu yerda `API 500:` chiqardi va
 * ortida bo'sh joy turardi — bunday xabar hech narsa aytmaydi.
 */
async function describe(response: Response): Promise<Error> {
  const body = await response.text().catch(() => "");

  try {
    const parsed = JSON.parse(body) as { error?: unknown };
    if (typeof parsed.error === "string" && parsed.error) return new Error(parsed.error);
  } catch {
    // JSON emas — quyida xom matn ishlatiladi
  }

  if (body.trim()) return new Error(body.slice(0, 300));

  return new Error(
    response.status >= 500
      ? "Server xatosi. Sabab terminalda, `npm run dev` ishlab turgan oynada yozilgan."
      : `So'rov bajarilmadi (${response.status}).`,
  );
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
}

export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "PUT", body: JSON.stringify(body) });
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}
