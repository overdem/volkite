# Volkite — İçerik Paketi (volkite.com'dan toplandı)

> Mevcut volkite.com'un tüm sayfalarından (TR) çıkarıldı. Bu paket üç yere besleniyor: **Supabase seed** (paket/hizmet/faq), **ajan bilgi tabanı** (`volkite-web-ajan.md`'i zenginleştirir), **detay sayfaları** (landing + alt sayfalar). EN içerik gerçek haliyle `/en/...` sayfalarında var — Cline çeviriyi uydurmasın, oradan çeksin (`/en/about-us`, `/en/lessons`, `/en/services`, `/en/spot-wind`, `/en/kitchen`).

---

## ✓ GEÇERLİ FİYATLAR (Özdem onayladı — site eski, bunlar esas)

Sitedeki fiyatlar eski. **Aşağıdaki fiyatlar geçerlidir** (2024–2025, hâlâ devam ediyor). Supabase seed ve ajan KB bunları kullanır; sitedeki rakamlar görmezden gelinir.

| Kalem | Geçerli fiyat |
|---|---|
| Saatlik birebir eğitim | **80€** |
| Başlangıç paketi (10 saat = 2'şer saatlik 5 ders) | **700€** |
| 2 kişilik grup (kişi başı) | **600€** (başlangıç fazı; sonra birebire geçiş önerilir) |
| Ekipman kiralama (kite+board+harness) | **80€/gün** |
| Ekipman depolama | **5€/gün** |
| Konaklama — kamp çadır/karavan | kahvaltılı **25€** / kahvaltısız **15€** (öğrencilik günlerinde %50 indirim) |
| Gün-içi tesis kullanımı | öğrencilik günlerinde **bedelsiz**; diğer zamanlar **10€/gün** (otopark, sıcak duş/kabin, wc, deck, şarj & çalışma alanı, wifi, minder, kompresör, beachvolley) |

> Eğitimde ekipman, kask, telsiz dahil. Öğrenci sadece kişisel eşya + güneş gözlüğü getirir.
> Sitedeki Keşif (4s) ve İleri program *tanımları* bilgi olarak korunabilir, ama fiyatları yukarıdaki modele bağlıdır (saatlik 80€, paket 700€); site fiyatları kullanılmaz.

**Grup modeli:** Eğitim başlangıç aşamasında birlikte (grup) ilerleyebilir — arkadaşlar/çiftler beraber başlayabilir. Ancak **kilo, yetenek ve ilerleme hızı** farkları nedeniyle belli bir seviyeden sonra okul, öğrencilerin **ayrı (birebir) devam etmesini önerir.** Ajan bunu böyle anlatır: "Arkadaşınızla/eşinizle başlayabilirsiniz; ama seviyeniz açıldıkça, kilo ve hız farkından dolayı bir noktadan sonra ayrı ders almanızı öneririz — herkesin gelişimi için daha verimli olur."

---

## 1. HAKKIMIZDA / MARKA (about + ajan KB)

**Konum:** Cittaslow Gökçeada, Kefaloz koyu. Eşelek Köyü, Köy Sokağı 104/1, Gökçeada–Çanakkale.
**Slogan:** "Hayatımızı rüzgâra ve suya adadık." · "Rüzgâr cenneti Gökçeada."
**Tecrübe:** 21 yıllık uçurtma sörfü eğitim tecrübesi. Türkiye'nin en köklü kiteboard okulu.
**Eğitmen dilleri (ders):** İngilizce, İspanyolca, Arapça, Fransızca, İtalyanca dahil çok dilde ders.

### Kısa tarihçe
- 2000: Volkite'ın temelleri İstanbul/Burç Beach'te. Windsurf, katamaran, wakeboard → kiteboard.
- 2005: İlk kiteboard eğitimleri (Burç Beach). Kartalkaya/Kartepe snowboard eğitimleri.
- 2007–2010: Uludağ Snowkite Okulu & Snowpark.
- 2008: Gökçeada keşfedildi, yeni lokasyon açıldı, ilk öğrenciler.
- 2010: Poyraz rüzgârı nedeniyle İstanbul okulu tamamen Gökçeada'ya taşındı — yeni ev: Volkite Gökçeada. "Progression is Everything" kampı, TKBA yarışı.
- 2013–2016: Kite festivalleri (Zahit Mungan misafir); **Çamlıca Kitesurf Challenge** I-II-III (120+ sporcu, fikri Volkite'a ait).
- 2000–2021: onlarca eğitmen, binlerce öğrenci. TYF KB5 & KB4 sertifikalı.

### Kurucu — Volkan Günel
1977 İstanbul doğumlu. 1987 kaykay (11-board ollie Türkiye rekoru), 1995 snowboard, 2000 yelken/windsurf/kitesurf (Burç Beach), hepsi kendi kendine. Kapalıçarşı'da kuyumculuğu bırakıp 2000'den snowboard eğitmenliği. 2007–2008 Dünya Kiteboard Şampiyonası. Köprülerden kite ile atladı, 50-60 knot fırtınalarda sürdü. Extreme yaşam, doğa, eğitim ve paylaşım insanı. **Owner – KB5 Eğitmen · Diller: TR, EN.**

### Ekip
- **Volkan Günel** — Owner, KB5 — TR, EN
- **Burçak Doğan** — KB4 — TR, FR, EN
- **Emin Ufuk** — KB4 — TR, EN
- **Soydan Cıgsar** — KB4 — TR, EN
- **Karapati** — Asistan — "Meow!" (okul kedisi)
- **Enes Günel** — School Manager
- **Cafe On Shore:** Deniz Gönül (Big Mama), Sezen Pak (Şef), Zeynep Halisçelik (Şef)

---

## 2. EĞİTİM PROGRAMLARI (Supabase `packages` + detay sayfa)

### Volkite avantajları
TYF üst seviye KB5/KB4 eğitmenler · BB Talkin' telsiz kask (sürerken eğitmenle konuşma) · onshore (karaya) rüzgâr — kite düşse de açığa sürüklenmezsin, ayağın yere basar · 4 km trafiksiz koy, öğrenciye özel 600 m eğitim alanı.

### A) Başlangıç Programı — 10 saat
Hedef: bağımsız kiteboardcu. 5 ders (her biri 50+50 dk):
1. **Teori & küçük kite** — kite tanımı, emniyet, rüzgâr & rüzgâr penceresi, küçük kite ile karada pratik, 4 ipli kite kurulumu.
2. **Kara→Deniz geçişi** — trapezle orta boy kite kontrolü, kite indirme/kaldırma, suya giriş, sudan kite kaldırma, rüzgâraltı/üstü bodydrag, board ile tanışma.
3. **Deniz eğitimi** — yeterli kite kontrolü, board ile suda tanışma, pozisyon dengeleme, ilk kalkışlar, ilk kayışlar.
4. **Board eğitimi** — yalnız suya giriş, board ile kalkış, pozisyon düzeltme, kontrollü kayış/duruş.
5. **Kontrollü sürüş** — iki yöne kontrollü kayış/duruş, geri dönüş, vücut pozisyonu, bağımsız kiteboardcu.

Fiyat: Özel (10 saat) **700€** · saatlik birebir 80€ · 2 kişilik grup kişi başı 600€.

### B) Keşif & Devam Programı — 4 saat (rüzgârlı bir günde biter)
Kime: vakti az olan / başka yerde yarım kalan / seviye atlamak isteyen. 2 ders (50+50):
1. **Teori** — kite tanımı, emniyet, rüzgâr penceresi, küçük kite kara eğitim, 4 ipli büyük kite kurulumu.
2. **Kara→Deniz geçişi** — trapezle kite kontrolü, kite indirme/kaldırma, suya giriş, bodydrag.

Fiyat: Saatlik birebir 80€ üzerinden (4 saatlik keşif). Kesin paket fiyatı Volkan'a danışılır; site fiyatı (280€) geçersiz.

### C) İleri Seviye Programı — freeride / oldschool & newschool freestyle
1. **Rüzgârüstü sürüşler** — stil, doğru duruş, board kenarıyla su kesme, rüzgârüstüne çıkış, oturmadan dönüş.
2. **İleri sürüş** — ileri teknikler, ilk sıçrayışlar.
3. **Seçin öğretelim** — stil hareketler, oturmadan waterstart, sıçrayarak yön değiştirme, freestyle, dalga sürüş (isteğe bağlı).

Fiyat: Özel **80€/saat** · 2'li grup kişi başı 70€ · Coaching (talep üzerine).

> Tüm eğitimlerde ekipman, kask, telsiz dahil. Öğrenci sadece kişisel eşya + güneş gözlüğü getirir.

---

## 3. HİZMETLER (Supabase `services` + detay sayfa) — fiyatlar 2021, teyit gerek

**Ekipman satış:** Yeni/kullanılmış Slingshot. Her m² kite ve board mevcut.

**Kiralama:** Tam set (kite+board+harness) **80€/gün**. (Sitedeki eski kalem fiyatları geçersiz.) Sigorta opsiyonu için Volkan'a danışılır.

**Depolama:** Günlük **5€** (uzun süreli için Volkan'a danışılır).

**Tamir:** Hasarlı ekipman hızlı tamir servisi.

**Kite Safari:** 2 saatlik downwind macera; bot + bb talkin' ile Gökçeada'nın farklı sahilleri.

**Wakeboard:** Rüzgâr bitince tekne arkasında kendi ekipmanınla wakeboard / yeni teknikler.

**Masaj Terapi:** Klasik 1s 40€ / 30dk 25€ · Spor 1s 40€ / 30dk 25€ · İç Organ (Chi Nei Tsang) 45dk 65€ · Duygu Boşaltım 1s 70€ · Thai 1s 50€ · Face Lifting 20dk 25€ · Ayak 30dk 30€.

---

## 4. SPOT & RÜZGÂR (detay sayfa + ajan KB + rüzgâr özelliği)

**Neden Gökçeada:** Eski adı Imroz ("rüzgârlı ada"), mistik, doğal. Yoga, cafe kahvaltısı, flamingolar (10 dk), Milli Park dalış, Rum köyleri, özgür hayvanlar, gelincik tarlaları, sunset, ateş başında samanyolu.

**Rüzgâr (rüzgâr özelliği için kritik):**
- Yön: Volkite'tan denize bakınca yüz **kuzeydoğu = poyraz**. 24 saat karaya (onshore) eser → güvenli.
- Sezon başı/sonu güney rüzgârı açığa eserken zodiac kurtarma botu hazır.
- **Sezon boyu 15–25 knot.** Bazı sabahlar **+30 knot → dersler durur.**
- Günlük patern: sabah ~11:00 → 18–22 kn · öğlen 13:00–15:00 → ~10 kn (1 saat) · sonra 15+ kn · akşam 19:00 sonrası 20+ kn.
- **Sezon: Nisan–Kasım. Yüksek sezon: Temmuz–Ekim.**

> Bu veri `wind_bands` varsayılanlarını doğruluyor: başlangıç için ideal ~15-22 kn, +30 riskli/durur. Volkan eşikleri buna göre ayarlasın.

**Plaj/eğitim alanı:** Parktan 30 m. Sadece kitesurfe ayrılmış 50 m sığ deniz, 100 m kumsal, 4 km trafiksiz koy. 600 m şamandıralı özel eğitim alanı. Kara dersi geniş; deniz dersinde 50 m açıkta su belde.

**Konfor:** 24 saat rüzgâr (15-40 kn), dalga ya da düz su, elektrik + internet (uzaktan çalışma), cafe, sıcak duş, minder, sunset sürüşü (hava kararana dek), depo, akşam Surfer's Party.

---

## 5. CAFE ON SHORE (detay sayfa)

Dünya mutfağından seçilmiş, taze, kaliteli, sağlıklı menü. Cheesecake, trileçe, özel ekmekli burger, pizza. Kiteboard öncesi/sonrası. Doğum günü, barbekü ve grup partileri için özel menü + ateş. Ekip: Deniz Gönül, Sezen Pak, Zeynep Halisçelik.

---

## 6. KONAKLAMA (senden — siteye yeni eklenecek)

Okul yanı kamp: çadır/karavan, kahvaltılı 25€ / kahvaltısız 15€. Öğrencilik günlerinde %50 indirim. Ayrıca yakın köy/adada pansiyon, bungalov, otel için yönlendirme.

---

## 7. İLETİŞİM

Telefon/WhatsApp: +90 533 241 10 15 · Adres: Eşelek Köyü, Köy Sokağı 104/1, Gökçeada–Çanakkale · Instagram: @volkite · Facebook: /volkite · Canlı rüzgâr: kiting.live/kitesurf-spot/wave-gokceada-turkey

---

## 8. GÖRSELLER (mevcut — sonra değişecek)

Claude Design export'undaki gerçek fotoğraflar `/public/images/`'a kopyalanıp **placeholder olarak** kullanılsın; Volkan daha sonra değiştirir/çoğaltır. Yerleşim:

| Dosya | Yer |
|---|---|
| `hero-kite.jpg` | Hero (tam ekran, Ken Burns) |
| `about-kite.jpg` | Hakkımızda bölümü + `/hakkimizda` |
| `spot-kite.jpg` | Spot bölümü + `/spot-ruzgar` |
| `beach-lesson.jpg` | Eğitimler bölümü / galeri |
| `uploads/` (MRT_8681, Z62_0140, Z62_0361, Z62_0439) | Galeri & Instagram grid (orijinal kareler) |
| `volkite-logo-white.png` | Nav + footer (koyu zemin) |
| `volkite-logo.png` | Açık zeminli yerler |
| `volkite-octopus.png` | Favicon / ikon |

Galeri ve cafe grid'lerindeki placeholder gradyanları bu gerçek fotoğraflarla doldurulsun. Görseller `next/image` ile optimize edilsin (lazy load, responsive). İleride Volkan kitelens arşivinden yenilerini verince swap edilir.

---

## 9. NEREYE NE GİDER (Cline için yerleştirme)

- **Landing bölümleri (kısa):** hero, about özeti, 3 program kartı, hizmet grid, spot stat, cafe, yorumlar, lead form.
- **Detay alt sayfalar (tam içerik, SEO):** `/hakkimizda` (tarihçe + ekip), `/egitimler` (3 program tam müfredat + fiyat), `/hizmetler` (tüm hizmet + fiyat), `/spot-ruzgar` (rüzgâr + alan), `/mutfak`.
- **Supabase:** `packages` (3 program), `services`, `faq`, `site_settings`, `accommodation`/`equipment` fiyatları.
- **Ajan KB:** §1–§6 hepsi — ajan bunlardan derin cevap verir. `volkite-web-ajan.md`'deki bilgi tabanı bu güncel/detaylı içerikle değiştirilecek (özellikle 3 program + rüzgâr verisi).
- **301:** eski URL'ler (`/egitimler`, `/hizmetler`, `/spot-ve-ruzgar`, `/hakkimizda`, `/mutfak`, `/iletisim` + `/en/...`) yeni route'lara.
