# Volkite — Design Tokens

> **Otoriter kaynak.** Claude Design export'undan (`design-reference/Volkite Anasayfa.dc.html` + `Volkite Panel.dc.html`) birebir çıkarıldı. Renk/font çelişkisinde bu dosya esastır. Karakter: bold, sıcak, poster — krem + lacivert + cyan, turuncu CTA pop'u.

## Renk paleti

```css
:root{
  /* Arka planlar */
  --cream:#fbf6ec;        /* açık bölüm zemini (sıcak krem) */
  --ink:#07283b;          /* ana metin + orta-koyu bölüm zemini */
  --deep:#062131;         /* en koyu bölümler: hero, spot, konaklama, footer */
  --surface:#0c3346;      /* koyu kart yüzeyi */
  --surface-2:#114057;    /* koyu kart hover */
  --hero-base:#16384a;    /* fotoğraf arkası dolgu */

  /* Aksanlar */
  --cyan:#14b8cf;         /* birincil aksan — deniz */
  --orange:#ff6a3d;       /* CTA (hover #ff7f57; link alt çizgisi #ff8a64) */

  /* Metin */
  --on-dark:#dceaf0;      /* koyu üstü ana */
  --on-dark-soft:#9fc0cf; /* koyu üstü ikincil */
  --on-dark-soft2:#bcd4de;
  --on-light:#07283b;
  --on-light-soft:#3a5563;
  --muted:#5a7079;

  /* Çizgi/durum */
  --line-light:#ece1cc;   /* açık bölüm kart kenarı */
  --line-dark:rgba(255,255,255,.08);
  --green:#3ee07a;        /* canlı nokta / başarı / WhatsApp ikon hover #25D366 */
  --gold:#ffcf4d;         /* yıldız */

  /* Panel (ayrı zemin) */
  --panel-bg:#eef1f4;
  --panel-card:#ffffff;
  --panel-line:#e4e9ee;
  --panel-muted:#8497a1;
}
```

**Bölüm ritmi:** açık (`--cream`) ↔ koyu (`--ink` / `--deep`) bölümler alternatif. CTA hep turuncu, aksan hep cyan.

## Tipografi

```
Anton          → başlıklar (h1-h3) ve büyük sayılar
Manrope 400-800 → gövde, UI, kicker, fiyat
```
Import: `https://fonts.googleapis.com/css2?family=Anton&family=Manrope:wght@400;500;600;700;800`

- **Hero h1:** Anton, `clamp(54px,11vw,150px)`, `line-height:.9`.
- **Bölüm h2:** Anton, `clamp(34px,4.5vw,60px)`, `line-height:.98`.
- **Kart h3:** Anton, ~28px / veya Manrope 800 ~19-21px (tasarımda ikisi de var).
- **Sayılar (stats):** Anton, `clamp(38px,5vw,56px)`, cyan.
- **Kicker/eyebrow:** Manrope 800, UPPERCASE, `letter-spacing:.22em`, cyan (mutfakta turuncu).
- **Gövde:** Manrope 400-500, 15-17px, `line-height:1.6-1.65`.
- Serif YOK. Space Mono YOK (galeri placeholder hariç generic monospace).

## Komponent kalıpları

- **Buton (CTA):** turuncu zemin, beyaz metin, Manrope 800, `border-radius:10-12px`, gölge `0 12px 30px -10px rgba(255,106,61,.7)`.
- **Buton (ikincil):** şeffaf, `1px` beyaz/cyan kenar.
- **Kart (koyu):** `--surface` zemin, `1px rgba(255,255,255,.08)` kenar, `border-radius:16-20px`, padding 26-30px; hover `translateY(-6px)` + cyan kenar.
- **Kart (açık/panel):** beyaz zemin, `--line-light`/`--panel-line` kenar, `border-radius:16px`.
- **Chip (canlı rüzgâr / etiket):** yuvarlak (`border-radius:999px`), cyan-tint zemin, küçük; canlı nokta yeşil `pulse`.
- **Bölüm:** padding `clamp(64px,8vw,120px) clamp(20px,5vw,72px)`, içerik `max-width:1240px;margin:0 auto`.

## Motion

`kenburns` (hero fotoğraf, 18s), `pulse` (canlı nokta), `rise` (giriş), `floaty`, `drift`. Hepsi `prefers-reduced-motion: reduce` ile kapanır.

## Logo & asset

`design-reference/assets/`: `volkite-logo.png` (koyu zemin için), `volkite-logo-white.png` (açık metin/nav/footer), `volkite-octopus.png` (ikon/favicon). Hero/about/spot fotoğrafları gerçek arşivden (`hero-kite.jpg`, `about-kite.jpg`, `spot-kite.jpg`, `beach-lesson.jpg`).

## Responsive kırılımlar

- Nav linkleri ≥900px görünür (altında hamburger).
- Panel sidebar/grid ≤880px tek kolona düşer.
- Tüm grid'ler `repeat(auto-fit,minmax(...,1fr))` — doğal sarma.
