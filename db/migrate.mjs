/**
 * Migratsiyalarni ketma-ket qo'llaydi va qo'llanganlarini `migrations`
 * jadvalida belgilab boradi — qayta ishga tushirish xavfsiz.
 *
 * Ishga tushirish:  npm run db:migrate
 */
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";
import { failWith } from "./explain-error.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, "migrations");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL berilmagan. .env.example ga qarang.");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString });
  await client.connect();

  try {
    await client.query(`
      create table if not exists migrations (
        nom text primary key,
        qollangan_sana timestamptz not null default now()
      )
    `);

    const applied = new Set(
      (await client.query("select nom from migrations")).rows.map((row) => row.nom),
    );

    const files = readdirSync(migrationsDir)
      .filter((name) => name.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`— ${file} (allaqachon qo'llangan)`);
        continue;
      }
      const sql = readFileSync(join(migrationsDir, file), "utf8");
      await client.query("begin");
      try {
        await client.query(sql);
        await client.query("insert into migrations (nom) values ($1)", [file]);
        await client.query("commit");
        console.log(`✓ ${file}`);
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => failWith(error, process.env.DATABASE_URL));
