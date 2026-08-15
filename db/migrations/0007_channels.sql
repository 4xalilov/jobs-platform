-- v4, 1-bo'lim: kanal modeli.
--
-- Vakansiyalar endi bitta tekis ro'yxatda emas, kanallar ichida oqadi.
-- Kanal — asosan kasb (§1.3: "kanal = kasb, hudud kanal EMAS"), lekin
-- bitta istisno bor: "Kunlik ishlar" bandlik turi bo'yicha yig'iladi,
-- chunki O'zbekistonda bu segment katta va bironta platforma uni
-- qamramagan. Shuning uchun kanal alohida jadval — professions ustiga
-- ustun qo'shish bilan cheklanmaymiz.

-- ——— Yangi bandlik turlari ———
-- v4 chip qatori: Hammasi / To'liq kun / Kunlik / Online / Yarim kun / Smenali
alter table vacancies drop constraint vacancies_bandlik_turi_check;
alter table vacancies add constraint vacancies_bandlik_turi_check
  check (bandlik_turi in ('full', 'part', 'shift', 'temporary', 'daily', 'online'));

-- ——— "Shoshilinch" tegi (§4.2) ———
alter table vacancies add column if not exists shoshilinch boolean not null default false;

-- ——— Kanallar ———
create table if not exists channels (
  id text primary key,
  nom_uz text not null,
  nom_uz_cyrl text not null,
  nom_ru text not null,
  -- Katalog guruhi: savdo, ovqatlanish, logistika, qurilish, ...
  guruh text not null,
  -- Kasb kanali shu ustundan to'ladi
  kasb_id text references professions (id),
  -- Maxsus kanal (Kunlik ishlar) shu ustundan
  filtr_bandlik text,
  ikonka text,
  tartib integer not null default 0,
  -- FAQAT NAMUNAVIY MA'LUMOT UCHUN. Obunachi soni haqiqiy obunalardan
  -- hisoblanadi, lekin demo bazada bitta foydalanuvchi bor — "1 obunachi"
  -- ijtimoiy dalil bermaydi. Haqiqiy foydalanuvchilar paydo bo'lgach bu
  -- ustun 0 ga tushiriladi va o'chiriladi.
  bazaviy_obunachi integer not null default 0,
  constraint channels_manba check (kasb_id is not null or filtr_bandlik is not null)
);

create index if not exists channels_guruh_idx on channels (guruh, tartib);

-- ——— Obuna ———
-- oxirgi_korilgan: shu sanadan keyin qo'shilgan vakansiyalar "yangi" sanaladi
-- va ro'yxatdagi belgi (badge) shundan hisoblanadi.
create table if not exists subscriptions (
  user_id uuid not null references users (id) on delete cascade,
  channel_id text not null references channels (id) on delete cascade,
  obuna_sana timestamptz not null default now(),
  ovozsiz boolean not null default false,
  qadalgan boolean not null default false,
  oxirgi_korilgan timestamptz not null default now(),
  primary key (user_id, channel_id)
);

create index if not exists subscriptions_user_idx on subscriptions (user_id);

-- ——— Kanal ↔ vakansiya ———
-- Bog'lanish jadvalda saqlanmaydi, chunki u vakansiya maydonlaridan
-- kelib chiqadi: kasb kanali kasb_id bo'yicha, "Kunlik ishlar"
-- bandlik_turi bo'yicha. Ko'rinish ikkalasini bitta joyda beradi,
-- ya'ni bitta vakansiya ikkita kanalda ko'rinishi mumkin — bu ataylab.
create or replace view channel_vacancies as
select
  c.id as channel_id,
  v.id as vacancy_id,
  v.joylashtirilgan_sana
from channels c
join vacancies v
  on (c.kasb_id is not null and v.kasb_id = c.kasb_id)
  or (c.filtr_bandlik is not null and v.bandlik_turi = c.filtr_bandlik)
where v.holat = 'faol';
