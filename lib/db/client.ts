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
    max: 10,
    idleTimeoutMillis: 30_000,
  });
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
