-- v4, §1.5: push bildirishnomalar.
--
-- Qoida: har vakansiyaga alohida bildirishnoma YO'Q. Kanalga kuniga
-- bitta yig'ma xabar boradi ("Sotuvchi: 6 ta yangi ish"). Sabab —
-- Telegram kanallarida odam kuniga o'nlab xabar oladi va oxiri
-- kanalni ovozsiz qiladi. Kuniga bitta xabar o'qiladi, o'nta o'qilmaydi.
--
-- Ovozsiz qilish subscriptions.ovozsiz da allaqachon bor (0007) —
-- yig'ma xabarga ham xuddi shu bayroq ta'sir qiladi, ya'ni
-- foydalanuvchi uchun "ovozsiz" bitta ma'noni bildiradi.

-- ——— Qurilma obunasi ———
-- Bitta odamda bir nechta qurilma bo'lishi mumkin (telefon, kompyuter),
-- shuning uchun kalit endpoint: brauzer har qurilmaga boshqa manzil beradi.
create table if not exists push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references users (id) on delete cascade,
  -- Web Push shifrlash kalitlari, brauzer beradi
  p256dh text not null,
  auth text not null,
  yaratilgan timestamptz not null default now(),
  -- Oxirgi muvaffaqiyatli yuborish; xato bo'lsa yozuv o'chiriladi
  oxirgi_yuborilgan timestamptz
);

create index if not exists push_subscriptions_user_idx on push_subscriptions (user_id);

-- ——— Foydalanuvchi sozlamasi ———
-- Yig'ma xabar kuniga bir marta, shu soatda boradi (mahalliy vaqt,
-- O'zbekiston bo'ylab bitta zona — UTC+5).
alter table users add column if not exists digest_soati smallint not null default 9;
alter table users add constraint users_digest_soati_check
  check (digest_soati between 0 and 23);

-- Bir kunda ikki marta yubormaslik uchun — oxirgi yig'ma xabar sanasi
alter table users add column if not exists oxirgi_digest timestamptz;
