import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* SCSS modullari o'zgaruvchilarni nisbiy yo'l bilan chaqiradi
     (@use "../../styles/variables") — Turbopack loadPaths ni qo'llamaydi. */

  experimental: {
    /*
     * Orqaga qaytganda ro'yxat qayta yuklanmasin, keshdan chizilsin
     * (v4, §5.3). Standart qiymat 0 — ya'ni har qaytishda sahifa
     * qaytadan so'raladi va skeleton chaqnaydi. Sahifalar
     * force-dynamic bo'lgani uchun "dynamic" qiymati muhim.
     */
    staleTimes: { dynamic: 60, static: 180 },
  },
};

export default nextConfig;
