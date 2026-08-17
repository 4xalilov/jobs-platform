/**
 * Token kontrastini WCAG 2.2 AA bo'yicha tekshiradi:  npm run lint:tokens
 *
 * Nega kerak: v4 da palitra Telegram dan ko'chirilgan edi va 550 ta
 * kontrast xatosi bergan — ularning hammasi 6 ta qiymatdan kelib
 * chiqqan (AUDIT.md, 5.1). Bunday xatoni ko'z bilan topib bo'lmaydi,
 * lekin formula bilan bir sekundda topiladi.
 *
 * Bu yerda tekshirilayotgani — token juftliklari, ya'ni "qaysi rang
 * qaysi fonda ishlatilishi mumkin" degan shartnoma. Ekranda haqiqatan
 * shu juftliklar ishlatilayotganini komponent testlari tekshiradi.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ratio } from "../lib/color.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const themes = JSON.parse(readFileSync(join(root, "styles/themes.json"), "utf8"));

/** AA: oddiy matn 4.5, UI chegarasi va katta matn 3.0 */
const TEXT = 4.5;
const UI = 3;

const SURFACES = ["surface.base", "surface.raised", "surface.overlay"];

/** Har bir matn rangi qaysi fonlarda ishlatilishi mumkin */
const rules = [
  // Matn darajalari — uchala sirtda ham
  ...["text.primary", "text.secondary", "text.tertiary"].flatMap((fg) =>
    SURFACES.map((bg) => ({ fg, bg, need: TEXT })),
  ),
  // Kirish maydoni ichidagi matn
  { fg: "text.primary", bg: "surface.sunken", need: TEXT },
  { fg: "text.tertiary", bg: "surface.sunken", need: TEXT, note: "placeholder" },
  // Bosilgan holat foni ustida ham o'qilsin
  { fg: "text.primary", bg: "surface.pressed", need: TEXT },
  { fg: "text.tertiary", bg: "surface.pressed", need: TEXT },

  // To'ldirilgan tugma: ustidagi matn
  { fg: "text.on-solid", bg: "brand.solid", need: TEXT },
  { fg: "text.on-solid", bg: "brand.solid-pressed", need: TEXT },

  // Aksent va semantik matnlar sirtlarda
  ...["brand.text", "success.text", "warning.text", "error.text", "info.text"].flatMap((fg) =>
    SURFACES.map((bg) => ({ fg, bg, need: TEXT })),
  ),

  // Yumshoq fon ustidagi o'z matni (chip, ogohlantirish qutisi)
  ...[
    ["brand.text", "brand.soft"],
    ["success.text", "success.soft"],
    ["warning.text", "warning.soft"],
    ["error.text", "error.soft"],
    ["info.text", "info.soft"],
    ["meaning.daily.text", "meaning.daily.soft"],
    ["meaning.new.text", "meaning.new.soft"],
    ["meaning.fast.text", "meaning.fast.soft"],
    ["meaning.urgent.text", "meaning.urgent.soft"],
  ].map(([fg, bg]) => ({ fg, bg, need: TEXT })),

  // Ma'no chiplari sirtlarda ham ishlatiladi
  ...["meaning.daily.text", "meaning.new.text", "meaning.fast.text", "meaning.urgent.text"].flatMap(
    (fg) => [{ fg, bg: "surface.raised", need: TEXT }],
  ),

  // To'ldirilgan fonlar: ustidagi oq matn o'qilishi kerak
  ...["success.solid", "warning.solid", "error.solid", "info.solid", "neutral.solid"].map((bg) => ({
    fg: "text.on-solid",
    bg,
    need: TEXT,
  })),

  // Chegara — UI elementi, 3.0 yetadi
  { fg: "border.strong", bg: "surface.base", need: UI },
  { fg: "border.strong", bg: "surface.raised", need: UI },
  { fg: "brand.solid", bg: "surface.raised", need: UI, note: "tugma foni yuzadan ajralsin" },
  { fg: "brand.solid", bg: "surface.base", need: UI },
];

let failed = 0;
let checked = 0;

const pick = (theme, path) =>
  path.split(".").reduce((node, key) => {
    if (node === undefined || node === null) throw new Error(`Token yo'q: ${path}`);
    return node[key];
  }, themes[theme]);

for (const theme of ["dark", "light"]) {
  const bad = [];
  for (const rule of rules) {
    const fg = pick(theme, rule.fg);
    const bg = pick(theme, rule.bg);
    const value = ratio(fg, bg);
    checked++;
    if (value < rule.need) bad.push({ ...rule, fg, bg, value });
  }
  if (bad.length === 0) {
    console.log(`✓ ${theme}: ${rules.length} juftlik, hammasi AA dan o'tdi`);
  } else {
    failed += bad.length;
    console.error(`✗ ${theme}: ${bad.length} juftlik AA dan o'tmadi`);
    for (const b of bad) {
      console.error(
        `    ${b.fg} (${b.value}) ${b.bg} ustida — kerak ${b.need}` +
          `   [${rules.find((r) => r === b) ? "" : ""}${b.note ? " " + b.note : ""}]`,
      );
    }
  }
}

// Avatar bosh harflari oq — har bir peer rangi bilan tekshiriladi
const peerBad = themes.peer
  .map((color, i) => ({ i, color, value: ratio("#FFFFFF", color) }))
  .filter((p) => p.value < TEXT);

if (peerBad.length === 0) {
  console.log(`✓ peer: ${themes.peer.length} rang, oq matn hammasida AA dan o'tdi`);
} else {
  failed += peerBad.length;
  console.error(`✗ peer: ${peerBad.length} rangda oq matn o'qilmaydi`);
  for (const p of peerBad) console.error(`    peer-${p.i} ${p.color} — ${p.value}, kerak ${TEXT}`);
}

console.log(`\n${checked + themes.peer.length} tekshiruv, ${failed} xato`);
if (failed > 0) {
  console.error("\nTuzatish: styles/themes.json dagi qiymatni o'zgartiring.");
  console.error("Yordamchi: lib/color.mjs dagi fitContrast() kerakli qiymatni topadi.");
  process.exit(1);
}
