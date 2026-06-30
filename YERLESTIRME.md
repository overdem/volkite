# Volkite Logo & İkon Seti — Yerleştirme

## Dosyalar ve nereye konacak

**Logolar → `public/images/`**
- `volkite-logo-white.svg` — **beyaz yazı + renkli ahtapot.** Lacivert header + footer (koyu zemin) için. *(Site şu an bu adı bekliyor.)*
- `volkite-logo-dark.svg` — koyu mor yazı + renkli ahtapot. Krem/açık zeminler için.
- `volkite-icon.svg` — sadece ahtapot (kare). Kompakt yerler, paylaşım vb.

**App ikonları → `public/icons/`** (favicon hariç)
- `icon-32.png`, `icon-48.png` — küçük favicon (şeffaf)
- `icon-192.png`, `icon-512.png` — PWA "any" (şeffaf)
- `icon-512-maskable.png` — PWA maskable (lacivert zemin, güvenli alan)
- `apple-icon.png` (180×180) — iOS ana ekran
- `favicon.ico` — `app/` köküne koy (Next.js otomatik alır)

## Next.js App Router — favicon/apple
En kolayı: `app/` köküne koy, Next otomatik bağlar:
- `app/favicon.ico` (var)
- `app/icon.svg` → `volkite-icon.svg`'yi kopyala (modern tarayıcı favicon'u)
- `app/apple-icon.png` → `apple-icon.png`'yi kopyala

## PWA manifest (hoca paneli "Ana Ekrana Ekle")
`public/manifest.json` (ya da `app/manifest.ts`):
```json
{
  "name": "Volkite Panel",
  "short_name": "Volkite",
  "start_url": "/panel",
  "display": "standalone",
  "background_color": "#07283b",
  "theme_color": "#07283b",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

## Header/footer'da kullanım
"volkite" metnini logoyla değiştir:
```tsx
import Image from "next/image";
// Lacivert header:
<Image src="/images/volkite-logo-white.svg" alt="Volkite Kiteboard Okulu" width={150} height={32} priority />
```
Yükseklik ~28–36px iyi durur (logo oranı ~4.76:1, yani 32px yükseklik ≈ 152px genişlik).

## Notlar
- SVG'ler minify edildi (yazı outline, generator/temizlik yapıldı).
- Renkler: ahtapot mavi #3b87c8 + lacivert #07375b + mor #2c1b3e; beyaz varyantta yazı #fff.
- Daha küçük favicon istenirse ahtapotu kite olmadan kırpabiliriz (32px'te daha sade) — söyle, üretirim.
