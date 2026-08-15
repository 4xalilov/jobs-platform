-- v2 3-bosqich: ish beruvchi tomoni.

-- Vakansiya talablari — 3 tagacha, tanlov orqali. Erkin matn emas, chunki
-- v2 da vakansiya formasi 5 ta maydondan iborat va tavsif ular ichida yo'q.
-- Kalitlar saqlanadi, matni tarjimadan olinadi — til almashsa ro'yxat ham
-- almashadi.
alter table vacancies add column if not exists talablar text[] not null default '{}';

-- Ariza ustida ish beruvchining qarori: chapga tortsa rad, o'ngga tortsa
-- chaqiruv. `holat` ustuni allaqachon bor, faqat vaqti yetishmasdi.
alter table applications add column if not exists qaror_sana timestamptz;
