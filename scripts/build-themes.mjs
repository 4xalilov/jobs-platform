/**
 * themes.json → CSS o'zgaruvchilari.
 *
 * Ranglar bitta joyda turishi uchun: komponentlarda hech qanday hex yo'q,
 * bu skript esa ularni CSS ga aylantiradi. `predev` va `prebuild` da ishlaydi.
 *
 * Tokenlar guruhlangan (`surface.base` → `--surface-base`), chunki v5 da
 * ular 17 tadan 50 dan oshib ketdi va tekis ro'yxatda nima nimaga
 * tegishli ekani ko'rinmay qolgan edi.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const themes = JSON.parse(readFileSync(join(root, "styles/themes.json"), "utf8"));

/**
 * Ichma-ich obyektni CSS o'zgaruvchilariga yozadi:
 * { surface: { base: "#..." } } → `--surface-base: #...`
 */
function flatten(node, prefix = []) {
  const out = [];
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("_")) continue; // izohlar
    const path = [...prefix, key];
    if (value && typeof value === "object") out.push(...flatten(value, path));
    else out.push([path.join("-"), value]);
  }
  return out;
}

const declare = (pairs, indent = "  ") =>
  pairs.map(([name, value]) => `${indent}--${name}: ${value};`).join("\n");

/**
 * v4 dagi nomlar — hozircha yashaydi.
 *
 * 33 ta SCSS moduli `--color-*` ga tayanadi. Ularni B2 da yangi nomlarga
 * ko'chiramiz; shu paytgacha eski nomlar yangi qiymatlarga ishora qiladi.
 * Foydasi: butun ilova hoziroq AA ga mos ranglarni oladi, bitta komponent
 * ham tegilmagan holda.
 */
const LEGACY = {
  "color-primary": "brand-solid",
  "color-primary-shade": "brand-solid-pressed",
  "color-primary-soft": "brand-soft",
  "color-on-primary": "text-on-solid",
  "color-background": "surface-raised",
  "color-background-secondary": "surface-base",
  "color-background-pressed": "surface-pressed",
  "color-fill": "surface-sunken",
  "color-text": "text-primary",
  "color-text-secondary": "text-secondary",
  "color-text-tertiary": "text-tertiary",
  "color-borders": "border-default",
  "color-green": "success-text",
  "color-warning": "warning-text",
  "color-error": "error-text",
  "color-skeleton": "skeleton-base",
  "color-skeleton-shine": "skeleton-shine",
};

const legacy = Object.entries(LEGACY)
  .map(([old, next]) => `  --${old}: var(--${next});`)
  .join("\n");

/** Avatar ranglari + ularning 12% shaffof foni */
const peers = themes.peer
  .map((value, i) => `  --color-peer-${i}: ${value};\n  --color-peer-${i}-bg: ${value}1f;`)
  .join("\n");

const dark = flatten(themes.dark);
const light = flatten(themes.light);

const css = `/* Bu fayl generatsiya qilingan — tahrirlamang.
   Manba: styles/themes.json, skript: scripts/build-themes.mjs
   Tekshiruv: npm run lint:tokens (WCAG 2.2 AA) */

:root,
.theme-light {
${declare(light)}

${peers}
  color-scheme: light;
}

.theme-dark {
${declare(dark)}
  color-scheme: dark;
}

/* ——— v4 nomlari: B2 da olib tashlanadi ——— */
:root,
.theme-light,
.theme-dark {
${legacy}
}
`;

writeFileSync(join(root, "app/themes.generated.css"), css);
console.log(
  `themes.generated.css yozildi — ${light.length} token × 2 tema, ` +
    `${themes.peer.length} peer rangi, ${Object.keys(LEGACY).length} eski nom`,
);
