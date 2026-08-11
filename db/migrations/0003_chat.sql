-- 6-bosqich: chat funksiyasi.

-- Ovozli xabar. Spetsifikatsiyada `messages.ovoz_url` bor, lekin fayl qayerda
-- turishi aytilmagan. S3 mos saqlagich hali ulanmagani uchun audio shu yerda,
-- bazada saqlanadi: 30 sekundlik opus ≈ 60 KB, bu hajm uchun bazasi yetarli.
-- Keyin S3 ga o'tilsa, faqat shu jadval va /api/audio yo'li almashadi —
-- `ovoz_url` allaqachon URL, qolgan kod o'zgarmaydi.
create table if not exists message_audio (
  id            uuid primary key default gen_random_uuid(),
  bayt          bytea not null,
  turi          text not null,
  davomiylik_ms integer not null,
  sana          timestamptz not null default now()
);

-- Ovozli xabar uzunligi — to'lqin o'rniga shuni ko'rsatamiz
alter table messages add column if not exists davomiylik_ms integer;

-- Ovozni faqat shu chat ishtirokchisi eshita olishi kerak. Bog'lanish
-- `ovoz_url` orqali topiladi, shuning uchun shu ustunga indeks.
create index if not exists messages_ovoz_idx on messages(ovoz_url) where ovoz_url is not null;

-- "Oqilmagan" sanog'i har bir chat ro'yxatida hisoblanadi
create index if not exists messages_oqilmagan_idx
  on messages(chat_id, kim_yubordi)
  where oqilgan = false;
