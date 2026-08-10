# Ish top — O'zbekiston uchun ish topish platformasi

Telegram uslubidagi ish topish platformasi. Asosiy raqib — hh.uz emas, Telegram
kanallari. Demak mahsulot Telegram kanalidan qulayroq bo'lishi kerak.

## Holat: 3-bosqich — ish beruvchi ekranlari

| Bosqich | Nima | Holat |
| --- | --- | --- |
| 1 | Dizayn tizimi — barcha komponentlar bitta sahifada | ✅ tayyor |
| 2 | Ish qidiruvchi ekranlari (statik) | ✅ tayyor |
| 3 | Ish beruvchi ekranlari (statik) | ✅ tayyor |
| 4 | Baza va API | ⏳ |
| 5 | Telegram autentifikatsiya | ⏳ |
| 6 | Chat funksiyasi | ⏳ |
| 7 | To'lov integratsiyasi (Payme, Click) | ⏳ |

## Ishga tushirish

```bash
npm install
npm run dev     # http://localhost:3000 → /jobs ga yo'naltiradi
```

### Ekranlar

| Manzil | Ekran |
| --- | --- |
| `/jobs` | Ishlar — kasb filtri, cheksiz aylanish, saralash, vakansiya sheeti |
| `/search` | Qidiruv — bitta maydon va so'nggi qidiruvlar |
| `/messages` | Xabarlar — ish beruvchilar bilan chatlar |
| `/chat/[id]` | Chat — ariza shu yerda davom etadi |
| `/saved` | Saqlangan vakansiyalar |
| `/profile` | Profil — kartochka, til, ko'rinish |
| `/card` | Kartochkani tahrirlash — 5 maydon |
| `/employer/vacancies` | Mening vakansiyalarim — ko'rishlar va arizalar soni |
| `/employer/new` | Vakansiya joylash — 4 qadam, ovozli vakansiya |
| `/employer/candidates` | Nomzodlar — arizalar chat ro'yxati sifatida |
| `/employer/chat/[id]` | Nomzod bilan chat |
| `/employer/plans` | Tariflar — Payme va Click |
| `/employer/profile` | Kompaniya profili |
| `/design` | Dizayn tizimi (1-bosqich) |

Rol Profil ekranidagi tugma orqali almashadi (ish qidiruvchi ↔ ish beruvchi).

Til va ko'rinish Profil ekranidan, dizayn tizimi sahifasida esa yuqoridagi
tanlagichlardan almashtiriladi.

```bash
npm run build   # ishlab chiqarish uchun yig'ish
npm run lint    # eslint
npx tsc --noEmit
```

## Dizayn qoidalari

- Bitta asosiy rang (`#229ED9`), qolgan hammasi kulrang shkalada
- Fon `#F5F5F5`, elementlar oq; burchaklar 10–12px
- Tizim shrifti; sarlavha 17px semibold, matn 15px, izoh 13px kulrang
- Ro'yxat elementlari orasida faqat ingichka chiziq — karta, soya, ramka yo'q
- Bo'lim sarlavhalari: kichik, kulrang, BOSH HARFLARDA
- Ikonkalar chiziqli (outline), to'ldirilgan emas
- Tungi rejim majburiy
- Modal oyna emas — pastdan ko'tariladigan sheet
- Yuklanishda spinner emas, skeleton
- Har bir tap darhol javob beradi (optimistic UI)

> Agar biror element Telegram'da yo'q bo'lsa — uni qo'shishdan oldin ikki marta o'yla.

## Tuzilma

```
app/
  globals.css           dizayn tokenlari (@theme), yorug'/tungi
  layout.tsx            providerlar, PWA meta, chaqnashsiz tungi rejim
  (app)/                tab bar bilan ekranlar: jobs, messages, saved, profile
  search/ chat/ card/   to'liq ekran (tab barsiz)
  design/               1-bosqich: dizayn tizimi bitta sahifada
components/
  providers/            theme-provider, i18n-provider
  app/                  app-tab-bar
  jobs/                 vacancy-row, vacancy-sheet
  ui/                   button, list, sheet, chip, tab-bar, ...
lib/
  i18n/locales/         uz.ts (manba), uz-cyrl.ts, ru.ts
  client-store.ts       localStorage + useSyncExternalStore
  stores.ts             saqlangan / yuborilgan arizalar / kartochka
  use-sheet.ts          sheet holati brauzer tarixiga bog'lanadi
  mock-data.ts          shartli ma'lumotlar (keyin bazadan keladi)
```

Holat (saqlangan vakansiyalar, yuborilgan arizalar, kartochka) hozircha
`localStorage`da — 4-bosqichda bazaga ko'chadi.

### Til

Standart til — o'zbek (lotin). Kirill va rus varianti ham bor. **Barcha matnlar
`lib/i18n/locales/` ichida**, kodga yozilmaydi. `lib/i18n/locales/uz.ts` — tuzilma
manbasi; boshqa fayllar `Dictionary` tipi orqali tekshiriladi, ya'ni yetishmayotgan
kalit kompilyatsiya xatosi beradi.

## Texnik stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · PWA (manifest)

Keyingi bosqichlarda: PostgreSQL, Telegram Login Widget, S3 mos fayl saqlash,
Payme/Click to'lovlari.
