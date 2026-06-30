-- Volkite · Takvim modülü — sessions (planlanan/yapılan dersler)

-- ─── Helper fonksiyonlar (006'da da tanımlıdır; idempotent) ─────────────────
create or replace function is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and active = true
  );
$$;

create or replace function is_instructor()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'instructor' and active = true
  );
$$;

create or replace function current_student_id()
returns uuid language sql stable security definer as $$
  select id from public.students where email = auth.email() limit 1;
$$;

-- ─── sessions tablosu ──────────────────────────────────────────────────────
create table if not exists sessions (
  id                 uuid primary key default gen_random_uuid(),
  student_id         uuid references students(id) on delete cascade not null,
  instructor_id      uuid references profiles(id),
  scheduled_at       timestamptz not null,
  duration_hours     numeric default 1.5,
  status             text default 'planned' check (status in ('planned','done','cancelled')),
  completed_at       timestamptz,
  wind_kn            numeric,
  lesson_progress_id uuid references lesson_progress(id),
  note               text,
  created_at         timestamptz default now(),
  created_by         uuid references profiles(id)
);
create index if not exists idx_sessions_instructor_date on sessions(instructor_id, scheduled_at);
create index if not exists idx_sessions_student_date    on sessions(student_id, scheduled_at);
create index if not exists idx_sessions_status          on sessions(status);

alter table sessions enable row level security;

-- Admin: tüm session'ları yönetir
drop policy if exists "sessions: admin all" on sessions;
create policy "sessions: admin all" on sessions
  for all using (is_admin()) with check (is_admin());

-- Hoca: yalnızca kendi (instructor_id = kendisi) satırlarını yönetir
drop policy if exists "sessions: instructor own" on sessions;
create policy "sessions: instructor own" on sessions
  for all using (is_instructor() and instructor_id = auth.uid())
  with check (is_instructor() and instructor_id = auth.uid());

-- Öğrenci: kendi planlanan/yapılan derslerini salt okur
drop policy if exists "sessions: student read" on sessions;
create policy "sessions: student read" on sessions
  for select using (student_id = current_student_id());
