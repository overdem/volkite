-- Volkite · Faz 4 — Rüzgâr-duyarlı ön kayıt

-- ─── site_settings: daily slot kapasitesi ────────────────────────────────────
alter table site_settings add column if not exists daily_slots int default 4;
update site_settings set daily_slots = 4 where id = 1;

-- ─── wind_bands ───────────────────────────────────────────────────────────────
create table if not exists wind_bands (
  level        text primary key,
  min_kn       numeric not null,
  max_kn       numeric not null,
  max_gust_kn  numeric not null,
  ideal_kn     numeric not null,
  note_tr      text
);
alter table wind_bands enable row level security;
create policy "public read wind_bands" on wind_bands for select using (true);

-- Varsayılan değerler — Volkan panelden düzenleyebilir
insert into wind_bands (level, min_kn, max_kn, max_gust_kn, ideal_kn, note_tr) values
  ('beginner',     11, 18, 22, 14, 'Düzenli rüzgâr şart; hamle 22kn altı olmalı'),
  ('intermediate', 14, 24, 28, 18, 'Geniş bant; hamle 28kn altı'),
  ('advanced',     17, 32, 40, 24, 'Güçlü rüzgâr tolere; hamle 40kn altı')
on conflict (level) do nothing;

-- ─── bookings ─────────────────────────────────────────────────────────────────
create table if not exists bookings (
  id                   uuid primary key default gen_random_uuid(),
  student_id           uuid,              -- faz 5'te students tablosuna FK eklenecek
  name                 text not null,
  contact              text,
  language             text,
  level                text,
  package_id           uuid references packages(id),
  requested_start      date,
  requested_end        date,
  days_needed          int,
  proposed_dates       jsonb,             -- ajanın önerdiği günler
  wind_match           jsonb,             -- gün → {avg_kn, gust_kn, label}
  accommodation_needed boolean default false,
  status               text default 'provisional'
                         check (status in ('provisional', 'confirmed', 'cancelled')),
  source               text default 'agent'
                         check (source in ('agent', 'manual')),
  notes                text,
  created_at           timestamptz default now()
);
alter table bookings enable row level security;
-- Authenticated personel okur/yazar; ajan service_role key ile RLS'yi bypass eder
create policy "staff read bookings"  on bookings for select using (auth.role() = 'authenticated');
create policy "staff write bookings" on bookings for all    using (auth.role() = 'authenticated');
