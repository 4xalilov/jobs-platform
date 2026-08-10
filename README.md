# Ish top — O'zbekiston uchun ish topish platformasi

Telegram uslubidagi ish topish platformasi. Asosiy raqib — hh.uz emas, Telegram
kanallari. Demak mahsulot Telegram kanalidan qulayroq bo'lishi kerak.

## Holat: 4-bosqich — baza va API

| Bosqich | Nima | Holat |
| --- | --- | --- |
| 1 | Dizayn tizimi — barcha komponentlar bitta sahifada | ✅ tayyor |
| 2 | Ish qidiruvchi ekranlari (statik) | ✅ tayyor |
| 3 | Ish beruvchi ekranlari (statik) | ✅ tayyor |
| 4 | Baza va API | ✅ tayyor |
| 5 | Telegram autentifikatsiya | ⏳ |
| 6 | Chat funksiyasi | ⏳ |
| 7 | To'lov integratsiyasi (Payme, Click) | ⏳ |

## Ishga tushirish

### Bazani ko'tarish

Ilova PostgreSQL'siz ishlamaydi — barcha ekranlar bazadan o'qiydi.

```bash
cp .env.example .env.local
docker compose up -d          # postgres:16, 5432-portda
npm install
npm run db:setup              # migratsiya + namunaviy ma'lumotlar
npm run dev                   # http://localhost:3000 → /jobs
```

`npm run db:setup` = `db:migrate` + `db:seed`. Seed jadvallarni tozalab,
20 ta kompaniya, 48 ta vakansiya, demo nomzod va uning chatlarini yozadi.
Generator turg'un urug'dan foydalanadi — har safar bir xil ma'lumot chiqadi.

Boshqa bazaga ulanish uchun `.env.local` dagi `DATABASE_URL` ni o'zgartiring.

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

### API

| Yo'l | Nima qiladi |
| --- | --- |
| `GET /api/vacancies` | Ro'yxat: `kasb`, `shahar`, `q`, `sort`, `cursor`, `lat`, `lng` |
| `GET /api/vacancies/[id]` | Bitta vakansiya, ko'rishlar soni oshadi |
| `POST /api/vacancies/[id]/apply` | Ariza + chat ochish |
| `POST /api/vacancies/[id]/save` | Saqlashni almashtirish |
| `GET /api/saved` · `GET /api/chats` · `GET /api/chats/[id]` | Nomzod ekranlari |
| `GET/PUT /api/card` | Nomzod kartochkasi |
| `GET/POST /api/employer/vacancies` | Ish beruvchi vakansiyalari |
| `DELETE /api/employer/vacancies/[id]` | Vakansiyani o'chirish |
| `GET /api/employer/candidates` · `GET /api/employer/chats/[id]` | Nomzodlar |
| `GET /api/professions` · `GET /api/cities` | Ma'lumotnomalar |

Sahifalar ma'lumotni to'g'ridan-to'g'ri server komponentlarida oladi; API
brauzerdan keladigan qo'shimcha so'rovlar uchun (cheksiz aylanish, qidiruv,
ariza yuborish).

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
  db/                   client, queries, types, session
  i18n/locales/         uz.ts (manba), uz-cyrl.ts, ru.ts
  api.ts                brauzerdan API'ga so'rovlar
  client-store.ts       localStorage + useSyncExternalStore
  stores.ts             til/ko'rinish va so'nggi qidiruvlar
  use-sheet.ts          sheet holati brauzer tarixiga bog'lanadi
  design-samples.ts     faqat /design sahifasi uchun namuna
db/
  migrations/           SQL migratsiyalar
  migrate.mjs seed.mjs  npm run db:migrate / db:seed
```

## Baza

Jadval nomlari ingliz tilida, ustun nomlari o'zbekcha — spetsifikatsiyadagidek.
Ikkita ustun transliteratsiya qilingan, chunki apostrof SQL identifikatorlarida
noqulay: `ko'rishlar` → `korishlar`, `o'qilgan` → `oqilgan`.

Spetsifikatsiyadagi jadvallardan tashqari uchtasi qo'shildi: `cities` va
`districts` (`shahar_id` / `tuman_id` shularga tayanadi) hamda
`saved_vacancies` ("Saqlangan" ekrani uchun).

- **Qidiruv** — PostgreSQL full-text search. `vacancies.qidiruv` tsvector
  ustunini trigger to'ldiradi: lavozim va kasb nomi (uchala tilda) A vaznda,
  kompaniya nomi B, tavsif C. `simple` konfiguratsiyasi tanlangan, chunki
  o'zbek tili uchun stemmer yo'q.
- **Masofa** — `haversine_km()` SQL funksiyasi. PostGIS kerak bo'lsa, faqat shu
  funksiyani almashtirish yetarli.
- **Sahifalash** — keyset (kursor), `OFFSET` ishlatilmaydi: aylantirish
  paytida yangi vakansiya qo'shilsa ham qatorlar takrorlanmaydi.

Foydalanuvchi hozircha cookie yoki `DEV_USER_ID` orqali aniqlanadi —
5-bosqichda Telegram Login Widget bilan almashtiriladi.

### Til

Standart til — o'zbek (lotin). Kirill va rus varianti ham bor. **Barcha matnlar
`lib/i18n/locales/` ichida**, kodga yozilmaydi. `lib/i18n/locales/uz.ts` — tuzilma
manbasi; boshqa fayllar `Dictionary` tipi orqali tekshiriladi, ya'ni yetishmayotgan
kalit kompilyatsiya xatosi beradi.

## Texnik stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · PWA (manifest)

Keyingi bosqichlarda: PostgreSQL, Telegram Login Widget, S3 mos fayl saqlash,
Payme/Click to'lovlari.
