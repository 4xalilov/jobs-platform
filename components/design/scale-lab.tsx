"use client";

import styles from "./scale-lab.module.scss";

/**
 * Bo'shliq, radius va tipografika shkalalari.
 *
 * Ko'rish uchun emas, **tekshirish** uchun: har bir qiymat yonida rem va
 * piksel turadi. Oraliq qiymat ishlatilgan joyni shu yerda ko'rib
 * darhol sezish mumkin — u shkalaga tushmaydi.
 */

const SPACE = [
  ["space-1", "0.25rem", 4],
  ["space-2", "0.5rem", 8],
  ["space-3", "0.75rem", 12],
  ["space-4", "1rem", 16],
  ["space-6", "1.5rem", 24],
  ["space-8", "2rem", 32],
  ["space-12", "3rem", 48],
] as const;

const RADIUS = [
  ["radius-sm", "0.5rem", "chip, badge"],
  ["radius-md", "0.75rem", "kartochka, input, pufak"],
  ["radius-lg", "1rem", "sheet"],
  ["radius-xl", "1.25rem", "modal, rasm"],
  ["radius-full", "62.4375rem", "avatar, yumaloq tugma"],
] as const;

const TYPE = [
  ["display", 34, 700, "Ishlar"],
  ["title-1", 24, 600, "Sotuvchi kerak"],
  ["title-2", 20, 600, "Kompaniya haqida"],
  ["amount", 18, 700, "5–7 mln so'm"],
  ["nav", 17, 600, "Kanal nomi"],
  ["body", 15, 400, "Asosiy matn shu o'lchamda"],
  ["body-sm", 14, 400, "Ikkinchi darajali matn"],
  ["caption", 13, 400, "Izoh va meta"],
  ["micro", 11, 500, "23 SOAT"],
] as const;

export function ScaleLab() {
  return (
    <div className={styles.lab}>
      <p className={styles.groupTitle}>Bo&apos;shliq — 4px asosda</p>
      <div className={styles.rows}>
        {SPACE.map(([name, rem, px]) => (
          <div key={name} className={styles.row}>
            <span className={styles.label}>{name}</span>
            <span className={styles.bar} style={{ width: rem }} />
            <span className={styles.value}>
              {rem} · {px}px
            </span>
          </div>
        ))}
      </div>

      <p className={styles.groupTitle}>Radius</p>
      <div className={styles.rows}>
        {RADIUS.map(([name, rem, usage]) => (
          <div key={name} className={styles.row}>
            <span className={styles.label}>{name}</span>
            <span className={styles.radiusBox} style={{ borderRadius: rem }} />
            <span className={styles.value}>{usage}</span>
          </div>
        ))}
      </div>

      <p className={styles.groupTitle}>Tipografika — o&apos;lcham ham ierarxiya beradi</p>
      <div className={styles.typeRows}>
        {TYPE.map(([name, px, weight, sample]) => (
          <div key={name} className={styles.typeRow}>
            <span
              className={styles.sample}
              style={{ fontSize: `${px / 16}rem`, fontWeight: weight }}
            >
              {sample}
            </span>
            <span className={styles.value}>
              {name} · {px}px · {weight}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
