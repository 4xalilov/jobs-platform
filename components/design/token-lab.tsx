"use client";

import { ratio } from "@/lib/color.mjs";
import themes from "@/styles/themes.json";
import styles from "./token-lab.module.scss";

/**
 * Token sinov maydoni.
 *
 * v4 da `/design` ko'rgazma edi: ranglarni ko'rsatardi, lekin ular
 * ishlatilishi mumkinmi-yo'qmi demasdi. Natijada palitra AA dan
 * o'tmasligi bir yil sezilmadi (AUDIT.md, 5.1).
 *
 * Endi bu yerda har bir juftlik yonida **hisoblangan kontrast** turadi
 * va o'tmagani qizil bilan belgilanadi. Qiymat themes.json dan olinadi,
 * formula esa `lib/color.mjs` dan — ya'ni `npm run lint:tokens` bilan
 * bir xil manba. Ikkalasi hech qachon bir-biriga qarshi chiqmaydi.
 */

type Theme = "light" | "dark";

/** AA: oddiy matn 4.5, katta matn va UI chegarasi 3.0 */
const TEXT = 4.5;
const UI = 3;

function Ratio({ fg, bg, need = TEXT }: { fg: string; bg: string; need?: number }) {
  const value = ratio(fg, bg);
  const ok = value >= need;
  return (
    <span className={ok ? styles.pass : styles.fail} title={`kerak ${need}`}>
      {value.toFixed(2)}
      {ok ? "" : " ✗"}
    </span>
  );
}

/** Bitta rang namunasi: kvadrat, nomi, qiymati */
function Swatch({ name, value, label }: { name: string; value: string; label?: string }) {
  return (
    <div className={styles.swatch}>
      <span className={styles.chip} style={{ background: value }} />
      <span className={styles.swatchText}>
        <span className={styles.swatchName}>{label ?? name}</span>
        <span className={styles.swatchValue}>{value}</span>
      </span>
    </div>
  );
}

export function TokenLab({ theme }: { theme: Theme }) {
  const p = themes[theme];
  const surfaces: [string, string][] = [
    ["base", p.surface.base],
    ["raised", p.surface.raised],
    ["overlay", p.surface.overlay],
    ["sunken", p.surface.sunken],
    ["pressed", p.surface.pressed],
  ];

  const semantics: [string, { text: string; soft: string; border: string }][] = [
    ["brand", p.brand],
    ["success", p.success],
    ["warning", p.warning],
    ["error", p.error],
    ["info", p.info],
  ];

  const meanings: [string, { text: string; soft: string }][] = [
    ["daily", p.meaning.daily],
    ["new", p.meaning.new],
    ["fast", p.meaning.fast],
    ["urgent", p.meaning.urgent],
  ];

  return (
    <div className={styles.lab}>
      {/* ——— Sirtlar: to'rt daraja + bosilgan holat ——— */}
      <p className={styles.groupTitle}>Sirtlar</p>
      <div className={styles.grid}>
        {surfaces.map(([name, value]) => (
          <Swatch key={name} name={`surface-${name}`} value={value} />
        ))}
      </div>

      {/* ——— Matn: har bir daraja har bir sirtda ——— */}
      <p className={styles.groupTitle}>Matn darajalari — kontrast har bir sirtda</p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>token</th>
            {surfaces.map(([name]) => (
              <th key={name}>{name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(["primary", "secondary", "tertiary"] as const).map((level) => (
            <tr key={level}>
              <td>
                <span style={{ color: p.text[level] }}>text-{level}</span>
              </td>
              {surfaces.map(([name, bg]) => (
                <td key={name}>
                  <Ratio fg={p.text[level]} bg={bg} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ——— Semantik ranglar: matn, yumshoq fon, chegara ——— */}
      <p className={styles.groupTitle}>Semantik ranglar</p>
      <div className={styles.semantics}>
        {semantics.map(([name, group]) => (
          <div key={name} className={styles.semantic}>
            <span
              className={styles.badge}
              style={{ background: group.soft, color: group.text, borderColor: group.border }}
            >
              {name}
            </span>
            <span className={styles.semanticMeta}>
              yuzada <Ratio fg={group.text} bg={p.surface.raised} /> · o&apos;z fonida{" "}
              <Ratio fg={group.text} bg={group.soft} />
            </span>
          </div>
        ))}
      </div>

      {/* ——— Ma'no ranglari: har bir chip o'z hue'sida ——— */}
      <p className={styles.groupTitle}>Ma&apos;no ranglari — har biri boshqa hue</p>
      <div className={styles.semantics}>
        {meanings.map(([name, group]) => (
          <div key={name} className={styles.semantic}>
            <span className={styles.badge} style={{ background: group.soft, color: group.text }}>
              {name}
            </span>
            <span className={styles.semanticMeta}>
              <Ratio fg={group.text} bg={group.soft} />
            </span>
          </div>
        ))}
      </div>

      {/* ——— To'ldirilgan tugma ——— */}
      <p className={styles.groupTitle}>To&apos;ldirilgan yuza</p>
      <div className={styles.semantics}>
        <div className={styles.semantic}>
          <span
            className={styles.solid}
            style={{ background: p.brand.solid, color: p.text["on-solid"] }}
          >
            brand-solid
          </span>
          <span className={styles.semanticMeta}>
            matn <Ratio fg={p.text["on-solid"]} bg={p.brand.solid} /> · yuzadan ajralishi{" "}
            <Ratio fg={p.brand.solid} bg={p.surface.raised} need={UI} />
          </span>
        </div>
        <div className={styles.semantic}>
          <span
            className={styles.solid}
            style={{ background: p.brand["solid-pressed"], color: p.text["on-solid"] }}
          >
            bosilgan
          </span>
          <span className={styles.semanticMeta}>
            <Ratio fg={p.text["on-solid"]} bg={p.brand["solid-pressed"]} />
          </span>
        </div>
      </div>

      {/* ——— Chegaralar ——— */}
      <p className={styles.groupTitle}>Chegaralar</p>
      <div className={styles.grid}>
        {(["subtle", "default", "strong"] as const).map((level) => (
          <div key={level} className={styles.swatch}>
            <span className={styles.borderChip} style={{ borderColor: p.border[level] }} />
            <span className={styles.swatchText}>
              <span className={styles.swatchName}>border-{level}</span>
              <span className={styles.swatchValue}>
                {p.border[level]}
                {level === "strong" && (
                  <>
                    {" · "}
                    <Ratio fg={p.border.strong} bg={p.surface.raised} need={UI} />
                  </>
                )}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* ——— Avatar ranglari: oq matn hammasida o'qilishi kerak ——— */}
      <p className={styles.groupTitle}>Avatar ranglari — oq bosh harf ustida</p>
      <div className={styles.peers}>
        {themes.peer.map((color) => (
          <span key={color} className={styles.peerCell}>
            <span className={styles.peer} style={{ background: color }}>
              <span className={styles.peerInitials}>AB</span>
            </span>
            {/* Nisbat doira tashqarisida: ichida bo'lsa u ham
                o'qilmaydigan matnga aylanardi */}
            <span className={styles.peerRatio}>
              <Ratio fg={themes[theme].text["on-solid"]} bg={color} />
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
