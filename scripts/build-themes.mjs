/**
 * themes.json -> CSS o'zgaruvchilari.
 * Ranglar bitta joyda turishi uchun: komponentlarda hech qanday hex yo'q,
 * bu skript esa ularni CSS ga aylantiradi. `predev` va `prebuild` da ishlaydi.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const themes = JSON.parse(readFileSync(join(root, "styles/themes.json"), "utf8"));

const block = (tokens, indent = "  ") =>
  Object.entries(tokens)
    .map(([name, value]) => `${indent}--${name}: ${value};`)
    .join("\n");

/** Avatar va ism ranglari — logo bo'lmaganda ishlatiladi */
const peers = themes.peer
  .map((value, i) => `  --color-peer-${i}: ${value};\n  --color-peer-${i}-bg: ${value}1f;`)
  .join("\n");

const css = `/* Bu fayl generatsiya qilingan — tahrirlamang.
   Manba: styles/themes.json, skript: scripts/build-themes.mjs */

:root,
.theme-light {
${block(themes.light)}

${peers}
  color-scheme: light;
}

.theme-dark {
${block(themes.dark)}
  color-scheme: dark;
}
`;

writeFileSync(join(root, "app/themes.generated.css"), css);
console.log(`themes.generated.css yozildi — ${Object.keys(themes.light).length} token, ${themes.peer.length} peer rangi`);
