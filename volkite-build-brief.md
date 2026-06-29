# Volkite — Web Yeniden Yapım · Build Brief (Cline)

> **Görsel referans:** `volkite-anasayfa.html` (bu repodaki prototip). Renk, tipografi, boşluk ve bölüm düzeni için **tek doğru kaynak** budur. Cline bu dosyayı açıp birebir eşlemeli; aşağıdaki token'lar oradan çıkarılmıştır.

---

## 0. Amaç

Mevcut WordPress sitesi (`volkite.com`, WP 5.7.15, 2023) yerine modern, çok dilli, hızlı bir site. **Birincil iş: eğitim paketi satışı.** Estetik: sakin–premium Aegean, editorial. Logo korunuyor (lowercase `volkite` wordmark).

Bu fazda **sadece web sitesi** kuruluyor. Chat ajanı, WhatsApp ve Instagram **sonraki fazlar** — site bunlara hazır bırakılacak ama burada yapılmayacak (bkz. §14).

---

## 1. Teknik yığın

- **Next.js 15** (App Router, TypeScript, React Server Components)
- **next-intl** — 4 dil: `tr` (varsayılan), `en`, `bg`, `ro`
- **Supabase** — içerik kaynağı (paketler, hizmetler, FAQ, ayarlar). Public read.
- **Tailwind CSS** — token'lar `globals.css`'te CSS değişkeni olarak (aşağıda)
- **Vercel** — deploy
- Görseller: ileride Supabase Storage / Cloudflare R2. Şimdilik `/public/placeholder/` + prototipteki gradyan placeholder'lar.

Kullanma: ağır UI kütüphanesi yok. Fontlar Google Fonts (Fraunces, Manrope, Space Mono).

---

## 2. Tasarım sistemi (tokens)

`app/globals.css` içine:

> **Kaynak: Claude Design export'u** (`design-reference/Volkite Anasayfa.dc.html`) ve `DESIGN-TOKENS.md`. Aşağıdaki değerler oradan birebir çıkarılmıştır. Önceki "Aegean editorial / Fraunces / Space Mono" yönü **DEĞİŞTİ** — tasarım daha bold/sıcak bir yöne gitti.

```css
:root{
  --cream:#fbf6ec;       /* açık bölüm arka planı (sıcak krem) */
  --ink:#07283b;         /* ana metin + orta koyu bölümler */
  --deep:#062131;        /* en koyu bölümler (hero, spot, footer) */
  --surface:#0c3346;     /* koyu kart yüzeyi */
  --surface-2:#114057;   /* koyu kart hover */
  --cyan:#14b8cf;        /* birincil aksan — deniz cyan'ı */
  --orange:#ff6a3d;      /* CTA aksanı (hover #ff7f57) */
  --on-dark:#dceaf0;     /* koyu üstü metin */
  --on-dark-soft:#9fc0cf;
  --on-light-soft:#3a5563;
  --muted:#5a7079;
  --line-light:#ece1cc;  /* açık bölüm kart kenarı */
  --green:#3ee07a;       /* canlı nokta / başarı */
  --gold:#ffcf4d;        /* yıldız */
  --display:"Anton",Impact,sans-serif;
  --body:"Manrope",system-ui,sans-serif;
}
```

Font importu:
```
https://fonts.googleapis.com/css2?family=Anton&family=Manrope:wght@400;500;600;700;800
```

**Tipografi kuralları**
- Başlıklar + büyük sayılar: **Anton**, `line-height:.9–.98`, poster ölçek (`clamp(34px,4.5vw,60px)`, hero `clamp(54px,11vw,150px)`).
- Gövde/UI: **Manrope** 400–800.
- Kicker/eyebrow: Manrope 800, UPPERCASE, `letter-spacing:.22em`, `--cyan`.
- Serif YOK, Space Mono YOK. (Eski "meteo Space-Mono şeridi" imzası kaldırıldı.)

**İmza:** Anton poster başlıklar + canlı rüzgâr chip'i (hero'da, Open-Meteo) + cyan/orange kontrastı. Bölümler krem (`--cream`) ↔ lacivert (`--ink`/`--deep`) arasında alternatif.

**Boşluk / ritim:** section padding `clamp(64px,8vw,120px)`, içerik `max-width:1240px`. Border-radius 12–20px. Yumuşak gölgeler var (kartlar, CTA). Hover: `translateY(-6px)` + kenar rengi cyan.

**Motion:** hero arka planında Ken Burns (`kenburns`), canlı nokta `pulse`, bölüm girişlerinde `rise`. `prefers-reduced-motion` respect.

**Erişilebilirlik:** görünür klavye focus, semantik HTML, mobilde tam çalışır (tasarımda 900px nav kırılımı + 880px panel kırılımı var).

---

## 3. Bilgi mimarisi

> Tasarım **tek sayfa**, çapa (anchor) navigasyonlu — ayrı route'lar değil. Her locale (`/`, `/en`, `/bg`, `/ro`) bu tek sayfayı kendi dilinde render eder. Bölüm sırası (Claude Design'dan birebir):

1. **Nav** (fixed, blur, lacivert yarı saydam) — beyaz logo, nav linkleri, **dil menüsü** (TR/EN/BG/RO dropdown — tasarımda hazır), turuncu CTA.
2. **Hero** — tam ekran fotoğraf (Ken Burns) + **canlı rüzgâr chip'i** (Open-Meteo, sağ üst) + kicker + Anton başlık + 2 CTA.
3. **Stats** (lacivert) — Anton sayılar (21 yıl, 300 gün vb.).
4. **Hakkımızda** (krem) — metin + fotoğraf + "21 yıl" rozeti.
5. **Eğitimler/seviyeler** (lacivert) — kartlar, fiyat satırlı (Supabase `packages`).
6. **Trust** (krem) — Slingshot / TYF / IKO kartları.
7. **Hizmetler** (lacivert) — kartlar (Supabase `services`).
8. **Galeri** (krem) — grid (kitelens, @kitelenspro).
9. **Spot** (lacivert) — fotoğraf + özellikler + kiting.live linki.
10. **Yorumlar** (lacivert) — puan + testimonial kartları.
11. **Konaklama** (lacivert) — kamp/karavan kartları.
12. **Mutfak** (krem) — Cafe on Shore + fotoğraf grid.
13. **SSS** (lacivert) — akordeon (Supabase `faq`).
14. **Instagram** (krem) — grid + @volkite linki.
15. **Rezervasyon** (lacivert) — iletişim + **lead formu** (ad/soyad/e-posta/mesaj). → Form gönderimi `bookings`'e provisional kayıt + ajana/Volkan'a bildirim olur.
16. **Footer** (lacivert) — logo, sosyal (f / ig / wa), alt bar.
17. **Chat widget** (sağ alt, yüzen) — **tasarımdaki anahtar-kelime stub'ı PRODUCTION'DA Chatwoot widget'ı ile DEĞİŞTİRİLİR** → Claude beyni yanıtlar (§8). Tasarımın chat UX'i/yerleşimi referans, mantığı değil.

**Önemli:** Tasarım zaten içeriyor → 4 dilde tam içerik sözlüğü (next-intl `messages`'a aktarılabilir), canlı rüzgâr fetch'i, lead formu, gerçek fotoğraflar ve logo. Bunları sıfırdan yazma, tasarımdan taşı.

İleride istenirse ayrı detay sayfaları (`/egitimler` vb.) eklenebilir; MVP tek sayfa + çapa.

---

## 4. i18n stratejisi (next-intl)

- Locale'ler: `['tr','en','bg','ro']`, default `tr`.
- `localePrefix: 'as-needed'` → TR kök (`/`), diğerleri prefixli (`/en`, `/bg`, `/ro`).
- **Faz 1 içerik zorunluluğu:** TR ve EN tam. **BG ve RO route'ları kurulacak ama içerik yokken EN'e fallback** edecek (next-intl fallback). Böylece launch BG/RO çevirisini beklemez; çeviriler sonra eklenir.
- UI/statik metinler (`nav`, buton, başlık, pazarlama kopyaları) → `messages/{locale}.json`.
- Dinamik içerik (paket, hizmet, FAQ) → Supabase (bkz. §5/§6).
- `hreflang` alternate link'leri her sayfa için (TR/EN/BG/RO + x-default).

> Not: Site dili 4 dilde; **sohbet asistanı** (sonraki faz) gelen mesajın dilini algılayıp TR/EN/BG/RO yanıtlar — yani BG/RO ziyaretçi statik sayfa EN olsa bile asistanla kendi dilinde konuşur.

---

## 5. Veri modeli (Supabase)

Çok dilli metin alanları locale-sonekli kolonlarla (Cline için en açık yöntem). Sayısal/locale-bağımsız alanlar tek kolon. BG/RO boşsa app EN'e düşer.

```sql
-- EĞİTİM PAKETLERİ (anasayfanın kalbi)
create table packages (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  sort        int  not null default 0,
  meta_label  text,                 -- "01 · Başlangıç" gibi
  name_tr     text not null,
  name_en     text,
  name_bg     text,
  name_ro     text,
  desc_tr     text,
  desc_en     text,
  desc_bg     text,
  desc_ro     text,
  price_eur   numeric,              -- locale-bağımsız
  unit_tr     text,                 -- "/ 9 saat", "/ saat"
  unit_en     text,
  features_tr text[],               -- madde listesi
  features_en text[],
  features_bg text[],
  features_ro text[],
  featured    boolean default false,
  active      boolean default true
);

-- HİZMETLER
create table services (
  id        uuid primary key default gen_random_uuid(),
  sort      int default 0,
  name_tr   text not null, name_en text, name_bg text, name_ro text,
  desc_tr   text, desc_en text, desc_bg text, desc_ro text,
  active    boolean default true
);

-- FAQ (siteye + sonraki faz asistana kaynak)
create table faq (
  id        uuid primary key default gen_random_uuid(),
  sort      int default 0,
  category  text,
  q_tr text not null, q_en text, q_bg text, q_ro text,
  a_tr text not null, a_en text, a_bg text, a_ro text,
  active boolean default true
);

-- SİTE AYARLARI (iletişim, hero metni, spot stat) — tek satır key-value değil, anlamlı kolonlar
create table site_settings (
  id            int primary key default 1,
  phone         text,
  email         text,
  address_tr    text, address_en text,
  instagram_url text,
  facebook_url  text,
  wind_url      text,             -- kiting.live linki
  season_tr     text, season_en text,
  windy_days    int default 300,
  spot_coords   text default '40°11′N 25°54′E'
);

-- GALERİ (ileride R2/Storage URL'leri)
create table gallery (
  id     uuid primary key default gen_random_uuid(),
  sort   int default 0,
  url    text not null,
  alt    text,
  tag    text,            -- action / spot / cafe ...
  active boolean default true
);
```

**RLS:** Her tabloda RLS açık. `active = true` satırlar için **anon SELECT** policy (public read). INSERT/UPDATE/DELETE yalnızca service_role / authenticated admin.

```sql
alter table packages enable row level security;
create policy "public read" on packages for select using (active = true);
-- aynısı services, faq, gallery, site_settings için
```

---

## 6. İçerik kaynağı ayrımı

| İçerik | Kaynak | Neden |
|---|---|---|
| Nav, buton, bölüm başlıkları, sabit pazarlama kopyası | `messages/{locale}.json` (next-intl) | Statik, SEO, çeviri dosyası |
| Paketler, fiyatlar, hizmetler, FAQ, iletişim, spot stat | Supabase | Değişir; tek yerden güncelle; sonraki faz asistan da aynı veriyi kullanır |

**Kritik:** Fiyat/takvim/FAQ'i kod içine gömme. Hepsi Supabase'den. Böylece Volkite ekibi tek yerden güncelliyor ve asistan ile site aynı gerçeği paylaşıyor.

Server Component'lerde Supabase'i server-side oku (anon key, public read). 1 saatlik `revalidate` (ISR) yeterli.

---

## 7. Bileşenler

```
components/
  Header.tsx          (sticky, scroll blur, mobil menü, dil anahtarı)
  Hero.tsx            (başlık + CTA + MeteoStrip)
  MeteoStrip.tsx      (imza — Space Mono ölçüm şeridi, site_settings'ten)
  TrustBar.tsx
  PackageGrid.tsx     (Supabase packages → PackageCard'lar)
  PackageCard.tsx     (featured varyantı dahil)
  SpotSection.tsx     (stat'lar + kiting.live link)
  ServicesGrid.tsx    (Supabase services, koyu blok)
  CafeSection.tsx
  Gallery.tsx         (Supabase gallery)
  Footer.tsx
  ChatWidget.tsx      (placeholder — §8)
  LocaleSwitcher.tsx
  Reveal.tsx          (IntersectionObserver wrapper, reduced-motion guard)
```

`PackageCard` props: `name, desc, priceEur, unit, features[], featured, metaLabel`. Görsel olarak prototipteki `.pkg` / `.pkg.featured` ile birebir.

---

## 8. Chat widget placeholder (gelecek Chatwoot)

`ChatWidget.tsx` şimdilik **sadece görsel** — prototipteki sağ-alt baloncuk (avatar `v`, "Volkite asistanı", "Soru sor · TR EN BG RO", pulse nokta). Tıklama şimdilik no-op / "yakında".

İçine net TODO bırak:
```tsx
// TODO (Faz 2 — web ajanı): Chatwoot Cloud web widget script'ini buraya göm.
// Chatwoot Agent Bot → kendi Claude beynimiz (Next.js endpoint) yanıtlayacak.
// Bu component o zaman Chatwoot widget'ını mount eden bir wrapper olacak.
```
Backend, Claude, Chatwoot **bu fazda yapılmayacak.**

---

## 9. SEO, meta, redirect

**Korunacak doğrulama metaları** (eski siteden, search console kaybetmemek için `layout` metadata'ya taşı):
- `google-site-verification: A8NckBzl3jePv-0QZhhh4f_2Y8YqjlrxAyXF3ehDhss`
- `msvalidate.01: 4AE83C92E82A7B656A403A4BC73305A1`
- `yandex-verification: 3f12a63c7059d4fe`

**Her sayfa:** locale'e göre `title`/`description`, `canonical`, `hreflang` alternate (tr/en/bg/ro + x-default), OpenGraph (logo `og:image`). `sitemap.xml` + `robots.txt` (next ile generate).

**Eski WP URL → yeni route 301 redirect haritası** (`next.config.js` redirects):
```
/hakkimizda      → /hakkimizda
/egitimler       → /egitimler
/hizmetler       → /hizmetler
/spot-ve-ruzgar  → /spot
/mutfak          → /mutfak
/iletisim        → /iletisim
/en/about-us     → /en/hakkimizda
/en/lessons      → /en/egitimler
/en/services     → /en/hizmetler
/en/spot-wind    → /en/spot
/en/kitchen      → /en/mutfak
/en/contact      → /en/iletisim
```
(Trailing slash'leri normalize et.)

---

## 10. Proje yapısı

```
volkite/
  app/
    [locale]/
      layout.tsx
      page.tsx                # anasayfa
      egitimler/page.tsx
      hizmetler/page.tsx
      spot/page.tsx
      mutfak/page.tsx
      hakkimizda/page.tsx
      iletisim/page.tsx
    globals.css               # tokens (§2)
    sitemap.ts
    robots.ts
  components/                 # §7
  i18n/
    routing.ts
    request.ts
  messages/
    tr.json  en.json  bg.json  ro.json
  lib/
    supabase.ts               # server client
    queries.ts                # getPackages, getServices, getFaq, getSettings
  middleware.ts               # next-intl
  next.config.js              # redirects (§9)
  public/placeholder/
  .env.local
```

---

## 11. Kurulum

```bash
npx create-next-app@latest volkite --ts --tailwind --app --eslint
cd volkite
npm i next-intl @supabase/supabase-js
```

`.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 12. Build fazları (milestones)

1. **İskelet:** Next.js + next-intl 4 locale + Tailwind + token'lar + globals.css. `/` render oluyor.
2. **Anasayfa (statik):** Header → Hero → Meteo → Trust → Spot → Services → Cafe → Gallery → Footer + ChatWidget placeholder. Prototiple birebir görsel eşleşme. **Önce hardcoded içerikle**, görsel oturana kadar.
3. **Supabase bağlama:** packages/services/faq/settings/gallery tabloları + queries + ISR. Hardcoded içerik DB'den gelene dönüşür.
4. **İç sayfalar:** egitimler, hizmetler, spot, mutfak, hakkimizda, iletisim.
5. **i18n içerik:** TR + EN tam; BG/RO fallback. messages dosyaları.
6. **SEO + redirects:** metadata, hreflang, sitemap, robots, 301'ler, doğrulama metaları.
7. **QA:** mobil, klavye focus, reduced-motion, Lighthouse (perf/SEO/a11y > 90).

---

## 13. Kabul kriterleri

- [ ] Anasayfa prototiple görsel olarak eşleşiyor (renk, tip, boşluk, meteo şeridi, paket kartları, featured kart).
- [ ] Paketler/hizmetler/FAQ/iletişim Supabase'den geliyor; kodda hardcoded fiyat yok.
- [ ] 4 locale route çalışıyor; TR/EN tam, BG/RO EN'e fallback.
- [ ] Eski WP URL'leri 301 ile yeni route'lara gidiyor.
- [ ] hreflang + canonical + doğrulama metaları yerinde.
- [ ] Mobilde tam çalışır; `:focus-visible` görünür; `prefers-reduced-motion` respect.
- [ ] Lighthouse Performance & SEO ≥ 90.
- [ ] ChatWidget placeholder görünüyor, TODO yorumu duruyor.

---

## 14. Kapsam DIŞI (sonraki fazlar — bu repoda yapma)

- Chat ajanı backend'i (Claude beyni / Next.js endpoint)
- Chatwoot Cloud kurulumu ve Agent Bot webhook
- WhatsApp Cloud API
- Instagram / Messenger
- Rezervasyon/ödeme akışı (paket kartları şimdilik iletişime/forma yönlendirir)

Bunlar ayrı fazlarda. Site bunlara hazır bırakılacak (ChatWidget slot'u, FAQ tablosu, temiz veri modeli) ama burada inşa edilmeyecek.

---

**Özet sıra:** önce §12'deki 1–2 (iskelet + statik anasayfa, prototiple eşleşene kadar), sonra Supabase, sonra iç sayfalar + i18n + SEO. Görsel referans her zaman `volkite-anasayfa.html`.
