-- ============================================================================
-- Telegram autentifikatsiyasi uchun qo'shimcha ustunlar.
--
-- telegram_id 0001 da bor edi; bu yerda Telegram beradigan qolgan
-- ma'lumotlar qo'shiladi.
-- ============================================================================

alter table users add column if not exists username text;
alter table users add column if not exists foto_url text;
alter table users add column if not exists oxirgi_kirish timestamptz;

-- Telegram bo'yicha qidiruv tez bo'lishi uchun (telegram_id allaqachon unique)
create index if not exists users_username_idx on users(username);
