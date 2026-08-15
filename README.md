# Ish top — O'zbekiston uchun ish topish platformasi

Telegram uslubidagi ish topish platformasi. Asosiy raqib — hh.uz emas, Telegram
kanallari. Demak mahsulot Telegram kanalidan qulayroq bo'lishi kerak.

## Holat

Barcha ekranlar ishlaydi va bazaga ulangan. Hozirgi ish — v3
spetsifikatsiyasi: dizayn qatlamini SCSS modullariga ko'chirish,
animatsiya, unumdorlik va oflayn.

| Nima | Holat |
| --- | --- |
| Dizayn tizimi | ✅ tayyor |
| Ish qidiruvchi ekranlari | ✅ tayyor |
| Ish beruvchi ekranlari | ✅ tayyor |
| Baza va API | ✅ tayyor |
| Telegram autentifikatsiya | ✅ tayyor |
| Ishonch qatlami — moslik, javob ko'rsatkichi, ariza holati | ✅ tayyor |
| Chat — matn va ovoz | ✅ tayyor |
| v3 poydevori — themes.json, rem, Telegram egri chiziqlari | ✅ tayyor |
| v3 — UI kit SCSS modullarida | ✅ tayyor |
| v3 — ekran komponentlari SCSS ga, Tailwind olib tashlash | 🔨 ishda |
| v3 — universal `Transition`, virtualizatsiya, oflayn | ⏳ navbatda |
| To'lov integratsiyasi (Payme, Click) | ⏳ tashlab ketildi |

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

### Telegram botni ulash

Parol ham, elektron pochta ham yo'q — kirish faqat Telegram orqali.

1. [@BotFather](https://t.me/BotFather) da `/newbot` bilan bot yarating.
2. Olingan tokenni `.env.local` ga `TELEGRAM_BOT_TOKEN` qilib yozing,
   bot nomini (`@` siz) `TELEGRAM_BOT_USERNAME` ga.
3. @BotFather da `/setdomain` buyrug'i bilan saytingiz domenini bog'lang —
   Login Widget faqat shu domenda ishlaydi.
4. `SESSION_SECRET` ni `openssl rand -base64 32` bilan yarating. Ishlab
   chiqarishda majburiy; bo'lmasa ilova ishga tushmaydi.

Bot ulanmagan bo'lsa, kirish ekranida **namunaviy foydalanuvchi** tugmasi
chiqadi (`demo`) — u seed yaratgan nomzod va Chorsu Market kompaniyasining
egasi, ya'ni bitta kirish bilan ikkala tomonni ham ko'rish mumkin. Bu tugma
ishlab chiqish rejimida o'z-o'zidan ochiq. Ishlab chiqarish build'ida faqat
`ALLOW_DEV_LOGIN=1` bilan ataylab yoqiladi — demo uchun; haqiqiy
foydalanuvchilar bo'lgan joyda yoqmang. Token berilgan bo'lsa, bu tugma
umuman ko'rinmaydi va `/api/auth/dev` 403 qaytaradi.

Imzo tekshiruvi Telegram hujjatidagidek: `secret = SHA256(bot_token)`,
`hash = HMAC_SHA256(data_check_string, secret)`, taqqoslash
`timingSafeEqual` bilan. Havola 24 soatdan eski bo'lsa rad etiladi.
Sessiya — HMAC-SHA256 bilan imzolangan `httpOnly` cookie (30 kun), tashqi
kutubxonasiz.

### Ekranlar

| Manzil | Ekran |
| --- | --- |
| `/jobs` | Ishlar — kasb va Saqlangan filtri, cheksiz aylanish, saralash |
| `/search` | Qidiruv — bitta maydon va so'nggi qidiruvlar |
| `/messages` | Xabarlar — ish beruvchilar bilan chatlar |
| `/chat/[id]` | Chat — ariza shu yerda davom etadi |
| `/arizalarim` | Arizalarim — yuborilgan arizalar va holati |
| `/profile` | Profil — kartochka, til, ko'rinish |
| `/card` | Kartochkani tahrirlash — 5 maydon (5-si: ish turi) |
| `/employer/vacancies` | Mening vakansiyalarim — ko'rishlar va arizalar soni |
| `/employer/new` | Vakansiya joylash — 5 qadam, 90 sekund ichida |
| `/employer/candidates` | Nomzodlar — arizalar chat ro'yxati sifatida |
| `/employer/chat/[id]` | Nomzod bilan chat |
| `/employer/qidiruv` | "Ish qidiryapman" belgisini yoqqan nomzodlar |
| `/employer/plans` | Tariflar — Payme va Click (Profil orqali) |
| `/employer/profile` | Kompaniya profili |
| `/kirish` | Kirish — Telegram Login Widget |
| `/boshlash` | Tanishtiruv — rol, kasb, shahar yoki kompaniya, telefon |
| `/design` | Dizayn tizimi (1-bosqich) |

Rol Profil ekranidagi tugma orqali almashadi (ish qidiruvchi ↔ ish beruvchi).
Yangi rolda kartochka yoki kompaniya bo'lmasa, `/boshlash` ga yo'naltiriladi.

Kirmagan foydalanuvchi yopiq ekranga kirsa `/kirish` ga qaytariladi. Tekshiruv
`requireUser()` da — sahifa server komponentida, ya'ni ma'lumot umuman
olinmaydi.

### API

| Yo'l | Nima qiladi |
| --- | --- |
| `GET /api/vacancies` | Ro'yxat: `kasb`, `shahar`, `q`, `sort`, `cursor`, `lat`, `lng` |
| `GET /api/vacancies/[id]` | Bitta vakansiya, ko'rishlar soni oshadi |
| `POST /api/vacancies/[id]/apply` | Ariza + chat ochish |
| `POST /api/vacancies/[id]/save` | Saqlashni almashtirish |
| `GET /api/saved` · `GET /api/chats` · `GET /api/chats/[id]` | Nomzod ekranlari |
| `POST /api/vacancies/[id]/hide` | Chapga tortib yashirish |
| `GET/PUT /api/card` | Nomzod kartochkasi |
| `GET/POST /api/employer/vacancies` | Ish beruvchi vakansiyalari |
| `DELETE /api/employer/vacancies/[id]` | Vakansiyani o'chirish |
| `GET /api/employer/candidates` · `GET /api/employer/chats/[id]` | Nomzodlar |
| `POST /api/employer/applications/[id]` | Arizani rad etish yoki chaqirish |
| `POST /api/card/open-to-work` | "Ish qidiryapman" va ko'rinish darajasi |
| `GET /api/professions` · `GET /api/cities` | Ma'lumotnomalar |
| `GET /api/chats/[id]/messages` | Yangi xabarlar: `?since=<ISO>` |
| `POST /api/chats/[id]/messages` | Xabar yuborish (matn yoki ovoz) |
| `POST /api/chats/[id]/read` | Chat ochildi — qarshi tomon xabarlari o'qildi |
| `POST /api/audio` · `GET /api/audio/[id]` | Ovozli xabar |
| `GET /api/unread` | Tab bardagi o'qilmagan belgisi |
| `GET /api/auth/telegram` | Login Widget qaytaradigan manzil — imzo tekshiriladi |
| `POST /api/auth/dev` | Namunaviy kirish (bot ulanmagan bo'lsagina) |
| `POST /api/auth/logout` | Chiqish — cookie tozalanadi |
| `POST /api/auth/role` | Rolni almashtirish |
| `POST /api/onboarding` | Tanishtiruvni yakunlash — kartochka yoki kompaniya |

Sahifalar ma'lumotni to'g'ridan-to'g'ri server komponentlarida oladi; API
brauzerdan keladigan qo'shimcha so'rovlar uchun (cheksiz aylanish, qidiruv,
ariza yuborish, yozishuv).

### Ishonch qatlami

Loyihaning markaziy muammosi — ariza yuborgan odam javob kutib qoladi va hech
nima bilmaydi. Beshta funksiya shu noaniqlikni yo'q qiladi.

**"Ish qidiryapman"** — yoqilsa nomzod ish beruvchilar ro'yxatida ko'rinadi,
avatarda yashil halqa paydo bo'ladi. Ko'rinish darajasi majburiy: hozirgi
ishida ishlayotgan odam xo'jayini bilishidan qo'rqadi, shuning uchun "faqat
ish beruvchilarga" varianti bor va u standart.

**Moslik** — foiz emas, ro'yxat: kasb, hudud, tajriba, ish turi. Mos
kelmagani kulrang va ostida nomzodda nima borligi yozilgan. Foiz ishonchni
yo'qotadi, ro'yxat esa harakatga aylanadi.

**Javob ko'rsatkichi** — arizalarning necha foiziga javob berilgani, o'rtacha
javob vaqti va oxirgi faollik. Telegram kanalida bunday ma'lumot yo'q va
bo'lishi ham mumkin emas — bu strukturaviy ustunlik. Ko'rsatkich past bo'lsa
vakansiya ro'yxatda pastroq chiqadi: jazo emas, tartib.

Saralashga alohida mezon sifatida emas, sanani "eskirtirish" orqali
qo'shilgan — shunda kursor qiymati timestamp bo'lib qoladi va keyset
sahifalash o'zgarishsiz ishlaydi.

**Ariza holati** — to'rt bosqich vaqti bilan: Yuborildi → Ko'rildi → Ko'rib
chiqilmoqda → Javob berildi. 7 kun javob bo'lmasa turtki va shunga o'xshash
uchta vakansiya taklif qilinadi.

**Raqobat** — faqat raqam: "bu vakansiyaga 12 kishi ariza yuborgan".
Nomzodning o'rni ko'rsatilmaydi: uni tekshirib bo'lmaydi va noto'g'ri chiqsa
foydalanuvchi platformaga ishonmay qo'yadi.

### Ish beruvchi

Vakansiya joylash — 5 ta maydon: lavozim, maosh, hudud, ish vaqti, talablar.
Har qadamda bitta savol. Erkin matnli tavsif yo'q — talablar ro'yxatdan
tanlanadi (3 tagacha) va bazada kalit sifatida yotadi, matni tarjimadan
olinadi. Maosh o'rniga "kelishilgan holda" tanlansa ogohlantirish chiqadi:
bunday vakansiyalar 3 barobar kam ariza oladi.

Ovozli vakansiya olib tashlandi — v2 da u yo'q. Eski amalga oshirilishi
haqiqatda yozmasdi, tayyor matnni qo'yardi xolos.

Nomzodlar ro'yxatida arizani chapga tortsa rad etiladi, o'ngga tortsa
chaqiruvga o'tadi. Qaror darhol ko'rinadi, so'rov fonda ketadi.

### Chat

Xabar yozilgan zahoti ekranda paydo bo'ladi, serverga esa fonda ketadi
(optimistic UI). Yetkazilgani bitta belgi, o'qilgani ikkita belgi bilan
ko'rsatiladi. Yuborilmasa — xabar joyida qoladi va "Qayta urinish" chiqadi.

Yangi xabarlar 2,5 sekundlik so'rov bilan keladi, ro'yxatlar va tab bardagi
belgi — 5 sekundda. WebSocket ataylab olinmadi: PWA telefonda fon rejimiga
tez-tez tushadi, uzilgan ulanishni tiklash kodi qimmatga tushadi, chat trafigi
esa kichkina. Ekran ko'rinmay qolsa so'rov to'xtaydi, qaytganda darhol bir
marta so'raladi.

`GET /api/chats/[id]/messages` bitta yo'l — nomzod ham, ish beruvchi ham
shundan foydalanadi. Kim yozayotgani so'rovda emas, bazadagi bog'lanishda
aniqlanadi, ya'ni o'zini boshqa tomon qilib ko'rsatib bo'lmaydi.

**Ovozli xabar.** Mikrofonga bosiladi — yozuv boshlanadi, yana bosiladi —
yuboriladi (ushlab turish emas: tasodifan qo'yib yuborilsa xabar yo'qoladi).
Uzunlik chegarasi 60 sekund. Spetsifikatsiyada `messages.ovoz_url` bor, lekin
fayl qayerda turishi aytilmagan — S3 mos saqlagich hali ulanmagani uchun audio
`message_audio` jadvalida, bazada yotadi (30 sekundlik opus ≈ 60 KB). S3 ga
o'tilsa faqat shu jadval va `/api/audio` yo'li almashadi, `ovoz_url` allaqachon
URL bo'lgani uchun qolgan kod o'zgarmaydi. Ovozni faqat shu yozishuv
ishtirokchisi ola oladi — begonaga 401 qaytadi.

Til va ko'rinish Profil ekranidan, dizayn tizimi sahifasida esa yuqoridagi
tanlagichlardan almashtiriladi.

```bash
npm run build   # ishlab chiqarish uchun yig'ish
npm run lint    # eslint
npx tsc --noEmit
```

## Dizayn qoidalari

Ranglar kodga yozilmaydi — **`styles/themes.json`** yagona manba. Undan
`app/themes.generated.css` chiqadi (`npm run themes`, `predev` va
`prebuild` da o'z-o'zidan ishlaydi). O'lchamlar va animatsiya egri
chiziqlari — `styles/_variables.scss`.

- Bitta asosiy rang: yorug'da `#3390EC`, tungida `#8774E1`; qolgani kulrang
- Fon `#F4F4F5`, yuza oq; tungida fon `#181818`, yuza `#212121`
- Burchaklar: karta 15px, standart 12px, tugma 10px
- Tizim shrifti; sahifa sarlavhasi 34px, panel 17px semibold, ro'yxat
  elementi 17px (o'qilmagan — semibold), izoh 15px, meta 13px
- Hamma o'lcham `rem` da (ildiz 16px) — brauzer shrifti kattalashsa
  interfeys proporsional o'sadi, sindirmaydi
- Ro'yxat elementi 76px, avatar 48px, tab bar va asosiy tugma 50px
- Ajratuvchi 0,5px, avatar tugagan joydan (chapdan 76px) boshlanadi
- Ikonkalar 1,5px chiziqli; faqat faol tab to'ldirilgan variantga o'tadi
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
styles/
  themes.json           RANGLARNING YAGONA MANBAI (yorug' + tungi)
  _variables.scss       o'lchamlar va animatsiya egri chiziqlari
app/
  globals.css           tokenlar, ingichka chiziq, skeleton, tap
  themes.generated.css  themes.json dan chiqadi — qo'lda tahrirlanmaydi
  layout.tsx            providerlar, PWA meta, chaqnashsiz tungi rejim
  (app)/                tab bar bilan ekranlar: jobs, messages, saved, profile
  search/ chat/ card/   to'liq ekran (tab barsiz)
  design/               1-bosqich: dizayn tizimi bitta sahifada
  kirish/ boshlash/      kirish va tanishtiruv (5-bosqich)
components/
  providers/            theme-provider, i18n-provider
  app/                  app-tab-bar
  auth/                 login-screen, onboarding-flow
  chat/                 chat-list, chat-view, message-composer, voice-bubble
  jobs/                 vacancy-row, vacancy-sheet
  ui/                   button, list, sheet, chip, tab-bar, ...
lib/
  auth/                 session (imzolangan cookie), telegram (imzo tekshiruvi)
  db/                   client, queries, types, session
  i18n/locales/         uz.ts (manba), uz-cyrl.ts, ru.ts
  api.ts                brauzerdan API'ga so'rovlar
  client-store.ts       localStorage + useSyncExternalStore
  stores.ts             til/ko'rinish va so'nggi qidiruvlar
  use-sheet.ts          sheet holati brauzer tarixiga bog'lanadi
  use-chat.ts           yozishuv: optimistik yuborish, kuzatish, o'qildi
  use-polling.ts        ekran ko'rinib turganda so'rov, aks holda to'xtaydi
  use-recorder.ts       ovozli xabar yozish (MediaRecorder)
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

Foydalanuvchi imzolangan sessiya cookie'si orqali aniqlanadi
(`lib/auth/session.ts`). `users` jadvaliga `username`, `foto_url` va
`oxirgi_kirish` ustunlari qo'shildi (`0002_auth.sql`) — Telegram profilidan
keladigan ma'lumot. Takroriy kirish `on conflict (telegram_id) do update`
bilan yangilanadi, yangi qator yaratmaydi.

### Til

Standart til — o'zbek (lotin). Kirill va rus varianti ham bor. **Barcha matnlar
`lib/i18n/locales/` ichida**, kodga yozilmaydi. `lib/i18n/locales/uz.ts` — tuzilma
manbasi; boshqa fayllar `Dictionary` tipi orqali tekshiriladi, ya'ni yetishmayotgan
kalit kompilyatsiya xatosi beradi.

## Texnik stack

Next.js 16 (App Router) · TypeScript · SCSS modullari · PostgreSQL 16 ·
Telegram Login Widget · PWA (manifest)

Uslublar SCSS modullariga ko'chirilmoqda. `components/ui/` allaqachon
to'liq modullarda — har bir komponentning o'z `.module.scss` fayli bor.
Ekran komponentlari hali Tailwind'da; ular ko'chgach Tailwind butunlay
olib tashlanadi.

> SCSS modullari o'zgaruvchilarni **nisbiy yo'l** bilan chaqiradi
> (`@use "../../styles/variables" as *`) — Turbopack `loadPaths` ni
> qo'llamaydi, mutlaq yo'l 500 xatosi beradi.

Keyingi bosqichda: Payme va Click to'lovlari. Undan keyin S3 mos fayl saqlash.
