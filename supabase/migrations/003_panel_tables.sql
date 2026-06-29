-- Volkite · Faz 5 — Hoca paneli tabloları

-- ─── profiles (auth.users'a bağlı personel) ──────────────────────────────────
create table if not exists profiles (
  id     uuid primary key references auth.users(id) on delete cascade,
  name   text,
  role   text check (role in ('admin', 'instructor')) default 'instructor',
  active boolean default true
);
alter table profiles enable row level security;
create policy "own profile"       on profiles for select using (auth.uid() = id);
create policy "admin see all"     on profiles for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "admin write all"   on profiles for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ─── students ────────────────────────────────────────────────────────────────
create table if not exists students (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  contact             text,
  email               text,
  language            text,
  nationality         text,
  level               text,
  weight_kg           numeric,
  emergency_contact   text,
  assigned_instructor uuid references profiles(id),
  status              text default 'active' check (status in ('prospect','active','completed')),
  notes               text,
  created_at          timestamptz default now()
);
alter table students enable row level security;
create policy "staff read students"  on students for select using (auth.role() = 'authenticated');
create policy "staff write students" on students for all    using (auth.role() = 'authenticated');

-- ─── lesson_progress (5 derslik müfredat) ────────────────────────────────────
create table if not exists lesson_progress (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid references students(id) on delete cascade,
  lesson_no        int check (lesson_no between 1 and 5),
  title            text,
  status           text default 'pending' check (status in ('pending','done')),
  hours            numeric,
  wind_kn          numeric,
  instructor_notes text,
  instructor_id    uuid references profiles(id),
  completed_at     timestamptz
);
alter table lesson_progress enable row level security;
create policy "staff read lessons"  on lesson_progress for select using (auth.role() = 'authenticated');
create policy "staff write lessons" on lesson_progress for all    using (auth.role() = 'authenticated');

-- ─── payments ────────────────────────────────────────────────────────────────
create table if not exists payments (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  amount_eur numeric,
  type       text,    -- package|hourly|accommodation|rental|storage|media
  method     text default 'cash',
  paid       boolean default false,
  paid_at    timestamptz,
  notes      text
);
alter table payments enable row level security;
create policy "staff read payments"  on payments for select using (auth.role() = 'authenticated');
create policy "staff write payments" on payments for all    using (auth.role() = 'authenticated');

-- ─── accommodation ───────────────────────────────────────────────────────────
create table if not exists accommodation (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid references students(id) on delete cascade,
  kind             text,    -- tent|caravan
  breakfast        boolean,
  nights           int,
  price_eur        numeric,
  student_discount boolean default false,
  notes            text
);
alter table accommodation enable row level security;
create policy "staff read accom"  on accommodation for select using (auth.role() = 'authenticated');
create policy "staff write accom" on accommodation for all    using (auth.role() = 'authenticated');

-- ─── equipment ───────────────────────────────────────────────────────────────
create table if not exists equipment (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  kind       text,    -- rental|storage
  days       int,
  price_eur  numeric,
  notes      text
);
alter table equipment enable row level security;
create policy "staff read equip"  on equipment for select using (auth.role() = 'authenticated');
create policy "staff write equip" on equipment for all    using (auth.role() = 'authenticated');

-- ─── bookings.student_id FK (students tablosu artık var) ─────────────────────
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'fk_booking_student'
  ) then
    alter table bookings add constraint fk_booking_student
      foreign key (student_id) references students(id) on delete set null;
  end if;
end $$;
