-- v2 2-bosqich: ish qidiruvchi ekranlari.

-- Kartochkaning 5-maydoni. v2 da kutilayotgan maosh o'rniga ish turi keldi.
-- Maosh ustunlari o'chirilmadi — bazadagi ma'lumot yo'qolmasin, ekranda
-- ko'rinmaydi xolos.
alter table candidate_cards
  add column if not exists bandlik_turi text not null default 'full'
  check (bandlik_turi in ('full', 'part', 'shift', 'temporary'));

-- Ro'yxat elementini chapga tortganda "Yashirish" chiqadi: shu vakansiya
-- boshqa oqimda ko'rinmaydi.
create table if not exists hidden_vacancies (
  user_id    uuid not null references users(id) on delete cascade,
  vacancy_id uuid not null references vacancies(id) on delete cascade,
  sana       timestamptz not null default now(),
  primary key (user_id, vacancy_id)
);

-- Ariza holati o'zgargan vaqt — "Arizalarim" ekranida har bosqich vaqti
-- bilan ko'rsatiladi (to'liq zanjir 6-bosqichda).
alter table applications add column if not exists korilgan_sana timestamptz;
alter table applications add column if not exists javob_sana timestamptz;

create index if not exists applications_card_sana_idx
  on applications(candidate_card_id, yaratilgan_sana desc);
