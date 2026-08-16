/**
 * Bitta buyruq bilan ishga tushirish:  npm run setup
 *
 * Nega alohida skript kerak: oldin README da to'rt qadam bor edi va
 * ularning har birida to'xtash mumkin — `.env.local` ko'chirilmagan,
 * paketlar o'rnatilmagan, Docker ochilmagan, Postgres hali tayyor emas.
 * Xato esa Node ning stack trace i bo'lib chiqardi va nima qilish
 * kerakligi ko'rinmasdi. Bu yerda har qadam nomlanadi va yiqilsa
 * o'zbekcha, yechimi bilan tugaydi.
 *
 * Skript bir necha marta ishlatilishi mumkin: bori qayta yaratilmaydi.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { createConnection } from "node:net";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { sslFor } from "../db/ssl.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");

const dim = (s) => `[2m${s}[0m`;
const bold = (s) => `[1m${s}[0m`;
const green = (s) => `[32m${s}[0m`;
const red = (s) => `[31m${s}[0m`;

let step = 0;
const say = (text) => console.log(`\n${bold(`${++step}.`)} ${text}`);
const note = (text) => console.log(dim(`   ${text}`));

/** Xato — sababi va yechimi bilan. Stack trace foydasi yo'q. */
function stop(sabab, yechim) {
  console.error(`\n${red("✗")} ${sabab}\n`);
  for (const line of yechim) console.error(`  ${line}`);
  console.error("");
  process.exit(1);
}

const isWindows = process.platform === "win32";

function run(command, args) {
  return spawnSync(command, args, { cwd: root, stdio: "inherit" });
}

/*
 * `npm` Windows'da .cmd shim — Node 20.12 dan keyin uni shellsiz
 * chaqirib bo'lmaydi. Shell bilan chaqirganda esa argument massivi
 * DEP0190 ogohlantirishini keltirib chiqaradi, shuning uchun butun
 * buyruq bitta satr bo'lib beriladi. Bu yerda foydalanuvchi kiritgan
 * qiymat yo'q, satr kodda turibdi.
 */
function runNpm(commandLine) {
  return isWindows
    ? spawnSync(`npm ${commandLine}`, { cwd: root, stdio: "inherit", shell: true })
    : spawnSync("npm", commandLine.split(" "), { cwd: root, stdio: "inherit" });
}

/** Buyruq umuman o'rnatilganmi (daemon ishlayaptimi degani emas) */
function installed(command) {
  const probe = spawnSync(command, ["--version"], { stdio: "ignore" });
  return probe.status === 0;
}

// ——— 1. Node ———
say("Node tekshirilmoqda");
const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 20 || (major === 20 && minor < 9)) {
  stop(`Node ${process.versions.node} eskirgan — kamida 20.9 kerak.`, [
    "https://nodejs.org dan LTS versiyasini o'rnating,",
    "yoki nvm bo'lsa:  nvm install --lts",
  ]);
}
note(`Node ${process.versions.node}`);

// ——— 2. .env.local ———
say(".env.local tayyorlanmoqda");
if (existsSync(envPath)) {
  note("allaqachon bor — tegilmadi");
} else {
  const example = readFileSync(join(root, ".env.example"), "utf8");
  // Sessiya kalitini o'zimiz yaratamiz: bo'sh qolsa ilova ishga tushmaydi
  const secret = randomBytes(32).toString("base64");
  writeFileSync(envPath, example.replace(/^SESSION_SECRET=$/m, `SESSION_SECRET=${secret}`));
  note(".env.example dan yaratildi, SESSION_SECRET to'ldirildi");
}

// ——— 3. Paketlar ———
say("Paketlar tekshirilmoqda");
if (existsSync(join(root, "node_modules", "next"))) {
  note("o'rnatilgan");
} else {
  note("o'rnatilmoqda — bu bir necha daqiqa olishi mumkin");
  if (runNpm("install").status !== 0) {
    stop("npm install yiqildi.", [
      "Internet bormi? Keyin qaytadan:  npm run setup",
      "Kesh buzilgan bo'lsa:  rm -rf node_modules package-lock.json && npm install",
    ]);
  }
}

// ——— 4. Postgres ———
say("Baza tekshirilmoqda");
const { host, port, remote } = parseDatabaseUrl();

if (await reachable(host, port)) {
  // Kimdir Postgres ni o'zi o'rnatgan bo'lishi mumkin — Docker shart emas
  note(`${host}:${port} javob berdi`);
  await ensureDatabase();
} else if (remote) {
  stop(`Baza ${host}:${port} javob bermayapti.`, [
    ".env.local dagi DATABASE_URL to'g'rimi?",
    "Neon/Supabase da loyiha uyquga ketgan bo'lishi mumkin — panelda uyg'oting.",
  ]);
} else {
  // Docker umuman yo'qmi yoki bormi-yu ishga tushirilmaganmi — yechim boshqa
  if (!installed("docker")) {
    stop("Docker o'rnatilmagan.", [
      "Docker Desktop ni o'rnating:",
      "  https://www.docker.com/products/docker-desktop/",
      "",
      "Yoki Postgres ni o'zingiz o'rnatib, .env.local dagi",
      "DATABASE_URL ni o'shanga qarating.",
    ]);
  }

  note("ko'tarilmoqda (docker compose)");
  // --wait muhim: usiz konteyner yaratilishi bilanoq qaytadi, Postgres
  // esa yana bir necha sekund ishga tushadi va migratsiya ulanolmaydi.
  if (run("docker", ["compose", "up", "-d", "--wait"]).status !== 0) {
    stop("Docker Desktop ishga tushirilmagan.", [
      "Docker buyrug'i bor, lekin dasturning o'zi ochiq emas.",
      "",
      "  1. «Docker Desktop» ni oching (Пуск → Docker Desktop)",
      "  2. Pastdagi kit belgisi yashil bo'lguncha kuting",
      "  3. Shu buyruqni qaytadan bering:  npm run setup",
      "",
      `Agar boshqa xato chiqsa: ${port}-port band bo'lishi mumkin —`,
      "docker-compose.yml da boshqa port bering va .env.local ni moslang.",
      "Baza buzilgan bo'lsa:  docker compose down -v  keyin qaytadan.",
    ]);
  }
}

/*
 * Docker konteyneri bazani o'zi yaratadi (POSTGRES_DB), o'z qo'li bilan
 * Postgres o'rnatgan odamda esa u yo'q va migratsiya "bunday baza yo'q"
 * deb yiqilardi. Shu bir qadam Docker'ni ixtiyoriy qiladi.
 */
async function ensureDatabase() {
  const url = process.env.DATABASE_URL ?? readEnvFile("DATABASE_URL");
  if (!url) return;

  let name;
  let adminUrl;
  try {
    const parsed = new URL(url);
    name = decodeURIComponent(parsed.pathname.slice(1));
    if (!name) return;
    // Xizmat bazasi — u har doim bor
    parsed.pathname = "/postgres";
    adminUrl = parsed.toString();
  } catch {
    return;
  }

  const { default: pg } = await import("pg");
  const client = new pg.Client({ connectionString: adminUrl, ssl: sslFor(adminUrl) });

  try {
    await client.connect();
    const { rows } = await client.query("select 1 from pg_database where datname = $1", [name]);
    if (rows.length === 0) {
      // Nom faqat DATABASE_URL dan keladi; qo'shtirnoq ichida qalqonlanadi
      await client.query(`create database "${name.replaceAll('"', '""')}"`);
      note(`«${name}» bazasi yaratildi`);
    }
  } catch (error) {
    // Ulanolmasak jim ketamiz: sababini migratsiya o'zbekcha aytadi
    if (process.env.DEBUG) console.error(error);
  } finally {
    await client.end().catch(() => undefined);
  }
}

// ——— 5. Jadvallar va namunaviy ma'lumot ———
say("Jadvallar va namunaviy ma'lumot yozilmoqda");
for (const script of ["db/migrate.mjs", "db/seed.mjs"]) {
  if (run("node", ["--env-file-if-exists=.env.local", script]).status !== 0) {
    stop("Bazaga yozib bo'lmadi.", [
      "Yuqoridagi xabarda sabab yozilgan.",
      "Hammasini boshidan:  docker compose down -v && npm run setup",
    ]);
  }
}

console.log(`\n${green("✓")} Tayyor.\n`);
console.log(`  ${bold("npm run dev")}   →   ${bold("http://localhost:3000")}`);
console.log(dim("\n  Kirish ekranida «Namunaviy foydalanuvchi» tugmasini bosing —"));
console.log(dim("  u ham nomzod, ham ish beruvchi: bitta kirish bilan ikkala tomon.\n"));

/** DATABASE_URL dan host va port. Buzuq bo'lsa — Docker qiymatlari. */
function parseDatabaseUrl() {
  const fallback = { host: "127.0.0.1", port: 5432, remote: false };
  const url = process.env.DATABASE_URL ?? readEnvFile("DATABASE_URL");
  if (!url) return fallback;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    return {
      host,
      port: Number(parsed.port || 5432),
      remote: !["localhost", "127.0.0.1", "::1", "db", "postgres"].includes(host),
    };
  } catch {
    return fallback;
  }
}

/**
 * Port javob beryaptimi. To'liq SQL ulanish shart emas — bu yerda
 * savol faqat "Postgres ko'tarilganmi", parol to'g'rimi degani emas.
 * Uni migratsiya o'zi, o'zbekcha xato bilan aytadi.
 */
function reachable(host, port, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const socket = createConnection({ host, port });
    const done = (result) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });
}

function readEnvFile(key) {
  if (!existsSync(envPath)) return null;
  const line = readFileSync(envPath, "utf8")
    .split("\n")
    .find((l) => l.startsWith(`${key}=`));
  return line ? line.slice(key.length + 1).trim() : null;
}
