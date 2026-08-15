import "server-only";
import { Pool, type QueryResultRow } from "pg";

declare global {
  var __ishPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL berilmagan. `.env.local` faylida ulanish satrini ko'rsating — " +
        "namuna uchun .env.example ga qarang, bazani `docker compose up -d` bilan " +
        "ko'tarib, `npm run db:setup` ni ishga tushiring.",
    );
  }
  return new Pool({
    connectionString,
    ssl: sslFor(connectionString),
    // Serverless muhitda har bir instansiya o'z poolini ochadi — limit past
    // bo'lmasa baza ulanishlari tez tugaydi. Neon/Supabase da "pooled"
    // ulanish satrini ishlatish tavsiya etiladi.
    max: process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME ? 1 : 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

/**
 * Boshqaruvli bazalar (Neon, Supabase, Railway) SSL siz ulanishni rad etadi;
 * mahalliy Docker esa SSL ni bilmaydi. Qaror manzilga qarab qabul qilinadi.
 * Majburan boshqarish: DATABASE_SSL=on | off | no-verify
 */
function sslFor(connectionString: string): boolean | { rejectUnauthorized: false } {
  const forced = (process.env.DATABASE_SSL ?? "").toLowerCase();
  if (forced === "off") return false;
  if (forced === "on") return true;
  if (forced === "no-verify") return { rejectUnauthorized: false };

  let host: string;
  try {
    host = new URL(connectionString).hostname;
  } catch {
    return false;
  }

  const local = ["localhost", "127.0.0.1", "::1", "db", "postgres"].includes(host);
  return local ? false : true;
}

/** Dev rejimida hot-reload har safar yangi pool ochmasligi uchun global saqlanadi */
function pool(): Pool {
  if (!globalThis.__ishPool) globalThis.__ishPool = createPool();
  return globalThis.__ishPool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  params: readonly unknown[] = [],
): Promise<T[]> {
  const result = await pool().query<T>(text, params as unknown[]);
  return result.rows;
}

export async function queryOne<T extends QueryResultRow>(
  text: string,
  params: readonly unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** Bir nechta yozuvni bitta tranzaksiyada bajarish */
export async function transaction<T>(fn: (run: typeof query) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query("begin");
    const run = async <R extends QueryResultRow>(text: string, params: readonly unknown[] = []) => {
      const result = await client.query<R>(text, params as unknown[]);
      return result.rows;
    };
    const value = await fn(run as typeof query);
    await client.query("commit");
    return value;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
