-- Volkite · Öğrenci ek alanları: cinsiyet + doğum tarihi
-- (weight_kg zaten 003'te mevcut)

alter table students add column if not exists gender     text;
alter table students add column if not exists birth_date date;
