/**
 * Bazaga ulanishdagi xatolarni odam tushunadigan matnga aylantiradi.
 *
 * `pg` xom holda "ECONNREFUSED 127.0.0.1:5432" deb stack trace beradi —
 * bu xabar nima qilish kerakligini aytmaydi. Ko'p uchraydigan to'rt holat
 * uchun aniq sabab va yechim yoziladi.
 */

/** @param {unknown} error @param {string | undefined} connectionString */
export function explainError(error, connectionString) {
  const code = /** @type {{ code?: string }} */ (error)?.code;
  const where = target(connectionString);

  switch (code) {
    case "ECONNREFUSED":
      return [
        `Baza javob bermayapti (${where}).`,
        "",
        "Ehtimol Postgres hali ko'tarilmagan. Tekshiring:",
        "  docker compose up -d --wait     # healthcheck tugashini kutadi",
        "  docker compose ps               # holati 'healthy' bo'lishi kerak",
        "",
        "Docker ishlamayotgan bo'lsa — Docker Desktop ni oching.",
      ].join("\n");

    case "ENOTFOUND":
    case "EAI_AGAIN":
      return [
        `Manzil topilmadi (${where}).`,
        "",
        ".env.local dagi DATABASE_URL ni tekshiring. Mahalliy baza uchun:",
        "  DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/ishtop",
      ].join("\n");

    case "28P01":
      return [
        "Foydalanuvchi nomi yoki paroli to'g'ri kelmadi.",
        "",
        ".env.local dagi DATABASE_URL docker-compose.yml dagi qiymatlar bilan",
        "bir xil bo'lishi kerak (postgres / postgres).",
      ].join("\n");

    case "3D000":
      return [
        "Bunday baza yo'q.",
        "",
        "Konteyner eski nom bilan yaratilgan bo'lishi mumkin. Tozalab qayta ko'taring:",
        "  docker compose down -v && docker compose up -d --wait",
      ].join("\n");

    default:
      return null;
  }
}

/** Parolni ko'rsatmasdan qayerga ulanmoqchi bo'lganini yozadi */
function target(connectionString) {
  if (!connectionString) return "DATABASE_URL berilmagan";
  try {
    const url = new URL(connectionString);
    return `${url.hostname}:${url.port || 5432}${url.pathname}`;
  } catch {
    return "DATABASE_URL noto'g'ri yozilgan";
  }
}

/** Xatoni chiqarib, jarayonni to'xtatadi */
export function failWith(error, connectionString) {
  const explained = explainError(error, connectionString);
  if (explained) {
    console.error(`\n${explained}\n`);
  } else {
    console.error(error);
  }
  process.exit(1);
}
