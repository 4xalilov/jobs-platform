# v5 / B0 — Audit

Kod o'zgartirilmadi. Bu hujjat faqat o'lchov natijasi.

Sana: 2026-08-16 · Tekshirilgan holat: `bc11d5e` (v4 tugagan)

**Usul.** Hamma raqam haqiqiy o'lchovdan, taxmin emas:

- Ekranlar — production build (`npm run build` + `npm start`), Chromium,
  390×844, ikkala tema, har safar toza kontekst (kesh o'lchovni buzmasin).
- JS hajmi — brauzer haqiqatan yuklagan fayllar ro'yxati, keyin o'sha
  fayllar diskda gzip va brotli bilan siqib o'lchandi.
- INP va aylantirish — CDP orqali 4× sekin protsessor va 4G (o'rta darajali
  Android sharoiti), `PerformanceObserver` bilan `event` va kadr oralig'i.
- SQL — Postgres `log_min_duration_statement = 0` yoqilgan holda ilova
  brauzerdan aylanib chiqildi, jurnal tahlil qilindi. Ya'ni bu ilova
  haqiqatan yuborgan so'rovlar, qo'lda yozilgani emas.
- Miqyos — alohida `ishtop_audit` bazasi, 50 040 vakansiya (`ishtop` ga
  tegilmadi).
- Kontrast — WCAG 2.2 formulasi bilan, har bir matn tugunining hisoblangan
  rangi va haqiqiy foni bo'yicha; alohida `themes.json` tokenlari ham.

---

## 1. Qisqacha xulosa

| O'lcham                         | Maqsad (v5) | Hozir                        | Holat               |
| ------------------------------- | ----------- | ---------------------------- | ------------------- |
| First Load JS (brotli)          | < 120 kB    | 134–146 kB                   | ✗ 16/16 yo'l oshgan |
| First Load JS (siqilmagan)      | —           | 520–573 kB                   | ✗                   |
| LCP (mahalliy, sekinlatilmagan) | < 2000 ms   | 60–400 ms                    | ✓ shu sharoitda     |
| CLS                             | < 0.05      | 0                            | ✓                   |
| INP (4× sekin protsessor)       | < 200 ms    | eng yomon 168 ms             | ✓ chegaraga yaqin   |
| Aylantirish                     | 60 fps      | median 16.7 ms, p95 16.7 ms  | ✓                   |
| Kontrast AA                     | 0 xato      | 328 (kunduzgi) / 222 (tungi) | ✗                   |
| Bo'sh 500 qaytaradigan yo'l     | 0           | kamida 4 ta tasdiqlandi      | ✗                   |
| Skeletsiz ro'yxat ekrani        | 0           | 12 dan 10 tasi               | ✗                   |
| Harakat tugmasiz bo'sh holat    | 0           | 9 dan 7 tasi                 | ✗                   |
| Konsol xatolari                 | 0           | 0                            | ✓                   |

---

## 2. Unumdorlik

### 2.1 JS hajmi — byudjetdan 12–22% oshgan

| Yo'l                   | Siqilmagan | gzip  | brotli    |
| ---------------------- | ---------- | ----- | --------- |
| `/kirish`              | 519.7 kB   | 155.8 | **133.8** |
| `/card`                | 529.5 kB   | 158.3 | **136.1** |
| `/employer/new`        | 530.7 kB   | 158.3 | **136.0** |
| `/employer/plans`      | 538.2 kB   | 160.8 | **138.2** |
| `/messages`            | 545.3 kB   | 164.5 | **141.5** |
| `/jobs/katalog`        | 545.6 kB   | 164.5 | **141.5** |
| `/arizalarim`          | 547.5 kB   | 165.0 | **142.0** |
| `/employer/qidiruv`    | 550.2 kB   | 165.2 | **142.2** |
| `/jobs`                | 552.7 kB   | 166.5 | **143.3** |
| `/saved`               | 557.2 kB   | 167.6 | **144.3** |
| `/search`              | 557.6 kB   | 166.8 | **143.6** |
| `/employer/vacancies`  | 556.7 kB   | 167.3 | **144.0** |
| `/employer/profile`    | 558.2 kB   | 167.5 | **144.2** |
| `/employer/candidates` | 559.0 kB   | 167.7 | **144.4** |
| `/profile`             | 562.4 kB   | 169.4 | **145.9** |
| `/design`              | 573.2 kB   | 170.0 | **146.4** |

**Eng muhim kuzatuv: yo'llar orasidagi farq atigi 53 kB.** Eng yengil va eng
og'ir yo'l deyarli bir xil. Demak kod bo'linishi ishlamayapti — deyarli
hamma narsa umumiy to'plamda va har bir foydalanuvchi butun ilovani yuklab
oladi.

Aniq sabablar:

1. **Uchala til bitta bo'lakda.** `3qzk5twad45_1.js` — 56 kB siqilmagan,
   18.1 kB gzip. Ichida `uz`, `uz-cyrl` va `ru` lug'atlari birga
   (`Namunaviy foydalanuvchi`, `Намунавий фойдаланувчи`, `Сообщения`
   uchalasi ham shu faylda). Manba fayllar: uz 18 kB, uz-cyrl 24 kB,
   ru 25 kB. Ya'ni **har bir foydalanuvchi o'zi o'qimaydigan ikkita tilni
   yuklab oladi** — taxminan 12 kB gzip behuda.
2. Eng katta uchta bo'lak: 224 kB, 160 kB, 112 kB (siqilmagan) — React,
   Next router va umumiy mijoz kodi. Ular bo'linmagan.
3. `/design` — faqat ishlab chiquvchiga kerak bo'lgan sahifa, lekin u ham
   umumiy to'plamga hissa qo'shadi va production'da ochiq.

### 2.2 Ko'rsatkichlar

Mahalliy, sekinlatilmagan o'lchov (haqiqiy 4G telefonda bulardan yomonroq
bo'ladi — bu raqamlar «yaxshi holatda ham» degani):

- LCP: 60–400 ms, median 88 ms. Eng yomon `/profile` (400 ms kunduzgi,
  216 ms tungi) — u eng ko'p so'rov yuboradigan ekran (pastga qarang).
- CLS: barcha 32 o'lchovda **0**. Bu kuchli tomon.
- Konsol xatolari: **0**.

### 2.3 O'zaro ta'sir (4× sekin protsessor, 4G)

| Harakat                   | Eng yomon hodisa | Ko'zga ko'ringan vaqt |
| ------------------------- | ---------------- | --------------------- |
| Kanalni ochish            | 64 ms            | 575 ms                |
| Vakansiya sheetini ochish | 48 ms            | **2129 ms**           |
| Tab almashtirish          | **168 ms**       | 739 ms                |
| Qidiruvda yozish          | 64 ms            | 1304 ms               |

INP formal chegaradan (200 ms) o'tadi, lekin tab almashtirish 168 ms —
chegaraga juda yaqin. Vakansiya sheetigacha 2.1 sekund: bu bosish
kechikishi emas, ketma-ket navigatsiya va ma'lumot kutish.

**Aylantirish: median 16.7 ms, p95 16.7 ms, eng yomon 16.8 ms** — mukammal
60 fps. `content-visibility` qarori tasdiqlandi, virtualizatsiya kerak emas.

---

## 3. Baza

### 3.1 Hozirgi hajmda (180 vakansiya) — tez

Eng og'ir so'rov 3.8 ms. Muammo yo'q.

### 3.2 Takroriy so'rov — eng katta samarasizlik

Bitta sahifa yuklanishida yuborilgan so'rovlar (jurnaldan sanaldi):

| Ekran         | Jami so'rov | Shundan bir xil `auth` so'rovi |
| ------------- | ----------- | ------------------------------ |
| `/jobs`       | 12          | **6**                          |
| `/messages`   | 12          | **6**                          |
| `/arizalarim` | 15          | **6**                          |
| `/profile`    | **29**      | **9**                          |

Har ekranda so'rovlarning **yarmi** — aynan bir xil foydalanuvchi qidiruvi
(`select u.id, u.ism, u.rol ... from users u where u.id = $1`). Sabab:
`currentUser()` layout'da, sahifada va har bir ma'lumot funksiyasida
qaytadan chaqiriladi, so'rov esa bir marta ham eslab qolinmaydi.

`/profile` 29 ta so'rov bilan eng og'iri — LCP ning ham eng yomoni
o'sha yerda ekani tasodif emas.

### 3.3 Miqyos — `channel_vacancies` 50 000 da yiqiladi

Alohida bazada 50 040 vakansiya bilan o'lchandi (ko'rinishda 58 936 qator):

| So'rov             | 180 vakansiya | 50 040     | Indeks qo'shilgach |
| ------------------ | ------------- | ---------- | ------------------ |
| Ishlar ro'yxati    | 0.7 ms        | **195 ms** | 52 ms              |
| Kanallar katalogi  | 1.1 ms        | **713 ms** | 244 ms             |
| Kanal ichi (20 ta) | 0.2 ms        | 28 ms      | 7.7 ms             |
| Bandlik chiplari   | —             | 28 ms      | —                  |

`EXPLAIN` da `Seq Scan on vacancies` — ko'rinish har chaqiruvda butun
jadvalni skanerlaydi, chunki `channel_vacancies` ning `where` sharti
(`kasb_id = ...` yoki `bandlik_turi = ...`) uchun mos indeks yo'q.

Sinov uchun ikkita qisman indeks qo'shib ko'rildi:

```sql
create index on vacancies (kasb_id, joylashtirilgan_sana desc) where holat='faol';
create index on vacancies (bandlik_turi, joylashtirilgan_sana desc) where holat='faol';
```

Natija: katalog 713 → 244 ms, ishlar ro'yxati 195 → 52 ms, kanal ichi
28 → 7.7 ms. **Yaxshilandi, lekin katalog hali ham sekin** — chunki u har
bir kanal uchun `count(*)` hisoblaydi (bitta kanal uchun 2224 qator,
3.5 ms × 23 kanal). Bu son kesh yoki hisoblab qo'yilgan ustun bo'lishi
kerak.

Xulosa: ko'rinishning o'zi noto'g'ri emas, lekin **hozirgi holida 50 000
vakansiyaga chidamaydi**. Uch yo'l bor: qisman indekslar (eng arzon),
kanal bo'yicha sonlarni hisoblab saqlash, yoki materiallashgan ko'rinish.

### 3.4 Kuchli tomon: CHECK cheklovlari

Sanoqli qiymatlar bazada himoyalangan (`korinish`, `bandlik_turi`,
`tajriba_daraja`, `digest_soati`). Ilova qatlami o'tkazib yuborsa ham baza
noto'g'ri qiymatni qabul qilmaydi.

---

## 4. API

### 4.1 Xato ishlovi deyarli yo'q

38 ta yo'ldan **37 tasida `try/catch` yo'q**. Yagona istisno —
`/api/auth/dev` (v4 oxirida tuzatilgan).

Noto'g'ri ma'lumot bilan sinab ko'rildi — **bo'sh 500 qaytargan yo'llar**:

| Yo'l                                            | Kirish                     | Natija            |
| ----------------------------------------------- | -------------------------- | ----------------- |
| `POST /api/channels/yoq-bunday-kanal/subscribe` | mavjud bo'lmagan kanal     | `500`, tana bo'sh |
| `POST /api/vacancies/<mavjud-emas-uuid>/apply`  | mavjud bo'lmagan vakansiya | `500`, tana bo'sh |
| `POST /api/vacancies/mana-bu-uuid-emas/apply`   | buzuq UUID                 | `500`, tana bo'sh |
| `POST /api/chats/mana-bu-uuid-emas/messages`    | buzuq UUID                 | `500`, tana bo'sh |

Bo'sh 500 — foydalanuvchi uchun ham, ishlab chiquvchi uchun ham hech narsa
aytmaydigan javob. Bular faqat sinalgan to'rttasi; `try/catch` yo'qligini
hisobga olsak, baza uzilishida **hamma yo'l** shunday bo'ladi.

### 4.2 Kirish tekshiruvi — bor, lekin tartibsiz

Yaxshi ishlaydiganlar (to'g'ri 400 va o'zbekcha xabar):
`/api/onboarding`, `/api/card`, `/api/auth/role`, `/api/employer/vacancies`.

Muammolilar:

- `POST /api/card/open-to-work` — `{openToWork: "ha"}` yuborilsa `200`
  qaytaradi va bayroqni **yoqadi**, chunki `Boolean("ha")` rost. Noto'g'ri
  tur rad etilmaydi, jimgina o'zgartiriladi. Bazaga noto'g'ri qiymat
  yozilmaydi (CHECK himoya qiladi), lekin foydalanuvchi so'ramagan
  o'zgarish sodir bo'ladi.
- `GET /api/vacancies?limit=abc` — `200` va 12 ta element. `limit=999999`
  esa 50 taga cheklanadi (bu to'g'ri). Ya'ni chegara bor, lekin buzuq
  qiymat aniqlanmaydi.
- 38 yo'ldan atigi 3 tasida tur tekshiruvi bor.

### 4.3 Takrorlanish

`currentUserId()` + `401` naqshi **24 ta yo'lda** so'zma-so'z takrorlanadi.
Ruxsat tekshiruvi har bir yo'lda qo'lda yozilgan — bitta joyda unutilsa,
uni hech narsa ushlamaydi.

---

## 5. Kirish imkoniyati (a11y)

### 5.1 Kontrast — eng katta muammo

Butun ekran bo'ylab: **kunduzgi rejimda 328 ta xato, tungi rejimda 222 ta**
(16 ekran, har bir matn tuguni tekshirildi).

Ildiz sabab — palitraning o'zi. `themes.json` tokenlari:

**Kunduzgi rejim:**

| Juftlik                                      | Nisbat   | Kerak | Holat     |
| -------------------------------------------- | -------- | ----- | --------- |
| `text` / `background`                        | 21.00    | 4.5   | ✓         |
| `text-secondary` / `background`              | 4.66     | 4.5   | ✓ (arang) |
| `text-secondary` / `background-secondary`    | 4.24     | 4.5   | ✗         |
| **`text-tertiary` / `background`**           | **2.31** | 4.5   | ✗✗        |
| **`text-tertiary` / `background-secondary`** | **2.10** | 4.5   | ✗✗        |
| `primary` / `background`                     | 3.31     | 4.5   | ✗         |
| **`green` / `background`**                   | **2.56** | 4.5   | ✗✗        |
| **`warning` / `background`**                 | **2.03** | 4.5   | ✗✗        |
| `error` / `background`                       | 4.23     | 4.5   | ✗         |

**Tungi rejim** ancha yaxshi, lekin `text-tertiary` (3.91), `primary` (4.31)
va `error` (3.81) hali ham o'tmaydi.

**Avatar bosh harflari — hammasi yiqilgan.** Oq matn 7 ta peer rang ustida:

| Rang      | Nisbat   |
| --------- | -------- |
| `#6EC9CB` | **1.93** |
| `#EDA86C` | **2.02** |
| `#7BC862` | **2.04** |
| `#65AADD` | 2.52     |
| `#A695E7` | 2.60     |
| `#EE7AAE` | 2.62     |
| `#E17076` | 3.10     |

Eng ko'p uchraydigan xatolar (takrorlanish soni bo'yicha):

| Marta | Nisbat | Nima                                  |
| ----- | ------ | ------------------------------------- |
| 81    | 2.31   | Kanal qatoridagi vaqt («23 soat»)     |
| 36    | 4.24   | Katalog guruh sarlavhasi («SAVDO»)    |
| 35    | 2.31   | Ariza zanjiri belgilari («Yuborildi») |
| 30    | 4.13   | Chip matni                            |
| 19    | 3.31   | «Obuna bo'lish» tugmasi               |
| 16    | 2.10   | Kirish ekranidagi izoh                |

Bu tasodifiy xato emas: palitra Telegram Web A dan ko'chirilgan, Telegram
esa bu rollarda AA ni ta'minlamaydi.

### 5.2 Semantika

`Segmented` komponenti (tema tanlash, tajriba darajasi) `role="tablist"` va
`role="tab"` ishlatadi. Bu noto'g'ri: bu yerda panel almashmaydi, bitta
qiymat tanlanadi — kerakli semantika `radiogroup` / `radio`. Bundan tashqari
`role="tab"` uchun `aria-controls` va `tabpanel` yo'q, ya'ni ARIA to'liq
emas; `tablist` talab qiladigan strelka bilan boshqarish ham qo'yilmagan.

Bu shunchaki nazariya emas: audit skripti standart `radio` roli bo'yicha
tema tugmasini topolmay 30 sekundda to'xtadi. Ekran o'quvchi ham xuddi
shunday chalg'iydi.

### 5.3 Fokus

Global `:focus-visible` halqasi bor — yaxshi. Lekin sheet ichida fokus
tuzog'i yo'q: sheet ochiq turganda `Tab` orqa fondagi elementlarga o'tib
ketadi, `Esc` bilan yopish ham yo'q.

---

## 6. Uch holat: bo'sh, yuklanish, xato

| Komponent               | Bo'sh holat | Skelet   | Mahalliy xato ishlovi |
| ----------------------- | ----------- | -------- | --------------------- |
| `channel-list`          | bor         | **yo'q** | yo'q                  |
| `channel-catalog`       | **yo'q**    | **yo'q** | yo'q                  |
| `channel-view`          | bor         | bor      | yo'q                  |
| `application-list`      | bor         | **yo'q** | yo'q                  |
| `chat-list`             | bor         | **yo'q** | yo'q                  |
| `saved-list`            | bor         | **yo'q** | yo'q                  |
| `search`                | bor         | bor      | yo'q                  |
| `profile-screen`        | **yo'q**    | **yo'q** | yo'q                  |
| `employer-vacancy-list` | bor         | **yo'q** | yo'q                  |
| `candidate-list`        | bor         | **yo'q** | yo'q                  |
| `open-candidate-list`   | bor         | **yo'q** | yo'q                  |
| `chat-view`             | **yo'q**    | **yo'q** | yo'q                  |

Raqamlar:

- `EmptyState` 9 joyda ishlatilgan, **shundan faqat 2 tasida harakat
  tugmasi bor**. Qolgan 7 tasi — boshi berk ko'cha.
- Skelet 12 ta ro'yxat ekranidan **2 tasida**.
- `loading.tsx` fayllari: **0 ta**. Ya'ni Suspense chegarasi yo'q,
  streaming ishlatilmayapti — sahifa qobig'i ham ma'lumot kelguncha kutadi.
- `error.tsx`: faqat ildizda 1 ta. Har bir ekran uchun alohida chegara yo'q,
  ya'ni bitta ro'yxatdagi xato butun ekranni yiqitadi.

---

## 7. Takrorlanayotgan kod

| Nima                               | Qayerda                                             | Hajm                        |
| ---------------------------------- | --------------------------------------------------- | --------------------------- |
| Til va tema sozlamalari bloki      | `profile-screen.tsx`, `employer-profile-screen.tsx` | 24 qator, **aynan bir xil** |
| Til tanlash sheeti                 | ikkala profil ekrani                                | ~18 qator                   |
| «Chiqish» tugmasi bloki            | ikkala profil ekrani                                | ~10 qator                   |
| `localeLabels` xaritasi            | 2 profil + `design/page.tsx`                        | 3 nusxa                     |
| `location()` yordamchisi           | `employer-vacancy-list`, `candidate-list`           | 2 nusxa                     |
| `currentUserId()` + 401            | 24 ta API yo'li                                     | har birida 2 qator          |
| `usePolling(refresh, 5000)` naqshi | `chat-list`, `candidate-list`                       | 2 nusxa                     |

---

## 8. Vizual kuzatuvlar

Skrinshotlar: `scratchpad/audit/shots/` (32 ta — 16 ekran × 2 tema).

- **Katalogda matn kesilib qolyapti.** «8 vakansiya · 401 obuna…» — obuna
  tugmasi joy egallagani uchun ikkinchi qator sig'maydi. 360px ekranda
  bundan ham yomon bo'ladi.
- **Guruh sarlavhalari yo'qolib ketgan.** Tungi rejimda «SAVDO»,
  «OVQATLANISH» fon bilan deyarli bir xil ohangda (kontrast 4.24) —
  ro'yxat bir tekis devorga aylangan.
- **Ierarxiya faqat qalinlik bilan.** Kanal nomi qalin, qolgani nozik.
  Sirt darajasi, chegara yoki yorug'lik farqi ishlatilmagan — v5
  buyrug'idagi «juda quruq» bahosi o'lchov bilan ham tasdiqlanadi.
- **Maosh ko'zga tashlanmaydi.** Vakansiya qatorida maosh yashil va 600
  qalinlikda, lekin lavozim bilan bir xil o'lchamda.
- **Obuna bo'lgan va bo'lmagan kanal** faqat tugma matni bilan farq qiladi;
  qator o'zi bir xil ko'rinadi.

---

## 9. Eng zaif uchta joy

### 1. Rang tizimi AA dan o'tmaydi — 550 ta xato, ildizi 6 ta token

Bu birinchi o'rinda, chunki u **bir vaqtning o'zida ham dizayn, ham
foydalanish muammosi**, va tuzatish nuqtasi juda kichik: `themes.json` dagi
olti token va 7 ta avatar rangi. Hozir kunduzgi rejimda `text-tertiary`
2.31, `warning` 2.03, `green` 2.56 — ya'ni vaqt belgilari, ariza holati va
ogohlantirishlar quyoshda deyarli ko'rinmaydi. Bizning auditoriya
ko'chada, quyosh ostida telefon ko'radi.

Nega eng zaif: 550 ta xatoning hammasi 6 ta qiymatdan kelib chiqadi.
Ya'ni bu eng arzon tuzatiladigan eng katta muammo.

### 2. Har sahifada so'rovlarning yarmi keraksiz

`/profile` 29 ta so'rov yuboradi, shundan 9 tasi aynan bir xil. `/jobs` 12
tadan 6 tasi. Bu hozir sezilmaydi (baza 3 ms da javob beradi), lekin:

- LCP ning eng yomoni aynan eng ko'p so'rov yuboradigan ekranda (400 ms);
- serverless muhitda pool `max: 1` — har bir ortiqcha so'rov navbatga
  turadi;
- 50 000 vakansiyada bitta so'rov 195–713 ms, ya'ni takrorlanish narxi
  millisekunddan sekundga o'sadi.

Nega eng zaif: bu **hozir ko'rinmaydigan**, lekin foydalanuvchi soni
o'sishi bilan birdan portlaydigan muammo. Va u me'moriy — har bir yangi
ekran uni takrorlaydi.

### 3. Xato holati umuman loyihalanmagan

37 ta yo'lda `try/catch` yo'q, 4 tasi tasdiqlangan holda bo'sh 500
qaytaradi, `loading.tsx` 0 ta, `error.tsx` 1 ta, 9 ta bo'sh holatdan 7
tasida chiqish yo'li yo'q.

Ya'ni ilova **faqat hamma narsa joyida bo'lgan holat uchun** yozilgan.
Beqaror mobil internetda esa «hamma narsa joyida» — bu istisno, qoida
emas. Foydalanuvchi tarmoq uzilganda oq ekran yoki jim qotgan tugma
ko'radi va sababini bilmaydi.

Nega eng zaif: bu ishonchni yo'qotadigan yagona narsa. Sekin ilova
kechiriladi, tushunarsiz ilova esa o'chiriladi.

---

## 10. Kuchli tomonlar

Buzmaslik kerak bo'lgan narsalar:

- **Aylantirish mukammal**: p95 16.7 ms. `content-visibility` qarori
  to'g'ri edi, virtualizatsiya kutubxonasi hali ham kerak emas.
- **CLS = 0** hamma 32 o'lchovda. Layout hech qayerda sakramaydi.
- **Konsol xatolari 0 ta.**
- **Baza CHECK cheklovlari** sanoqli qiymatlarni himoya qiladi.
- **Yagona manba qoidasi ishlayapti**: rang faqat `themes.json` da,
  o'lcham faqat `_variables.scss` da. Shu sababli 550 ta kontrast xatosini
  6 ta qiymat bilan tuzatish mumkin.
- **Ulanish xatolari o'zbekcha** — skriptlarda ham, kirish yo'lida ham.
  Bu naqshni butun API ga yoyish kerak, qaytadan o'ylash emas.

---

## 11. Tavsiya etilgan tartib

O'lchovga asoslangan holda B1–B6 tartibini shunday ko'raman:

1. **B1 (vizual til)** — kontrast tuzatilishi bilan 550 ta xatoning
   ko'pchiligi yo'qoladi. Eng katta natija, eng kam kod.
2. **B4 dan bir bo'lak B2 dan oldin**: so'rov takrorlanishini bartaraf
   qilish (`cache()` bilan) va xato konvertini kiritish. Ikkalasi ham
   keyingi bosqichlarga poydevor.
3. **B2 (komponentlar)** — uch holat tizimi.
4. **B3 (ekranlar)**, keyin qolgan **B4**, **B5**, **B6**.

Bitta ogohlantirish: `channel_vacancies` indekslari (3.3-bo'lim) arzon va
ta'siri katta — ularni B4 ni kutmasdan, B1 bilan birga qo'shsa ham bo'ladi.

---

## Ilova: o'lchov fayllari

Xom natijalar `scratchpad/audit/` da:

- `routes.json` — 32 o'lchov (16 ekran × 2 tema): JS, LCP, CLS, TTFB,
  kontrast xatolari, konsol xatolari.
- `js.json` — yo'l bo'yicha JS hajmi (xom / gzip / brotli).
- `inp.json` — o'zaro ta'sir va kadr o'lchovlari.
- `shots/` — 32 skrinshot.

Audit bazasi (`ishtop_audit`, 50 040 vakansiya) o'lchovdan keyin
o'chirildi; `ishtop` ga tegilmadi. Postgres jurnal sozlamasi ham asliga
qaytarildi.
