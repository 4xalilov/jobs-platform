# Ish top — loyiha holati

O'zbekiston uchun ish topish platformasi. Asosiy raqib hh.uz emas, **Telegram
kanallari** — demak mahsulot Telegram kanalidan qulayroq bo'lishi kerak.

Bu hujjat nima qilinganini, **nega shunday qilinganini** va nima qilinmaganini
yozadi. Keyingi bosqich uchun buyruq yozayotganda shundan foydalaning.

Holat: **v5 boshlandi.** B0 (audit) va B1 (vizual til) tugadi. Barcha ekranlar
ishlaydi, bazaga ulangan, telefonda ham, kompyuterda ham ochiladi.

| O'lcham            | Qiymat                                                  |
| ------------------ | ------------------------------------------------------- |
| Kod                | ~19 700 qator (TS, TSX, SCSS, SQL)                      |
| Ekranlar           | 21 ta                                                   |
| API yo'llari       | 38 ta                                                   |
| Baza jadvallari    | 18 ta + 1 ko'rinish, 8 ta migratsiya                    |
| SCSS modullari     | 33 ta                                                   |
| Tarjima kalitlari  | ~477 ta × 3 til                                         |
| Namunaviy ma'lumot | 23 kanal, 34 kompaniya, 180 vakansiya, 44 foydalanuvchi |

---

## 1. Ishga tushirish

```bash
npm run setup    # .env.local, paketlar, Postgres, jadvallar, namunaviy ma'lumot
npm run dev      # http://localhost:3000
```

`setup` besh qadamni bajaradi va har birini nomlab boradi; yiqilsa sababi va
yechimi o'zbekcha chiqadi. Baza avval oddiy TCP bilan ulanib ko'riladi,
keyingina Docker'ga qo'l uriladi — ya'ni **Docker majburiy emas.** Baza yo'q
bo'lsa skript uni o'zi yaratadi.

Kirish ekranida «Namunaviy foydalanuvchi» tugmasi bor. U bir vaqtning o'zida
ham nomzod, ham Chorsu Market egasi — bitta kirish bilan ikkala tomonni ham
ko'rish mumkin.

Boshqa buyruqlar: `db:migrate`, `db:seed`, `db:setup`, `themes`, `lint`,
`lint:css`, `vapid`, `build`, `start`.

---

## 2. Mahsulot qarorlari

Bular shunchaki funksiya emas — har birining ortida sabab bor. Keyingi
bosqichda bir narsani o'zgartirmoqchi bo'lsangiz, avval sababini o'qing.

### Kanal modeli (v4)

Vakansiyalar bitta tekis ro'yxatda emas, **kanallar ichida** oqadi. Kanal =
kasb. Hudud kanal EMAS — aks holda kanallar soni kasb × shahar bo'lib ketardi
va hech kim ularni boshqarolmasdi.

Bitta istisno: **«Kunlik ishlar»** kanali bandlik turi bo'yicha yig'iladi.
Sababi — O'zbekistonda bu segment katta va bironta platforma uni qamramagan.

Kanal ↔ vakansiya bog'lanishi jadvalda **saqlanmaydi**: u vakansiya
maydonlaridan kelib chiqadi (`channel_vacancies` ko'rinishi). Ya'ni bitta
vakansiya ikkita kanalda ko'rinishi mumkin — bu ataylab.

Kanal katalogda ko'rinishi uchun kamida **5 ta** vakansiyasi bo'lishi kerak.
Bo'sh kanal ochilsa foydalanuvchi qaytib kelmaydi.

### Bildirishnoma: kuniga bitta

Har vakansiyaga alohida push **yo'q**. Kuniga bitta yig'ma xabar keladi:
«57 ta yangi ish — Kunlik ishlar 32, Administrator 9, yana 2 ta kanal».

Sabab Telegram kanallaridan olingan: kuniga o'nlab xabar olgan odam oxiri
kanalni ovozsiz qiladi va keyin hech narsani ko'rmaydi. Kuniga bitta xabar
o'qiladi, o'ntasi o'qilmaydi.

Kanalni ovozsiz qilish (uzoq bosish) yig'ma xabarga ham ta'sir qiladi —
«ovozsiz» foydalanuvchi uchun bitta ma'noni bildiradi, ikkita emas.

### Rezyume o'rniga kartochka

Nomzodda rezyume yo'q, **5 maydonli kartochka** bor: ism, kasb, shahar
(+tuman), ish turi, tajriba. Rezyume yozish 40 daqiqa oladi va ko'pchilik uni
tashlab ketadi; kartochka 60 sekundda to'ladi.

### Vakansiya joylash: 5 savol

Erkin matnli tavsif yo'q. Talablar **ro'yxatdan tanlanadi** (11 ta kalit:
tajriba shart emas, pasport, tibbiy daftarcha, haydovchilik guvohnomasi, o'z
transporti, rus tili, ingliz tili, kompyuter, kassa apparati, jismoniy ish,
…). Erkin matn qidiruvni buzadi va ish beruvchini «hamma narsa kerak» deb
yozishga undaydi.

Maoshsiz («kelishilgan holda») vakansiya kam ariza oladi — buni yashirmaymiz,
ish beruvchiga ochiq ogohlantirish chiqadi.

### Ishonch qatlami

Telegram kanalida bunday ma'lumot yo'q — bu bizning ustunligimiz:

- **Moslik** foiz emas, **ro'yxat**: nima mos keldi, nima kelmadi, nimasi
  yetishmayapti. Foiz ishonchni yo'qotadi, ro'yxat esa harakatga aylanadi.
- **Javob ko'rsatkichi** ochiq: necha foiz javob beradi, o'rtacha qancha
  vaqtda, oxirgi marta qachon kirgan.
- **Raqobat** faqat raqam: «12 kishi ariza yubordi». Nomzodning o'rni
  ko'rsatilmaydi — uni tekshirib bo'lmaydi va noto'g'ri chiqsa ishonch yo'qoladi.
- Kam javob beradigan ish beruvchining vakansiyasi ro'yxatda **pastga tushadi**.

### Ariza — bir tomonlama harakat emas

«Ish qidiryapman» tugmasi oqimni ikki tomonli qiladi: ish beruvchi ariza
kutmasdan nomzodni o'zi topadi. Ko'rinish darajasi tanlanadi (hamma / faqat
ish beruvchilar).

Ariza holati to'rt bosqichli zanjir bo'lib ko'rsatiladi: Yuborildi →
Ko'rildi → Ko'rib chiqilmoqda → Javob berildi. 7 kun javob bo'lmasa turtki va
o'xshash vakansiyalar chiqadi.

### Kirish: faqat Telegram

Parol ham, elektron pochta ham yo'q. Imzo tekshiruvi Telegram hujjatidagidek
(`SHA256(bot_token)` → HMAC), sessiya esa HMAC-SHA256 bilan imzolangan
`httpOnly` cookie — JWT kutubxonasisiz, chunki bizga faqat imzolangan
foydalanuvchi id kerak.

### To'lov — ataylab tashlab ketilgan

Tariflar ekrani bor (Bepul, Standart 59 000, Premium 129 000, Paket 449 000,
Nomzodlar bazasi 299 000/oy), Payme va Click tugmalari ko'rinadi, lekin
**o'chirilgan**. Haqiqiy integratsiya keyinga qoldirilgan.

---

## 3. Ekranlar

### Ish qidiruvchi

| Manzil                 | Ekran                                             |
| ---------------------- | ------------------------------------------------- |
| `/jobs`                | Ishlar — obuna bo'lingan kanallar ro'yxati        |
| `/jobs/katalog`        | Kanallar katalogi, kasb guruhlari bo'yicha        |
| `/jobs/[kanal]`        | Kanal ichi — bandlik chiplari, cheksiz aylanish   |
| `/saved`               | Saqlangan vakansiyalar (Profil ichidan)           |
| `/search`              | Qidiruv — bitta maydon va so'nggi qidiruvlar      |
| `/messages`            | Xabarlar — ish beruvchilar bilan chatlar          |
| `/chat/[id]`           | Chat — ariza shu yerda davom etadi                |
| `/arizalarim`          | Yuborilgan arizalar va ularning holati            |
| `/profile`             | Profil — kartochka, bildirishnoma, til, ko'rinish |
| `/card`                | Kartochka muharriri                               |
| `/kirish`, `/boshlash` | Kirish va tanishtiruv                             |

Pastdagi 4 ta bo'lim: **Ishlar · Arizalarim · Xabarlar · Profil**.

### Ish beruvchi

| Manzil                 | Ekran                                           |
| ---------------------- | ----------------------------------------------- |
| `/employer/vacancies`  | Mening vakansiyalarim + FAB                     |
| `/employer/candidates` | Nomzodlar — chapga tortsa rad, o'ngga chaqirish |
| `/employer/qidiruv`    | «Ish qidiryapman» belgisini yoqqan nomzodlar    |
| `/employer/profile`    | Kompaniya profili                               |
| `/employer/plans`      | Tariflar                                        |
| `/employer/new`        | Vakansiya joylash — 5 qadam                     |
| `/employer/chat/[id]`  | Chat (nomzod bilan bir xil ekran)               |

### Xizmat

`/design` — dizayn tizimi: hamma komponent, ikkala temada va uch tilda.

---

## 4. Dizayn tizimi

### Ranglar

Kodga yozilmaydi — **`styles/themes.json`** yagona manba. Undan
`scripts/build-themes.mjs` `app/themes.generated.css` ni chiqaradi (`predev`
va `prebuild` da avtomatik), `scripts/check-contrast.mjs` esa har bir
juftlikni WCAG 2.2 AA bo'yicha tekshiradi (`npm run lint:tokens`).

**Tungi rejim birinchi loyihalanadi**, yorug'i undan chiqariladi: OLED
ekranda qora piksel quvvat sarflamaydi va auditoriya kechqurun telefon
ko'radi. Toza qora (#000) ishlatilmaydi — OLED da chegarada dog' beradi.

**Brend rangi — jade `#0D856A`.** Nega u: Telegram ko'kidan butunlay farq
qiladi, «sovuq emas» talabiga mos, AA dan bosh ko'tarib o'tadi (oq matn
4.58, yuzada 5.28), va bu mahsulotda «ijobiy» ma'no bilan tabiiy ustma-ust
tushadi — tasdiqlangan, tez javob, ariza qabul qilindi. Ya'ni alohida
«success» rangi uchun hue sarflanmaydi va to'rtta ma'no rangi
(kunlik / yangi / tez / shoshilinch) o'z hue'sida qoladi.

Token guruhlari:

| Guruh                          | Nima               | Darajalar                                                      |
| ------------------------------ | ------------------ | -------------------------------------------------------------- |
| `surface-*`                    | Sirtlar            | `base` · `raised` · `overlay` · `sunken` · `pressed`           |
| `text-*`                       | Matn               | `primary` · `secondary` · `tertiary` · `on-solid`              |
| `border-*`                     | Chegara            | `subtle` · `default` · `strong`                                |
| `brand-*`                      | Brend              | `solid` · `solid-pressed` · `text` · `soft` · `border`         |
| `success/warning/error/info-*` | Semantik           | `text` · `solid` · `soft` · `border`                           |
| `meaning-*`                    | Ma'no chiplari     | `daily` · `new` · `fast` · `urgent` (har biri `text` + `soft`) |
| `neutral-solid`                | Neytral to'ldirish | belgi foni                                                     |
| `scrim-*`                      | Qatlam orqasi      | `default` · `strong`                                           |
| `skeleton-*`                   | Yuklanish          | `base` · `shine`                                               |
| `color-peer-0…6`               | Avatar             | 7 rang, oq matn AA dan o'tadi                                  |

Muhim farq: **`*-text` yuzada matn uchun, `*-solid` to'ldirilgan fon
uchun.** Ular almashib ketsa kontrast yiqiladi — v4 da aynan shu xato bor
edi (`--color-primary` matn sifatida ishlatilardi, kontrast 3.80).

Qo'lda yozilgan rang stylelint bilan taqiqlangan (`color-no-hex`,
`color-named`, `rgb()` taqiqi). Brauzer panelining rangi ham `themes.json`
dan olinadi — qo'lda yozilganda palitra o'zgargach eskirib qolardi.

### O'lchamlar

Hammasi **rem** da, ildiz 16px — foydalanuvchi brauzer shriftini
kattalashtirsa butun interfeys proporsional o'sadi.

| O'lcham          | Qiymat                    |
| ---------------- | ------------------------- |
| Ustun kengligi   | 27.5rem (440px), markazda |
| Yuqori panel     | 3.5rem                    |
| Tab bar          | 3.125rem                  |
| Ro'yxat elementi | 4.75rem                   |
| Vakansiya qatori | 6rem, 4 qator             |
| Tugma (lg)       | 3.125rem                  |
| Yon bo'shliq     | 1rem                      |
| Ajratuvchi       | 0.5px (qurilma pikselida) |

**Shkalalar qat'iy** (v5/B1), oraliq qiymat ishlatilmaydi:

- Bo'shliq: 4 / 8 / 12 / 16 / 24 / 32 / 48 (`$space-1…12`)
- Radius: 8 / 12 / 16 / 20 / to'liq (`$radius-sm…full`)
- Tipografika: display 34/700 · title-1 24 · title-2 20 · **amount 18/700**
  · nav 17 · body 15 · body-sm 14 · caption 13 · micro 11

`amount` — maosh uchun: vakansiya kartochkasida eng ko'zga tashlanadigan
element bo'lishi kerak.

Balandlik soya bilan emas, **tonal sirt** bilan beriladi
(`base → raised → overlay`). Soya faqat yorug' rejimdagi qatlam uchun.

### Animatsiya

Telegram ning haqiqiy egri chiziqlari:
`$ease-slide: cubic-bezier(0.25, 1, 0.5, 1)`, `$ease-layer: cubic-bezier(0.33, 1, 0.68, 1)`.

- Ekran o'tishi 0.3s — yo'nalish (oldinga/orqaga/fade) navigatsiya
  funksiyasining o'zi tomonidan e'lon qilinadi, taxmin qilinmaydi.
- Sheet pastdan 0.3s, ro'yxat elementi 0.2s fade + 0.5rem, navbatma-navbat
  30ms kechikish bilan.
- Bosish javobi: 0.97 masshtab, 100ms — server javobini kutmaydi.
- `prefers-reduced-motion` hamma joyda hurmat qilinadi.

### Uslub yozish

Barcha uslub **SCSS Modules** da (33 ta modul). Tailwind butunlay olib
tashlangan. Takrorlanadigan bo'laklar `styles/shared.module.scss` da.

Reset `@layer reset` ichida: qatlamsiz qoidalar qatlamlilardan kuchli, ya'ni
komponent uslubi reset'ni doim yengadi.

`stylelint` unumdorlikni buzadigan animatsiyalarni xato deb belgilaydi
(`npm run lint:css`).

---

## 5. Texnik tuzilma

```
app/            Next.js App Router — ekranlar va API yo'llari
components/
  ui/           Dizayn tizimi: 18 ta komponent
  app/          Qobiq, ekran, tab barlar
  channels/ jobs/ chat/ applications/ profile/ auth/ employer/
  providers/    i18n va tema
lib/
  db/           Baza: client, queries, channels, push, types, session
  auth/         Sessiya va Telegram imzosi
  push/         Web Push yuborish
  i18n/         3 til
  navigation.ts Ekran o'tishlari va scroll tiklash
  idb.ts        IndexedDB keshi
db/migrations/  8 ta SQL migratsiya
styles/         themes.json va SCSS o'zgaruvchilari
scripts/        setup, build-themes, vapid
public/         sw.js, oflayn.html, manifest, ikonkalar
```

Stack: **Next.js 16.3** (App Router, Turbopack), **React 19.2**,
**TypeScript**, **PostgreSQL 16** (xom `pg`, ORM yo'q), **SCSS Modules**.

Bog'liqliklar ataylab kam: `clsx`, `next`, `pg`, `react`, `server-only`,
`web-push`.

### Kesh va oflayn — uch qatlam

| Qatlam         | Nima saqlaydi                              |
| -------------- | ------------------------------------------ |
| `localStorage` | Ko'rinish, til, kanal filtri, tab xotirasi |
| IndexedDB      | Kanallar va arizalar ro'yxati (24 soat)    |
| Cache Storage  | HTML, JS, CSS, API javoblari               |

Service worker uch strategiya: statik fayllar cache-first, sahifalar va
`GET /api/*` network-first, yozuvchi so'rovlar umuman keshlanmaydi.

Zaxira ekran `public/oflayn.html` — oddiy HTML, Next sahifasi emas (Next
sahifasi boshqa manzil o'rniga qaytarilganda gidratsiyada yiqilardi).

Chiqishda uchala qatlam ham tozalanadi; ko'rinish va til qurilma sozlamasi
sifatida qoladi.

### Unumdorlik

- Virtualizatsiya kutubxonasi **yo'q** — `content-visibility: auto` +
  `contain-intrinsic-size` yetdi. O'lchov bu qarorni tasdiqladi.
- Vakansiya sheeti kerak bo'lgandagina yuklanadi (lazy).
- Keyset (kursor) sahifalash.
- `experimental.staleTimes` bilan mijoz router keshi.

---

## 6. Baza

18 jadval: `cities`, `districts`, `professions`, `users`, `candidate_cards`,
`companies`, `vacancies`, `applications`, `chats`, `messages`, `payments`,
`saved_vacancies`, `message_audio`, `hidden_vacancies`, `channels`,
`subscriptions`, `push_subscriptions` va migratsiya jurnali.

Ustun nomlari **o'zbekcha** (`joylashtirilgan_sana`, `bandlik_turi`,
`holat`, `ovozsiz`) — mahsulot tili bilan bir xil bo'lsin.

`channel_vacancies` — ko'rinish, jadval emas (yuqoriga qarang).

Migratsiyalar ketma-ket qo'llanadi va `migrations` jadvalida belgilanadi;
qayta ishga tushirish xavfsiz. Ulanish xatolari o'zbekcha, yechimi bilan
chiqadi — ilova ham, skriptlar ham bir xil matnni ishlatadi.

---

## 7. Nima qilinmagan

Bu ro'yxat keyingi bosqich uchun eng foydali qism.

### Ataylab tashlab ketilgan

- **To'lov integratsiyasi** (Payme, Click) — tugmalar bor, o'chirilgan.
- **Rasm va video yuklash** — Profildagi «Foto» va «Ovozli xabar» qatorlari
  bosilganda hech narsa qilmaydi. Ovozli xabar **chatda** ishlaydi, lekin
  profil media qismi yo'q.
- **Ish beruvchi tomonida kanal boshqaruvi** — ish beruvchi vakansiya
  joylaydi, kanal esa kasb bo'yicha o'zi tanlanadi.
- **Administrator paneli** — moderatsiya, shikoyat, bloklash yo'q.
- **Test to'plami** — avtomatlashtirilgan testlar yozilmagan. Har bosqich
  brauzerda Playwright bilan qo'lda tekshirilgan, lekin CI da ishlaydigan
  doimiy testlar yo'q.

### Yarim tayyor

- **Bildirishnoma** — kod to'liq ishlaydi va tekshirilgan, lekin VAPID
  kalitlari berilmasa jim o'chiq turadi. Onlayn ishlashi uchun `vercel.json`
  dagi cron kerak, u hali yo'q.
- **Qidiruv** — faqat lavozim va kompaniya nomi bo'yicha. Filtr (maosh,
  hudud, ish turi) qidiruv ekranida yo'q; ular faqat kanal ichida chip
  sifatida bor.
- **Ish beruvchi statistikasi** — ko'rishlar va arizalar soni ko'rsatiladi,
  lekin dinamika, grafik yoki taqqoslash yo'q.
- **Tuman darajasidagi filtr** — kartochkada va vakansiyada tuman bor, lekin
  ro'yxatni tuman bo'yicha filtrlash yo'q.

### Sifat bo'yicha bo'shliqlar

- **Xato holatlari** — baza xatosi endi ekranda ko'rinadi, lekin bu faqat
  kirish yo'lida. Boshqa yo'llar hali ham bo'sh 500 qaytarishi mumkin.
- **Bo'sh holatlar** — bor, lekin hammasi bir xil ko'rinishda; ba'zilariga
  harakat tugmasi yetishmaydi.
- **Yuklanish holatlari** — skelet faqat ba'zi ekranlarda.
- **Klaviatura bilan yurish** — fokus halqasi global qo'yilgan, lekin
  sheet ichida fokus tuzog'i (focus trap) yo'q.
- **Ekran o'quvchi** — `aria-label` lar bor, lekin to'liq tekshirilmagan.

---

## 7.5. v5 jarayoni

### B0 — audit (tugadi)

`AUDIT.md` — 448 qator o'lchov. Uchta eng zaif joy topildi: palitra AA dan
o'tmasligi (550 xato), har sahifada so'rovlarning yarmi takrorlanishi,
xato holatining loyihalanmagani.

### B1 — vizual til (tugadi)

**Nima o'zgardi.** `themes.json` butunlay qayta yozildi: 17 tekis token
o'rniga 46 ta guruhlangan token × 2 tema. To'rt sirt darajasi, semantik va
ma'no ranglari, yangi brend rangi. `_variables.scss` da bo'shliq, radius va
tipografika shkalalari paydo bo'ldi. `/design` ko'rgazmadan **sinov
maydoniga** aylandi: har bir juftlik yonida brauzerda hisoblangan kontrast
turadi.

**Nega.** AUDIT.md ning 5.1-bo'limi: 550 ta kontrast xatosining hammasi 6
ta qiymatdan kelib chiqardi. Eng arzon tuzatiladigan eng katta muammo.

**Natija (bir xil usul bilan qayta o'lchandi):**

| O'lcham                     | B0       | B1                  |
| --------------------------- | -------- | ------------------- |
| Kontrast xatolari, kunduzgi | 328      | **0**               |
| Kontrast xatolari, tungi    | 222      | **0**               |
| Token juftligi tekshiruvi   | yo'q edi | 111 ta, 0 xato      |
| Qo'lda yozilgan rang        | 11 joyda | 0 (lint taqiqlaydi) |

**Nima qilinmadi.** Komponentlar hali `--color-*` eski nomlarini
ishlatadi — ular yangi qiymatlarga ishora qiladi, ya'ni ranglar to'g'ri,
lekin nomlar eski. B2 ularni almashtiradi va eski nomlar o'chiriladi.
360px ekranda 23–25 joyda matn kesiladi (katalog qatori) — bu B3 ning
ishi. Shuningdek `Segmented` hali `role="tablist"` ishlatadi (B2).

### B2 — komponent qatlami (tugadi)

**Nima o'zgardi.**

_Tokenlar._ 32 SCSS fayl + `shared.module.scss` yangi guruhlangan nomlarga
ko'chdi. LEGACY aliaslar va v4 nomlari (`$border-radius-*`, `$font-large`,
`$font-title`) butunlay o'chirildi — eski nomni yozib qo'yib ketishning
imkoni qolmadi. `public/oflayn.html` palitrasi ham endi `themes.json` dan
generatsiya qilinadi (5 token, `THEME:BOSHLANDI`/`THEME:TUGADI` belgilari
orasida).

_Uch holat._ `components/ui/state.tsx` — `EmptyState`, `LoadingState`,
`ErrorState`. Eski `components/ui/empty-state.tsx` o'chirildi. `EmptyState`
da harakat tugmasi **majburiy** (`action: React.ReactNode`, ixtiyoriy
emas) — TypeScript endi tugmasiz bo'sh ekranni yozishga yo'l qo'ymaydi.
Auditda tugmasiz qolgan 7 ta ekranga chiqish yo'li qo'shildi:

| Ekran                 | Bo'sh holatdagi harakat            |
| --------------------- | ---------------------------------- |
| Qidiruv (natija yo'q) | Kanallarni ko'rish                 |
| Kanal ichi            | Filtr faol bo'lsa — "Hammasi",     |
|                       | bo'lmasa — katalog                 |
| Kanallar ro'yxati     | Kanallarni ko'rish                 |
| Xabarlar              | Ishlar                             |
| Arizalarim            | Ishlar                             |
| Nomzodlar             | Vakansiyalarim                     |
| Ish qidiruvchilar     | Kasb filtrini tozalash ("Hammasi") |

_Skelet._ `ListSkeleton` ga `shape` qo'shildi: `list` / `channel` /
`vacancy` / `card` / `text`. Har shaklning balandligi haqiqiy qator bilan
bir xil (vakansiya: 12+11+14+11px chiziq + 3×8px oraliq + 24px padding =
roppa-rosa 6rem), aks holda kontent kelganda ro'yxat sakraydi.

Skelet yo'q edigan ekranlar `loading.tsx` orqali tuzatildi — 14 ta yangi
fayl, hammasi `ScreenLoading` ni chaqiradi. Sabab: ekranlar serverda
render bo'ladi, ya'ni yuklanish holati mijozda emas, marshrutda. Chat
o'z paneli borligi uchun alohida (`ChatLoading`).

_Haptik._ `lib/haptics.ts` — uchta daraja (`select` / `confirm` /
`reject`), `prefers-reduced-motion` hurmat qilinadi. `Chip`, `Switch`,
`Segmented` ichida (chaqiruv joyida yozilsa unutiladi), qolganlari
ma'nosiga qarab: ariza yuborish va nomzodni chaqirish — `confirm`, rad
etish — `reject`, obuna/saqlash/xabar — `select`.

_Bosish javobi._ `styles/_mixins.scss` — `tap-fill` va `tap-scale`. Ilgari
15 faylda 15 nusxa bor edi va uchtasida `prefers-reduced-motion` himoyasi
umuman yozilmagan. **Ikki yo'ldan biri tanlandi:** (a) SCSS miksin, (b)
global utilita klassi TSX da. Miksin tanlandi — qaror CSS da qoladi,
markupga klass qo'shilmaydi va har komponent o'z bosilgan rangini
saqlaydi.

_Klaviatura._ `Segmented` `role="tablist"` dan `radiogroup`/`radio` ga
o'tdi (tab varaqlar orasida almashadi, radio bitta qiymatni tanlaydi);
strelkalar bilan yuriladi, guruhda bitta Tab to'xtash joyi.
`lib/use-focus-trap.ts` — sheet ichida Tab qamaladi, yopilganda fokus
ochgan tugmaga qaytadi. Yo'l-yo'lakay topilgan xato: sheet paneli
`ref={(node) => node?.focus()}` bilan **har renderda** o'ziga fokus
tortib olardi, ya'ni sheet ichidagi maydonga yozish uzilardi.

**Natija (brauzerda, production build, 360px, ikki tema):**

| Mezon                         | B1        | B2                    |
| ----------------------------- | --------- | --------------------- |
| `role="tablist"` noto'g'ri    | 4 joyda   | **0** (4 radiogroup)  |
| Sheet ochilganda fokus ichida | yo'q      | **ha**                |
| Tab tuzoqdan chiqib ketishi   | ketardi   | **12 bosishda 0**     |
| Esc bilan yopish              | ishlardi  | ishlaydi              |
| Yopilganda fokus tiklanishi   | yo'q      | **ha**                |
| Fokus halqasi yo'q element    | ?         | **0** (4 ekran, 40×4) |
| Harakat tugmasi yo'q bo'sh h. | 7         | **0** (tur majburlab) |
| Skeleti yo'q ro'yxat ekrani   | 10        | **0**                 |
| `:active` nusxalari           | 15 faylda | 1 miksin              |

**Nima qilinmadi.** 360px da matn kesilishi (katalog qatori) hali bor —
B3. First Load JS budjeti hali buzilgan (134–146 kB brotli) — uchta til
bitta bo'lakda. Xato holati faqat qidiruv va kanal ichida ulangan;
qolgan ekranlar serverda render bo'ladi, ular B4 dagi yagona xato
konvertidan keyin ulanadi.

## 8. Keyingi bosqich uchun yo'nalishlar

Buyruq yozayotganda shulardan tanlashingiz mumkin. Har biri mustaqil.

**Dizayn va his-tuyg'u**

- Bo'sh, yuklanish va xato holatlarini bitta tizimga keltirish.
- Mikro-animatsiyalar: ariza yuborilganda, kanalga obuna bo'lganda.
- Vakansiya sheetini qayta ko'rib chiqish — hozir uzun, aylantirish kerak.
- Kanal ichidagi chip qatorini takomillashtirish (hozir 6 ta chip).

**Mahsulot**

- Qidiruvga filtr qo'shish (maosh, hudud, ish turi).
- Nomzod uchun tavsiya: «sizga o'xshaganlar shu ishga ariza berdi».
- Ish beruvchi uchun shablon — bir xil vakansiyani qayta joylash.
- Shikoyat va moderatsiya.

**Texnik**

- Playwright testlarini doimiy to'plamga aylantirish.
- Xato holatlarini butun API bo'ylab bir xillashtirish.
- Rasm yuklash (avatar, kompaniya logotipi) — hozir faqat harf va rang.
- `vercel.json` va cron — bildirishnomani onlayn ishlatish uchun.

**Biznes**

- Payme/Click integratsiyasi.
- Ish beruvchi uchun statistika paneli.
- Referal: nomzod do'stini taklif qilsa nima bo'ladi.

---

## 9. Muhim fayllar

| Fayl                        | Nima uchun                                        |
| --------------------------- | ------------------------------------------------- |
| `styles/themes.json`        | Ranglarning yagona manbai                         |
| `styles/_variables.scss`    | O'lchamlar va animatsiya egri chiziqlari          |
| `styles/shared.module.scss` | Takrorlanadigan uslub bo'laklari                  |
| `lib/db/types.ts`           | Barcha DTO va sanoqli turlar                      |
| `lib/db/channels.ts`        | Kanal so'rovlari                                  |
| `lib/navigation.ts`         | Ekran o'tishlari va scroll tiklash                |
| `lib/i18n/locales/uz.ts`    | Barcha matnlar (uz-cyrl va ru ham shu tuzilishda) |
| `db/migrations/`            | Sxema tarixi                                      |
| `scripts/setup.mjs`         | Bitta buyruq bilan ishga tushirish                |
| `app/design/page.tsx`       | Dizayn tizimi ko'rgazmasi                         |

---

## 10. Ish uslubi

Loyiha shu qoidalar bilan yozilgan — davom ettirishda ham foydali:

1. **Sabab kodda yoziladi.** Izoh nima qilinayotganini emas, **nega**
   shunday qilinganini tushuntiradi.
2. **Yagona manba.** Rang `themes.json` da, o'lcham `_variables.scss` da,
   matn `i18n` da. Ikkinchi nusxa paydo bo'lsa — xato.
3. **Brauzerda tekshiriladi.** Har bosqich haqiqiy brauzerda, production
   build'da, ikkala temada sinaladi — ko'rib chiqish bilan cheklanmaydi.
4. **Kutubxona oxirgi chora.** Virtualizatsiya, JWT, ORM, zamon zonasi —
   hammasi kutubxonasiz qilindi. `web-push` yagona istisno, sababi kodda.
5. **Xato odam tiliga tarjima qilinadi.** Stack trace o'rniga sabab va
   yechim.
