# Ish top — O'zbekiston uchun ish topish platformasi

Telegram uslubidagi ish topish platformasi. Asosiy raqib — hh.uz emas, Telegram
kanallari. Demak mahsulot Telegram kanalidan qulayroq bo'lishi kerak.

## Holat

Barcha ekranlar ishlaydi va bazaga ulangan. v4 tugadi: vakansiyalar endi
kanallar ichida oqadi.

| Nima                                                       | Holat              |
| ---------------------------------------------------------- | ------------------ |
| Dizayn tizimi                                              | ✅ tayyor          |
| Ish qidiruvchi va ish beruvchi ekranlari                   | ✅ tayyor          |
| Baza, API, Telegram autentifikatsiya                       | ✅ tayyor          |
| Ishonch qatlami — moslik, javob ko'rsatkichi, ariza holati | ✅ tayyor          |
| Chat — matn va ovoz                                        | ✅ tayyor          |
| v3 — themes.json, rem, UI kit SCSS modullarida             | ✅ tayyor          |
| v4 — kanal modeli, 3.5rem panel, o'tishlar, tema           | ✅ tayyor          |
| Unumdorlik byudjeti va stylelint                           | ✅ tayyor          |
| Uch qatlamli kesh va oflayn                                | ✅ tayyor          |
| Butun ilova SCSS Modules'da — Tailwind olib tashlandi      | ✅ tayyor          |
| Bildirishnoma — kunlik yig'ma xabar                        | ✅ tayyor          |
| To'lov integratsiyasi (Payme, Click)                       | ⏳ tashlab ketildi |

## Ishga tushirish

### Ikki buyruq

Kerak: **Node 20.9+**. Ilova PostgreSQL'siz ishlamaydi — barcha ekranlar
bazadan o'qiydi; baza Docker orqali o'zi ko'tariladi.

```bash
npm run setup    # .env.local, paketlar, Postgres, jadvallar, namunaviy ma'lumot
npm run dev      # http://localhost:3000
```

`setup` besh qadamni bajaradi va har birini nomlab boradi. Yiqilsa
sababi va yechimi o'zbekcha chiqadi — Node ning stack trace i emas.
Qayta ishlatish xavfsiz: bori qayta yaratilmaydi.

| Qadam        | Nima qiladi                                                        |
| ------------ | ------------------------------------------------------------------ |
| Node         | 20.9 dan past bo'lsa to'xtaydi                                     |
| `.env.local` | yo'q bo'lsa `.env.example` dan yaratadi, `SESSION_SECRET` yozadi   |
| Paketlar     | `node_modules` bo'sh bo'lsa `npm install`                          |
| Baza         | port javob bersa tegmaydi, aks holda `docker compose up -d --wait` |
| Jadvallar    | migratsiya + namunaviy ma'lumot                                    |

Baza avval **ulanib ko'riladi**, keyingina Docker ga qo'l uriladi:
Postgres ni o'zi o'rnatgan odamga Docker umuman kerak emas.

`--wait` muhim: usiz `docker compose up -d` konteyner yaratilishi bilanoq
qaytadi, Postgres esa yana bir necha sekund ishga tushadi — shu orada
migratsiya ulanolmay xato berardi. Foydalanuvchi buni "umuman ishga
tushmadi" deb ko'rardi.

Ochilgach kirish ekranida **«Namunaviy foydalanuvchi»** tugmasi chiqadi.
U ham nomzod, ham Chorsu Market egasi — bitta kirish bilan ikkala tomonni
ham ko'rish mumkin.

### Ishga tushmasa

| Xato                                     | Sabab va yechim                                                                                                                                      |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Postgres ko'tarilmadi`                  | Docker Desktop ochiqmi? `docker ps` bilan tekshiring.                                                                                                |
| `Ports are not available: 5432`          | Kompyuterda boshqa Postgres ishlayapti. Uni to'xtating yoki `docker-compose.yml` da portni `5433:5432` qiling va `.env.local` ni ham shunga moslang. |
| `Foydalanuvchi nomi yoki paroli...`      | `.env.local` dagi `DATABASE_URL` `docker-compose.yml` bilan mos emas.                                                                                |
| `Bunday baza yo'q`                       | `docker compose down -v && npm run setup`                                                                                                            |
| `EBADENGINE` yoki `next` ishga tushmaydi | Node eskirgan. `node --version` → 20.9 dan katta bo'lsin.                                                                                            |

`db:migrate` va `db:seed` ulanish xatolarini ham o'zbekcha, yechimi bilan
chiqaradi — stack trace o'rniga nima qilish kerakligini yozadi.

Qadamlarni alohida ishlatish ham mumkin: `npm run db:migrate`,
`npm run db:seed`, yoki ikkalasi birga — `npm run db:setup`. Seed
jadvallarni tozalab, 23 ta kanal, 34 ta kompaniya, 180 ta vakansiya,
demo nomzod va uning chatlarini yozadi. Har kanalda kamida 6 ta
vakansiya bo'lishi kafolatlanadi — 5 tadan kam bo'lsa kanal katalogda
ko'rsatilmaydi. Generator turg'un urug'dan foydalanadi — har safar bir
xil ma'lumot chiqadi.

Boshqa bazaga ulanish uchun `.env.local` dagi `DATABASE_URL` ni o'zgartiring.

### Onlayn joylashtirish (telefonda sinash uchun)

Telefonda sinash uchun ikkita narsa kerak: baza va host. Ikkalasining ham
bepul rejasi yetadi.

**1. Baza — [Neon](https://neon.tech) yoki [Supabase](https://supabase.com).**
Yangi loyiha yarating va ulanish satrini oling. Keyin mahalliy kompyuterdan
migratsiya va namunaviy ma'lumotni yozing:

```bash
DATABASE_URL="postgres://...neon.tech/ishtop?sslmode=require" npm run db:setup
```

SSL o'z-o'zidan yoqiladi: manzil `localhost` bo'lmasa kod uni boshqaruvli
baza deb biladi. Kerak bo'lsa `DATABASE_SSL=on|off|no-verify` bilan bekor
qilinadi.

**2. Host — [Vercel](https://vercel.com).** Repozitoriyni import qiling va
uchta o'zgaruvchini qo'shing:

| O'zgaruvchi       | Qiymat                                                   |
| ----------------- | -------------------------------------------------------- |
| `DATABASE_URL`    | Neon/Supabase ulanish satri (iloji bo'lsa _pooled_)      |
| `SESSION_SECRET`  | `openssl rand -base64 32`                                |
| `ALLOW_DEV_LOGIN` | `1` — faqat demo uchun, namunaviy kirish tugmasi chiqadi |

Serverless muhitda pool `max: 1` ga tushadi (`lib/db/client.ts`) — har bir
instansiya o'z ulanishini ochgani uchun. Neon'da "pooled" satrni tanlang.

Telegram bot ulanmagunicha `ALLOW_DEV_LOGIN=1` qoldiring, aks holda kirish
ekranida hech qanday tugma bo'lmaydi. Haqiqiy foydalanuvchilar chiqqach
uni o'chiring.

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

| Manzil                 | Ekran                                                   |
| ---------------------- | ------------------------------------------------------- |
| `/jobs`                | Ishlar — obuna bo'lingan kanallar ro'yxati              |
| `/jobs/katalog`        | Kanallar katalogi — kasb guruhlari bo'yicha             |
| `/jobs/[kanal]`        | Kanal ichi — bandlik chiplari, cheksiz aylanish         |
| `/saved`               | Saqlangan vakansiyalar (Profil ichidan)                 |
| `/search`              | Qidiruv — bitta maydon va so'nggi qidiruvlar            |
| `/messages`            | Xabarlar — ish beruvchilar bilan chatlar                |
| `/chat/[id]`           | Chat — ariza shu yerda davom etadi                      |
| `/arizalarim`          | Arizalarim — yuborilgan arizalar va holati              |
| `/profile`             | Profil — kartochka, til, ko'rinish                      |
| `/card`                | Kartochkani tahrirlash — 5 maydon (5-si: ish turi)      |
| `/employer/vacancies`  | Mening vakansiyalarim — ko'rishlar va arizalar soni     |
| `/employer/new`        | Vakansiya joylash — 5 qadam, 90 sekund ichida           |
| `/employer/candidates` | Nomzodlar — arizalar chat ro'yxati sifatida             |
| `/employer/chat/[id]`  | Nomzod bilan chat                                       |
| `/employer/qidiruv`    | "Ish qidiryapman" belgisini yoqqan nomzodlar            |
| `/employer/plans`      | Tariflar — Payme va Click (Profil orqali)               |
| `/employer/profile`    | Kompaniya profili                                       |
| `/kirish`              | Kirish — Telegram Login Widget                          |
| `/boshlash`            | Tanishtiruv — rol, kasb, shahar yoki kompaniya, telefon |
| `/design`              | Dizayn tizimi (1-bosqich)                               |

Rol Profil ekranidagi tugma orqali almashadi (ish qidiruvchi ↔ ish beruvchi).
Yangi rolda kartochka yoki kompaniya bo'lmasa, `/boshlash` ga yo'naltiriladi.

Kirmagan foydalanuvchi yopiq ekranga kirsa `/kirish` ga qaytariladi. Tekshiruv
`requireUser()` da — sahifa server komponentida, ya'ni ma'lumot umuman
olinmaydi.

### API

| Yo'l                                                            | Nima qiladi                                                    |
| --------------------------------------------------------------- | -------------------------------------------------------------- |
| `GET /api/vacancies`                                            | Ro'yxat: `kasb`, `shahar`, `q`, `sort`, `cursor`, `lat`, `lng` |
| `GET /api/vacancies/[id]`                                       | Bitta vakansiya, ko'rishlar soni oshadi                        |
| `POST /api/vacancies/[id]/apply`                                | Ariza + chat ochish                                            |
| `POST /api/vacancies/[id]/save`                                 | Saqlashni almashtirish                                         |
| `GET /api/saved` · `GET /api/chats` · `GET /api/chats/[id]`     | Nomzod ekranlari                                               |
| `POST /api/vacancies/[id]/hide`                                 | Chapga tortib yashirish                                        |
| `GET/PUT /api/card`                                             | Nomzod kartochkasi                                             |
| `GET/POST /api/employer/vacancies`                              | Ish beruvchi vakansiyalari                                     |
| `DELETE /api/employer/vacancies/[id]`                           | Vakansiyani o'chirish                                          |
| `GET /api/employer/candidates` · `GET /api/employer/chats/[id]` | Nomzodlar                                                      |
| `POST /api/employer/applications/[id]`                          | Arizani rad etish yoki chaqirish                               |
| `POST /api/card/open-to-work`                                   | "Ish qidiryapman" va ko'rinish darajasi                        |
| `GET /api/professions` · `GET /api/cities`                      | Ma'lumotnomalar                                                |
| `GET /api/chats/[id]/messages`                                  | Yangi xabarlar: `?since=<ISO>`                                 |
| `POST /api/chats/[id]/messages`                                 | Xabar yuborish (matn yoki ovoz)                                |
| `POST /api/chats/[id]/read`                                     | Chat ochildi — qarshi tomon xabarlari o'qildi                  |
| `POST /api/audio` · `GET /api/audio/[id]`                       | Ovozli xabar                                                   |
| `GET /api/unread`                                               | Tab bardagi o'qilmagan belgisi                                 |
| `GET /api/auth/telegram`                                        | Login Widget qaytaradigan manzil — imzo tekshiriladi           |
| `POST /api/auth/dev`                                            | Namunaviy kirish (bot ulanmagan bo'lsagina)                    |
| `POST /api/auth/logout`                                         | Chiqish — cookie tozalanadi                                    |
| `POST /api/auth/role`                                           | Rolni almashtirish                                             |
| `POST /api/onboarding`                                          | Tanishtiruvni yakunlash — kartochka yoki kompaniya             |

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
npm run build     # ishlab chiqarish uchun yig'ish
npm run lint      # eslint
npm run lint:css  # stylelint — past unumdorlikli animatsiyalarni topadi
npx tsc --noEmit
```

### Unumdorlik

O'lchov 4 barobar sekinlashtirilgan protsessorda, 390×844 ekranda,
uch marta o'lchab medianasi olinadi.

| Ko'rsatkich      | Byudjet  | Hozir                          |
| ---------------- | -------- | ------------------------------ |
| DOMContentLoaded | < 1000ms | 128ms (Ishlar) · 303ms (kanal) |
| load             | < 2000ms | 528ms · 580ms                  |
| Tap javobi       | < 100ms  | 31ms                           |
| Scroll           | 60 FPS   | 60 FPS, 0 ta uzun kadr         |

**Virtualizatsiya kutubxonasi ataylab qo'shilmadi.** Eng katta kanalda
32 ta vakansiya (576 DOM tugun), sun'iy ravishda uch barobar
kattalashtirilganda ham 60 FPS saqlanadi. Uning o'rniga qatorlarga
`content-visibility: auto` qo'yilgan: ekrandan chiqqan qator render
qilinmaydi. O'lchov uning foydasini tasdiqladi — 102 qatorda u bilan
1 ta uzun kadr, usiz 4 ta.

`stylelint-high-performance-animation` `left`, `top`, `width`,
`height` kabi maketni qayta hisoblatadigan xossalar animatsiya
qilinishini taqiqlaydi; faqat `transform`, `opacity` va ranglar
ruxsat etilgan.

### Kesh va oflayn

Uch qatlam, har birining o'z vazifasi bor:

| Qatlam         | Nima saqlaydi                              | Qayerda                                    |
| -------------- | ------------------------------------------ | ------------------------------------------ |
| `localStorage` | Ko'rinish, til, kanal filtri, tab xotirasi | `lib/client-store.ts`, `lib/navigation.ts` |
| IndexedDB      | Kanallar va arizalar ro'yxati              | `lib/idb.ts`, `lib/use-cached.ts`          |
| Cache Storage  | HTML, JS, CSS, API javoblari               | `public/sw.js`                             |

Service worker uch xil strategiya ishlatadi: `/_next/static/*` uchun
cache-first (fayl nomida hash bor), sahifalar va `GET /api/*` uchun
network-first (yangi ma'lumot muhim, lekin tarmoq yo'q bo'lsa keshdan).
Yozuvchi so'rovlar umuman keshlanmaydi.

**IndexedDB nima uchun kerak, agar service worker sahifani baribir
keshlasa:** Cache Storage javoblarni manzil bo'yicha saqlaydi. Oflaynda
hech qachon ochilmagan tabga o'tilsa o'sha manzil keshda bo'lmaydi.
IndexedDB esa ma'lumotni manzildan ajratib saqlaydi.

Zaxira ekran — `public/oflayn.html`, oddiy HTML. Next sahifasi bo'lganda
u boshqa manzil o'rniga qaytarilib, o'z RSC ma'lumotini topolmay
gidratsiyada yiqilardi va foydalanuvchi "Nimadir noto'g'ri ketdi"
degan xatoni ko'rardi.

### Bildirishnomalar

Kuniga **bitta** yig'ma xabar keladi, har vakansiyaga alohida emas:
"57 ta yangi ish — Kunlik ishlar 32, Administrator 9, yana 2 ta kanal".
Sabab Telegram kanallaridan olingan: kuniga o'nlab xabar olgan odam
oxiri kanalni ovozsiz qiladi va keyin hech narsani ko'rmaydi. Kuniga
bitta xabar o'qiladi.

Kanalni ovozsiz qilish (Ishlar ro'yxatida, uzoq bosish) yig'ma xabarga
ham ta'sir qiladi — "ovozsiz" foydalanuvchi uchun bitta ma'noni
bildiradi.

Yoqish uchun VAPID kalitlari kerak:

```bash
npm run vapid          # kalit juftini chiqaradi
# natijani .env.local ga ko'chiring
```

Kalitlar berilmasa push jim o'chiq turadi va Profilda bo'lim umuman
ko'rinmaydi — ishlamaydigan tugma ko'rsatishdan ko'ra shunisi to'g'ri.

Yuborish `POST /api/push/digest` orqali. Yo'l `CRON_SECRET` bilan
himoyalangan; tashqi rejalashtiruvchi **har soat** chaqiradi, kimning
soati kelganini ichkarida o'zi hisoblaydi:

```
0 * * * *  curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" \
             https://sizning-domen/api/push/digest
```

Vercel'da `vercel.json` dagi `crons` ham shu ishni bajaradi. Ilova
ichida taymer yo'q: serverless muhitda jarayon so'rovlar orasida
yashamaydi, ya'ni `setInterval` hech qachon ishlamaydi.

Javob `{"ok":true,"users":3,"sent":4,"failed":0}` ko'rinishida.
`failed` ataylab alohida: yuborish uzilib qolsa natija "0 ta odam"
bo'lardi va bu "yuboradigan odam yo'q" dan farq qilmasdi.

Qurilma javob bermasa (404/410 — brauzer o'chirilgan yoki obuna
bekor qilingan) yozuv bazadan o'chadi. Chiqishda ham obuna bekor
qilinadi, aks holda telefon almashgan odamga eski xabarlar kelib
turardi.

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
