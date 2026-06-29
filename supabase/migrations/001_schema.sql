-- Volkite · Faz 2 şeması
-- Çalıştırma: Supabase SQL Editor veya `supabase db push`

-- ─── packages ─────────────────────────────────────────────────────────────────
create table if not exists packages (
  id       uuid primary key default gen_random_uuid(),
  slug     text unique not null,
  sort     int not null default 0,
  tag_tr   text, tag_en text, tag_bg text, tag_ro text,
  dur_tr   text, dur_en text, dur_bg text, dur_ro text,
  name_tr  text not null,
  name_en  text, name_bg text, name_ro text,
  desc_tr  text, desc_en text, desc_bg text, desc_ro text,
  rows_tr  jsonb,  -- [{label, price}]
  rows_en  jsonb,
  rows_bg  jsonb,
  rows_ro  jsonb,
  cta_tr   text default 'Rezervasyon',
  cta_en   text default 'Book',
  cta_bg   text default 'Резервация',
  cta_ro   text default 'Rezervare',
  active   boolean default true
);

-- ─── services ─────────────────────────────────────────────────────────────────
create table if not exists services (
  id      uuid primary key default gen_random_uuid(),
  slug    text unique not null,
  sort    int default 0,
  no      text,
  name_tr text not null, name_en text, name_bg text, name_ro text,
  desc_tr text, desc_en text, desc_bg text, desc_ro text,
  active  boolean default true
);

-- ─── faq ──────────────────────────────────────────────────────────────────────
create table if not exists faq (
  id     uuid primary key default gen_random_uuid(),
  sort   int default 0,
  q_tr   text not null, q_en text, q_bg text, q_ro text,
  a_tr   text not null, a_en text, a_bg text, a_ro text,
  active boolean default true
);

-- ─── site_settings ────────────────────────────────────────────────────────────
create table if not exists site_settings (
  id            int primary key default 1,
  phone         text default '+90 533 241 10 15',
  email         text default 'info@volkite.com',
  address_tr    text,
  address_en    text,
  instagram_url text default 'https://www.instagram.com/volkite/',
  facebook_url  text default 'https://www.facebook.com/volkite',
  whatsapp_url  text default 'https://wa.me/905332411015',
  wind_url      text default 'https://kiting.live',
  season_tr     text,
  season_en     text,
  windy_days    int default 300,
  spot_coords   text default '40°11′N 25°54′E'
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
alter table packages      enable row level security;
alter table services      enable row level security;
alter table faq           enable row level security;
alter table site_settings enable row level security;

create policy "public read packages"
  on packages for select using (active = true);

create policy "public read services"
  on services for select using (active = true);

create policy "public read faq"
  on faq for select using (active = true);

create policy "public read site_settings"
  on site_settings for select using (true);
