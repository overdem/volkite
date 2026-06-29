-- Volkite · Faz 6 — Öğrenci portalı: student_media + RLS güncellemeleri

-- ─── student_media ────────────────────────────────────────────────────────────
create table if not exists student_media (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid references students(id) on delete cascade,
  type         text check (type in ('photo', 'video')),
  r2_key       text not null,           -- R2 orijinal (private)
  thumb_key    text,                    -- küçük önizleme
  preview_key  text,                    -- filigranlı önizleme
  downloadable boolean default false,  -- panelden nakit sonrası açılır
  assigned_by  uuid references profiles(id),
  created_at   timestamptz default now()
);
alter table student_media enable row level security;

-- ─── Öğrenci email → student_id yardımcı fonksiyon ──────────────────────────
create or replace function current_student_id()
returns uuid language sql stable security definer as $$
  select id from public.students where email = auth.email() limit 1;
$$;

-- ─── student_media RLS ───────────────────────────────────────────────────────
-- Personel (profiles üyesi) tüm medyayı okur/yazar
create policy "staff read media" on student_media
  for select using (
    exists (select 1 from profiles where id = auth.uid())
  );
create policy "staff write media" on student_media
  for all using (
    exists (select 1 from profiles where id = auth.uid())
  );
-- Öğrenci kendi medyasını görür (indirme API'sinden imzalı URL ile)
create policy "student view own media" on student_media
  for select using (student_id = current_student_id());

-- ─── lesson_progress: öğrenci kendi derslerini görür (salt okunur) ───────────
create policy "student view own lessons" on lesson_progress
  for select using (student_id = current_student_id());

-- ─── Mevcut personel RLS politikalarını sıkılaştır ──────────────────────────
-- (auth.role()='authenticated' öğrencileri de kapsıyordu)

-- lesson_progress
drop policy if exists "staff read lessons" on lesson_progress;
create policy "staff read lessons" on lesson_progress
  for select using (
    exists (select 1 from profiles where id = auth.uid())
  );
drop policy if exists "staff write lessons" on lesson_progress;
create policy "staff write lessons" on lesson_progress
  for all using (
    exists (select 1 from profiles where id = auth.uid())
  );

-- students
drop policy if exists "staff read students" on students;
create policy "staff read students" on students
  for select using (
    exists (select 1 from profiles where id = auth.uid())
  );
drop policy if exists "staff write students" on students;
create policy "staff write students" on students
  for all using (
    exists (select 1 from profiles where id = auth.uid())
  );

-- payments, accommodation, equipment — aynı şekilde sıkılaştır
drop policy if exists "staff read payments" on payments;
create policy "staff read payments" on payments
  for select using (exists (select 1 from profiles where id = auth.uid()));
drop policy if exists "staff write payments" on payments;
create policy "staff write payments" on payments
  for all using (exists (select 1 from profiles where id = auth.uid()));

drop policy if exists "staff read accom" on accommodation;
create policy "staff read accom" on accommodation
  for select using (exists (select 1 from profiles where id = auth.uid()));
drop policy if exists "staff write accom" on accommodation;
create policy "staff write accom" on accommodation
  for all using (exists (select 1 from profiles where id = auth.uid()));

drop policy if exists "staff read equip" on equipment;
create policy "staff read equip" on equipment
  for select using (exists (select 1 from profiles where id = auth.uid()));
drop policy if exists "staff write equip" on equipment;
create policy "staff write equip" on equipment
  for all using (exists (select 1 from profiles where id = auth.uid()));
