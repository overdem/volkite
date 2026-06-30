# Volkite — Master Build Plan (Cline)

Bu repo, Volkite (Gökçeada kitesurf okulu) için **tek bir Next.js + Supabase sistemidir**: herkese açık site, çok dilli AI ajan (web + sonra WhatsApp), rüzgâr-duyarlı ön kayıt, hoca paneli ve öğrenci portalı. Hepsi tek Supabase üstünde.

Bu dosya ana plandır. Detaylı modül brief'leri repoda:
`volkite-build-brief.md` (site) · `volkite-web-ajan.md` (ajan persona+prompt) · `volkite-ajan-kopru.md` (Chatwoot↔Claude köprüsü) · `volkite-ruzgar-onkayit.md` (rüzgâr ön kayıt) · `DESIGN-TOKENS.md` (renk/font — Claude Design'dan). **Görsel referans (tek doğru kaynak): `design-reference/` — Claude Design export'u** (`Volkite Anasayfa.dc.html` + `Volkite Panel.dc.html` + `assets/` gerçek fotoğraf & logo). Token çelişkisinde `DESIGN-TOKENS.md` esastır. Hoca paneli ve öğrenci portalı bu dosyada (§B, §C) tam tanımlı.

> Tasarım export'u şunları **hazır içerir**, sıfırdan yazma — taşı: 4 dilde içerik sözlüğü (→ next-intl `messages`), canlı rüzgâr fetch'i (Open-Meteo), lead formu, FAQ akordeon, gerçek fotoğraflar + Volkite logo (beyaz/koyu/ahtapot). Tasarımdaki chat widget bir anahtar-kelime **stub'ıdır** — production'da Chatwoot widget + Claude beyni ile DEĞİŞTİRİLİR (Faz 3). Site **tek sayfa**, çapa navigasyonlu.

---

## ⚑ ÇALIŞMA PROTOKOLÜ — EN ÖNEMLİ KISIM

**Faz faz ilerle. Her fazın sonunda DUR ve onay bekle.**

1. Tek seferde tüm planı aldın; ama **sırayla** uygula: Faz 0 → 7.
2. Her faz için: `phase/N-isim` branch'i aç → uygula → **tüm testleri koş** (§Test) → GitHub'a push → PR aç → CI yeşil olsun.
3. Sonra **DUR.** Bir sonraki faza GEÇME. Şunları sun:
   - Yapılanların kısa özeti
   - Test sonuçları (typecheck, lint, build, unit, e2e — hepsi)
   - Gözden geçirmem için preview link veya çalıştırma talimatı
   - "Bu fazı onaylıyor musun?" sorusu
4. **Sadece ben açıkça onay verince** PR'ı main'e merge et, tagle, sonraki faza geç.
5. Onay yoksa **bekle**, kendiliğinden devam etme. Belirsizlik varsa sor.

GitHub: main korumalı, her faz kendi branch'inde, PR ile merge. CI (GitHub Actions) her push/PR'da typecheck + lint + build + unit koşar (Faz 0'da kurulur).

---

## Test matrisi ("hertürlü test")

Her fazda en az: `tsc --noEmit` · `eslint` · `next build`.
Faza özel:
- **Unit (vitest):** ajan KB üreteci, rüzgâr skorlama (zayıf/sert/ideal sınırları), `[[HANDOFF]]` ayrıştırma, Open-Meteo yanıt eşleme.
- **Integration:** `/api/agent` (sahte Chatwoot payload → cevap post edildi mi + handoff yolu), indirme imzalı-URL route'u (downloadable=false → 403).
- **E2E (Playwright) smoke:** anasayfa render, dil değişimi, paketlerin Supabase'den gelmesi, `/panel` giriş kapısı, öğrenci portalı giriş + indirme kapısı.
- **a11y:** focus görünür, reduced-motion, Lighthouse ≥ 90 (site fazları).

---

## Faz planı

**Faz 0 — İskelet & altyapı.** Next.js 15 (App Router, TS, Tailwind) + next-intl (tr/en/bg/ro) + Supabase bağlantısı + GitHub repo + GitHub Actions CI + design token'lar (`volkite-build-brief.md` §2) + `.env`. `/` render oluyor, CI yeşil. → ONAY.

**Faz 1 — Herkese açık site (statik, tek sayfa landing).** Anasayfa Claude Design export'uyla birebir: nav→hero(canlı rüzgâr chip)→stats→hakkımızda→eğitimler→trust→hizmetler→galeri→spot→yorumlar→konaklama→mutfak→sss→instagram→rezervasyon(lead form)→footer→chat widget. 4 dil + responsive + a11y. Önce hardcoded içerik (tasarımın sözlüğünden). → ONAY.

**Faz 1B — Detay alt sayfalar (SEO).** `volkite-icerik.md` içeriğinden, aynı tasarım diliyle (DESIGN-TOKENS.md): `/egitimler` (3 program tam müfredat + fiyat), `/hizmetler` (tüm hizmet + masaj fiyatları), `/spot-ruzgar` (rüzgâr + alan + neden Gökçeada), `/hakkimizda` (tarihçe + ekip), `/mutfak`. Dinamik veri (paket/hizmet/faq) Supabase'den, statik metin next-intl. Landing'deki ilgili bölümler bu sayfalara "devamını oku" ile bağlanır. hreflang + eski URL 301'leri bu sayfalara. → ONAY. *(Faz 1–3'ten bağımsız; istediğin sırada koşulabilir — şimdi koşmak mantıklı çünkü içerik hazır.)*

**Faz 2 — Supabase içerik.** Şema + seed (gerçek fiyatlar: 10s paket 700€, saatlik 80€, kiralama 80€, depolama 5€/gün; konaklama 25€/15€) + RLS + site canlı veriden okuyor + i18n (TR/EN tam, BG/RO EN'e fallback) + eski URL 301'leri + SEO/hreflang/doğrulama metaları. → ONAY.

**Faz 3 — Ajan köprüsü + web chat.** `volkite-ajan-kopru.md`: `/api/agent` endpoint (Claude Haiku 4.5 + Supabase canlı KB + persona `volkite-web-ajan.md` + `[[HANDOFF]]`) + Chatwoot website widget gömme. (Chatwoot Cloud kurulumu + Agent Bot bağlama ben yaparım; sen endpoint + widget + testleri yap.) → ONAY.

**Faz 4 — Rüzgâr-duyarlı ön kayıt.** `volkite-ruzgar-onkayit.md`: `wind_bands` + `bookings` tabloları + `daily_slots` + Open-Meteo entegrasyonu + ajana iki tool (`check_wind_and_availability`, `create_provisional_booking`) + skorlama + system prompt davranışı. → ONAY.

**Faz 5 — Hoca paneli (`/panel`).** §B. Supabase Auth (personel) + roller + RLS + öğrenci/ders ilerlemesi/ödeme/konaklama/ekipman + "Ön Kayıtlar" onay akışı (provisional booking → student). → ONAY.

**Faz 6 — Öğrenci portalı (`/ogrenci`).** §C. Öğrenci auth (magic link) + ders ilerlemesi (salt okunur) + atanmış foto/video (R2) + filigranlı önizleme + nakit sonrası panelden açılan indirme (imzalı URL). → ONAY.

**Faz 7 — WhatsApp.** Chatwoot embedded signup ile WhatsApp inbox + **aynı Agent Bot**'u bağla. Endpoint'te kod değişmez; sen WhatsApp inbox'ın da aynı şekilde çalıştığını test et. → ONAY.

*(Instagram + Messenger sonraki iş — şimdilik kapsam dışı, ama aynı bota bağlanacak şekilde hazır kalsın.)*

---

## §B — Hoca paneli (`/panel`)

Korumalı, Supabase Auth. Roller: `admin` (Volkan — her şey) · `instructor` (öğrenci/ders/medya). RLS rol bazlı.

```sql
-- personel profili (auth.users'a bağlı)
create table profiles (
  id uuid primary key references auth.users(id),
  name text, role text check (role in ('admin','instructor')) default 'instructor',
  active boolean default true
);

create table students (
  id uuid primary key default gen_random_uuid(),
  name text not null, contact text, email text, language text, nationality text,
  level text,                       -- beginner/intermediate/advanced
  weight_kg numeric,                -- kite boyutu için
  emergency_contact text,
  assigned_instructor uuid references profiles(id),
  status text default 'active',     -- prospect|active|completed
  notes text, created_at timestamptz default now()
);

-- 5 derslik müfredat ilerlemesi
create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  lesson_no int check (lesson_no between 1 and 5),
  title text, status text default 'pending',   -- pending|done
  hours numeric, wind_kn numeric,               -- o günkü rüzgâr
  instructor_notes text, instructor_id uuid references profiles(id),
  completed_at timestamptz
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  amount_eur numeric, type text,        -- package|hourly|accommodation|rental|storage|media
  method text default 'cash', paid boolean default false,
  paid_at timestamptz, notes text
);

create table accommodation (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  kind text,                 -- tent|caravan
  breakfast boolean, nights int, price_eur numeric,
  student_discount boolean default false, notes text
);

create table equipment (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  kind text,                 -- rental|storage
  days int, price_eur numeric, notes text
);
```

RLS: tüm bu tablolar yalnızca authenticated personel (profiles'ta kaydı olan). `admin` her şeyi; `instructor` okuma + kendi atandığı öğrencilerde yazma. `bookings` (rüzgâr brief'inden) burada görünür.

Sayfalar: `/panel` (dashboard) · `/panel/ogrenciler` (liste+detay: profil, ders ilerlemesi, ödeme, konaklama, ekipman, medya atama) · `/panel/on-kayitlar` (provisional bookings → Onayla/Reddet; onay → student + lesson_progress 1-5 açılır) · `/panel/ayarlar` (fiyat/rüzgâr bandı/daily_slots — admin).

---

## §C — Öğrenci portalı (`/ogrenci`)

Öğrenci girişi: **magic link** (e-posta) — şifresiz, öğrenci için sürtünmesiz. Rol `student`. RLS: öğrenci yalnızca **kendi** kayıtlarını görür.

```sql
create table student_media (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  type text check (type in ('photo','video')),
  r2_key text not null,            -- orijinal (private)
  thumb_key text,                  -- küçük önizleme
  preview_key text,                -- filigranlı önizleme
  downloadable boolean default false,   -- nakit sonrası panelden açılır
  assigned_by uuid references profiles(id),
  created_at timestamptz default now()
);
```

Depolama: **Cloudflare R2** (ShotSurf/kitelens kalıbın). Orijinaller private; indirme sadece `downloadable=true` ise **kısa ömürlü imzalı URL** ile. Önizleme filigranlı.

Akış: hoca panelden öğrenciye medya atar (R2'ye yükle + `student_media` satırı). Öğrenci portalda görür → filigranlı önizleme. Öğrenci nakit ödeyince hoca panelden o medyayı (veya öğrencinin tüm medyasını) `downloadable=true` yapar → öğrenci portalda **İndir** butonu açılır.

Sayfalar: `/ogrenci` (derslerim — lesson_progress salt okunur) · `/ogrenci/medya` (foto/video galerisi; önizleme → kilitli/açık indirme) · indirme route'u: `/api/student/download/[mediaId]` → media downloadable ve sahibi doğruysa imzalı R2 URL döner, değilse 403.

> Not: Şimdilik ödeme nakit + panelden manuel kilit açma. İleride online ödeme (Paddle/Stripe — ShotSurf'teki gibi) eklenip öğrenci kendi kilidini açabilir; MVP'de gerek yok.

---

## Repo yapısı (konsolide)

```
app/
  [locale]/                 # site + /ogrenci (öğrenci portalı)
  panel/                    # hoca paneli (auth)
  api/
    agent/route.ts          # Chatwoot↔Claude köprüsü
    student/download/[id]/route.ts
components/ ...
i18n/ messages/ lib/ (supabase.ts, r2.ts, openmeteo.ts, claude.ts, queries.ts)
middleware.ts               # next-intl + auth koruması
.github/workflows/ci.yml    # typecheck+lint+build+unit
tests/ (unit, e2e)
```

`.env`: Supabase URL/anon/service_role · ANTHROPIC_API_KEY · CHATWOOT_BASE_URL/BOT_TOKEN · AGENT_SHARED_SECRET · R2 (account, access key, secret, bucket, public/signing) · OPEN_METEO (anahtarsız).

---

## Global Definition of Done

Her faz: ilgili testler yeşil + CI geçti + benim onayım. Sistem geneli: site canlı veriden besleniyor, ajan 4 dilde danışman gibi konuşup rüzgâr-duyarlı ön kayıt alıyor, panel öğrenci/ders/ödeme/konaklama/ekipman + ön kayıt onayı yönetiyor, öğrenci portalı medyayı nakit sonrası indiriyor, WhatsApp aynı beyne bağlı.

**Hatırlatma: her fazda dur, onay bekle, ben "devam" demeden geçme.**
