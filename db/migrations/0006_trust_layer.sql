-- v2 6-bosqich: ishonch qatlami.

-- "Ish qidiryapman" — nomzod ariza yubormasa ham ish beruvchi uni topa oladi.
-- Ko'rinish darajasi majburiy: hozirgi ishida ishlayotgan odam ish
-- qidirayotganini xo'jayini bilishidan qo'rqadi.
alter table candidate_cards
  add column if not exists ish_qidiryapman boolean not null default false;

alter table candidate_cards
  add column if not exists korinish text not null default 'ish_beruvchilar'
  check (korinish in ('hamma', 'ish_beruvchilar'));

create index if not exists candidate_cards_qidiryapman_idx
  on candidate_cards(kasb_id, shahar_id)
  where ish_qidiryapman = true;

-- Javob ko'rsatkichi hisoblanadigan qiymat: birinchi javob vaqti.
-- Ariza yuborilgandan keyin ish beruvchi birinchi marta yozgan payt.
alter table applications add column if not exists birinchi_javob_sana timestamptz;

-- Mavjud ma'lumot uchun to'ldirib qo'yamiz
update applications a
   set birinchi_javob_sana = (
     select min(m.sana) from messages m
      join chats ch on ch.id = m.chat_id
     where ch.application_id = a.id and m.kim_yubordi = 'ish_beruvchi'
   )
 where a.birinchi_javob_sana is null;

-- Oxirgi faollik: ish beruvchi oxirgi marta qachon yozgan yoki qaror qilgan
alter table companies add column if not exists oxirgi_faollik timestamptz;

update companies c
   set oxirgi_faollik = greatest(
     (select max(m.sana) from messages m
        join chats ch on ch.id = m.chat_id
        join applications a on a.id = ch.application_id
        join vacancies v on v.id = a.vacancy_id
       where v.company_id = c.id and m.kim_yubordi = 'ish_beruvchi'),
     (select max(a.qaror_sana) from applications a
        join vacancies v on v.id = a.vacancy_id
       where v.company_id = c.id)
   )
 where c.oxirgi_faollik is null;
