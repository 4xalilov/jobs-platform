/**
 * Boshqaruvli bazalar (Neon, Supabase, Railway, Vercel Postgres) SSL siz
 * ulanishni rad etadi; mahalliy Docker esa SSL ni umuman bilmaydi.
 * Shuning uchun qaror manzilga qarab avtomatik qabul qilinadi.
 *
 * Majburan boshqarish: DATABASE_SSL=on | off | no-verify
 */
export function sslFor(connectionString) {
  var forced = (process.env.DATABASE_SSL || "").toLowerCase();
  if (forced === "off") return false;
  if (forced === "on") return true;
  // Sertifikati o'z-o'zidan imzolangan baza uchun (masalan ichki server)
  if (forced === "no-verify") return { rejectUnauthorized: false };

  var host;
  try {
    host = new URL(connectionString).hostname;
  } catch {
    return false;
  }

  var local =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "db" || // docker compose xizmat nomi
    host === "postgres";

  // Uzoqdagi baza — SSL yoqiladi va sertifikat tekshiriladi.
  // Neon, Supabase va Railway ommaviy sertifikat ishlatadi, ya'ni o'tadi.
  return local ? false : true;
}
