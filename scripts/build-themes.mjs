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
`;

writeFileSync(join(root, "app/themes.generated.css"), css);

/*
 * Oflayn sahifasi — oddiy HTML, CSS modullarini import qilolmaydi va
 * tarmoq yo'q bo'lganda ochiladi, ya'ni tashqi fayl ham kutib
 * bo'lmaydi. Shuning uchun kerakli beshta token unga to'g'ridan-to'g'ri
 * yoziladi. Qo'lda yozilganda palitra o'zgargach eskirib qolgan edi.
 */
const OFFLINE_TOKENS = {
  bg: "surface.base",
  text: "text.primary",
  muted: "text.secondary",
  tertiary: "text.tertiary",
  primary: "brand.text",
};

const pick = (theme, path) => path.split(".").reduce((n, k) => n[k], themes[theme]);
const offlineBlock = (theme, indent) =>
  Object.entries(OFFLINE_TOKENS)
    .map(([name, path]) => `${indent}--${name}: ${pick(theme, path)};`)
    .join("\n");

const offlineCss = `      /* THEME:BOSHLANDI — generatsiya qilinadi, tahrirlamang */
      :root {
${offlineBlock("light", "        ")}
      }

      html.theme-dark {
${offlineBlock("dark", "        ")}
      }

      @media (prefers-color-scheme: dark) {
        html:not(.theme-light) {
${offlineBlock("dark", "          ")}
        }
      }
      /* THEME:TUGADI */`;

const offlinePath = join(root, "public/oflayn.html");
const offline = readFileSync(offlinePath, "utf8");
const MARKERS = /[ ]*\/\* THEME:BOSHLANDI[\s\S]*?THEME:TUGADI \*\//;

// Belgilarning borligini tekshiramiz, tarkib o'zgarganini emas: skript
// ikkinchi marta ishlaganda natija bir xil bo'ladi va bu xato emas.
if (!MARKERS.test(offline)) {
  throw new Error("oflayn.html da THEME belgilari topilmadi — generatsiya to'xtatildi");
}
writeFileSync(offlinePath, offline.replace(MARKERS, offlineCss));
console.log(
  `themes.generated.css yozildi — ${light.length} token × 2 tema, ` +
    `${themes.peer.length} peer rangi`,
);
console.log(`oflayn.html yangilandi — ${Object.keys(OFFLINE_TOKENS).length} token`);
