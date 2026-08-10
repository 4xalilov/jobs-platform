-- ============================================================================
-- Ish top — asosiy sxema
--
-- Jadval nomlari ingliz tilida, ustun nomlari o'zbekcha — spetsifikatsiyadagidek.
-- Apostrof SQL identifikatorlarida noqulay bo'lgani uchun ikkita ustun
-- transliteratsiya qilindi: ko'rishlar -> korishlar, o'qilgan -> oqilgan.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ——— Ma'lumotnomalar ———

-- Spetsifikatsiyada alohida jadval sifatida ko'rsatilmagan, lekin
-- vacancies.shahar_id va tuman_id shu yerga tayanadi.
create table if not exists cities (
  id           text primary key,
  nom_uz       text not null,
  nom_uz_cyrl  text not null,
  nom_ru       text not null,
  tartib       integer not null default 0
);

create table if not exists districts (
  id           text primary key,
  shahar_id    text not null references cities(id) on delete cascade,
  nom_uz       text not null,
  nom_uz_cyrl  text not null,
  nom_ru       text not null,
  tartib       integer not null default 0
);

create index if not exists districts_shahar_idx on districts(shahar_id);

-- nom_uz_cyrl spetsifikatsiyada yo'q — kirill varianti uchun qo'shildi
-- tartib: ro'yxatda ko'rsatish ketma-ketligi (eng ko'p uchraydigan kasb tepada)
create table if not exists professions (
  id           text primary key,
  nom_uz       text not null,
  nom_uz_cyrl  text not null,
  nom_ru       text not null,
  kategoriya   text not null,
  ikonka       text,
  tartib       integer not null default 0
);

-- ——— Foydalanuvchilar ———

create table if not exists users (
  id              uuid primary key default gen_random_uuid(),
  telegram_id     bigint unique,
  ism             text not null,
  rol             text not null check (rol in ('nomzod', 'ish_beruvchi')),
  til             text not null default 'uz' check (til in ('uz', 'uz-cyrl', 'ru')),
  yaratilgan_sana timestamptz not null default now()
);

create table if not exists candidate_cards (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id) on delete cascade,
  kasb_id        text references professions(id) on delete set null,
  shahar_id      text references cities(id) on delete set null,
  tuman_id       text references districts(id) on delete set null,
  tajriba_daraja text not null default 'none'
                 check (tajriba_daraja in ('none', 'upToOne', 'oneToThree', 'threePlus')),
  maosh_min      integer,
  maosh_max      integer,
  foto_url       text,
  video_url      text,
  ovoz_url       text,
  faol           boolean not null default true,
  constraint candidate_cards_user_uniq unique (user_id)
);

create table if not exists companies (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references users(id) on delete cascade,
  nom               text not null,
  logo_url          text,
  tavsif            text,
  telefon           text,
  tasdiqlangan      boolean not null default false,
  tez_javob_belgisi boolean not null default false
);

create index if not exists companies_user_idx on companies(user_id);

-- ——— Vakansiyalar ———

create table if not exists vacancies (
  id                    uuid primary key default gen_random_uuid(),
  company_id            uuid not null references companies(id) on delete cascade,
  lavozim               text not null,
  kasb_id               text references professions(id) on delete set null,
  shahar_id             text references cities(id) on delete set null,
  tuman_id              text references districts(id) on delete set null,
  maosh_min             integer,
  maosh_max             integer,
  tajriba_talab         text not null default 'none'
                        check (tajriba_talab in ('none', 'upToOne', 'oneToThree', 'threePlus')),
  tavsif                text,
  bandlik_turi          text not null default 'full'
                        check (bandlik_turi in ('full', 'part', 'shift', 'temporary')),
  tarif                 text not null default 'free'
                        check (tarif in ('free', 'standard', 'premium', 'pack')),
  holat                 text not null default 'faol'
                        check (holat in ('faol', 'tugagan', 'yopilgan')),
  korishlar             integer not null default 0,
  joylashtirilgan_sana  timestamptz not null default now(),
  tugash_sana           timestamptz not null default now() + interval '30 days',
  lat                   double precision,
  lng                   double precision,
  -- To'liq matnli qidiruv uchun; trigger to'ldiradi
  qidiruv               tsvector
);

create index if not exists vacancies_company_idx on vacancies(company_id);
create index if not exists vacancies_kasb_idx on vacancies(kasb_id);
create index if not exists vacancies_shahar_idx on vacancies(shahar_id);
-- Keyset sahifalash uchun: yangi vakansiyalar tepada
create index if not exists vacancies_feed_idx
  on vacancies(holat, joylashtirilgan_sana desc, id desc);
create index if not exists vacancies_qidiruv_idx on vacancies using gin(qidiruv);

-- ——— Arizalar va chat ———

create table if not exists applications (
  id                 uuid primary key default gen_random_uuid(),
  vacancy_id         uuid not null references vacancies(id) on delete cascade,
  candidate_card_id  uuid not null references candidate_cards(id) on delete cascade,
  holat              text not null default 'yangi'
                     check (holat in ('yangi', 'korildi', 'rad_etildi', 'qabul_qilindi')),
  yaratilgan_sana    timestamptz not null default now(),
  constraint applications_uniq unique (vacancy_id, candidate_card_id)
);

create index if not exists applications_vacancy_idx on applications(vacancy_id);
create index if not exists applications_card_idx on applications(candidate_card_id);

create table if not exists chats (
  id                 uuid primary key default gen_random_uuid(),
  application_id     uuid not null references applications(id) on delete cascade,
  oxirgi_xabar_sana  timestamptz not null default now(),
  constraint chats_application_uniq unique (application_id)
);

create index if not exists chats_oxirgi_idx on chats(oxirgi_xabar_sana desc);

create table if not exists messages (
  id          uuid primary key default gen_random_uuid(),
  chat_id     uuid not null references chats(id) on delete cascade,
  kim_yubordi text not null check (kim_yubordi in ('nomzod', 'ish_beruvchi', 'tizim')),
  matn        text,
  ovoz_url    text,
  oqilgan     boolean not null default false,
  sana        timestamptz not null default now()
);

create index if not exists messages_chat_idx on messages(chat_id, sana);

-- ——— To'lovlar ———

create table if not exists payments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  summa      integer not null,
  tarif      text not null check (tarif in ('standard', 'premium', 'pack', 'database')),
  provayder  text not null check (provayder in ('payme', 'click')),
  holat      text not null default 'kutilmoqda'
             check (holat in ('kutilmoqda', 'tolangan', 'bekor_qilingan')),
  sana       timestamptz not null default now()
);

create index if not exists payments_user_idx on payments(user_id);

-- ——— Saqlangan vakansiyalar ———
-- Spetsifikatsiyadagi jadvallar ro'yxatida yo'q, lekin "Saqlangan" ekrani
-- uchun kerak.

create table if not exists saved_vacancies (
  user_id    uuid not null references users(id) on delete cascade,
  vacancy_id uuid not null references vacancies(id) on delete cascade,
  sana       timestamptz not null default now(),
  primary key (user_id, vacancy_id)
);

create index if not exists saved_vacancies_user_idx on saved_vacancies(user_id, sana desc);

-- ============================================================================
-- To'liq matnli qidiruv
--
-- 'simple' konfiguratsiyasi tanlandi: PostgreSQL'da o'zbek tili uchun
-- stemmer yo'q, 'simple' esa uchala til uchun ham bir xil ishlaydi.
-- Qidiruv vektoriga lavozim, tavsif, kasb nomlari va kompaniya nomi kiradi.
-- ============================================================================

create or replace function vacancies_qidiruv_update() returns trigger as $$
declare
  kompaniya text;
  kasb text;
begin
  select nom into kompaniya from companies where id = new.company_id;
  select coalesce(nom_uz, '') || ' ' || coalesce(nom_uz_cyrl, '') || ' ' || coalesce(nom_ru, '')
    into kasb from professions where id = new.kasb_id;

  new.qidiruv :=
    setweight(to_tsvector('simple', coalesce(new.lavozim, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(kasb, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(kompaniya, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.tavsif, '')), 'C');
  return new;
end;
$$ language plpgsql;

drop trigger if exists vacancies_qidiruv_trigger on vacancies;
create trigger vacancies_qidiruv_trigger
  before insert or update of lavozim, tavsif, kasb_id, company_id on vacancies
  for each row execute function vacancies_qidiruv_update();

-- Kompaniya nomi o'zgarsa, uning vakansiyalari qayta indekslanadi
create or replace function companies_reindex_vacancies() returns trigger as $$
begin
  if new.nom is distinct from old.nom then
    update vacancies set lavozim = lavozim where company_id = new.id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists companies_reindex_trigger on companies;
create trigger companies_reindex_trigger
  after update of nom on companies
  for each row execute function companies_reindex_vacancies();

-- ============================================================================
-- Masofa — oddiy haversine (spetsifikatsiya PostGIS'ni ham, buni ham ruxsat
-- beradi). PostGIS kerak bo'lsa, shu funksiyani ST_DistanceSphere bilan
-- almashtirish yetarli.
-- ============================================================================

create or replace function haversine_km(
  lat1 double precision, lng1 double precision,
  lat2 double precision, lng2 double precision
) returns double precision as $$
  select 6371 * 2 * asin(sqrt(
    power(sin(radians($3 - $1) / 2), 2) +
    cos(radians($1)) * cos(radians($3)) * power(sin(radians($4 - $2) / 2), 2)
  ));
$$ language sql immutable strict parallel safe;
