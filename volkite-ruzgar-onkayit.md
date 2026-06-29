# Volkite — Rüzgâr-Duyarlı Ön Kayıt (Ajan + Panel)

> Ajan, sohbetten öğrencinin **seviyesini** çıkarır → o seviyeye uygun **rüzgâr bandını** bilir → istenen tarihler için **rüzgâr tahminini** çeker → **müsaitliği** kontrol eder → en uygun günleri önerir → **ön kayıt** oluşturur. Volkan panelden onaylar. Mevcut köprü (`volkite-ajan-kopru.md`) ve panel üstüne biner.

---

## 0. Kritik kısıt — tahmin penceresi

Rüzgâr tahmini ~16 güne kadar (güvenilir ~7-10 gün). İki mod:

- **Pencere içi:** gerçek tahmin → günleri seviyeye göre skorla → somut gün önerisi.
- **Pencere dışı:** tahmin yok → mevsimsel/iklimsel rehber + ön kayıt → kesin günler yaklaşınca netleşir.

Ajan pencere dışı için **kesin rüzgâr garantisi vermez**; "muhtemel / şu an öyle görünüyor" dili kullanır.

---

## 1. Rüzgâr kaynağı — Open-Meteo (ücretsiz, anahtarsız)

Kefaloz koyu ≈ `40.18, 25.90`. Saatlik hız + hamle + yön, knot cinsinden:

```
https://api.open-meteo.com/v1/forecast
  ?latitude=40.18&longitude=25.90
  &hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m
  &wind_speed_unit=kn&forecast_days=14&timezone=Europe/Istanbul
```

Maliyet sıfır, API anahtarı yok. (kiting.live insan-yüzlü "canlı rüzgâr" linki olarak kalır; hesaplama Open-Meteo ile.)

---

## 2. Seviye → rüzgâr bandı (Supabase, Volkan ayarlar)

Rakamları **Volkan** belirler (2008'den beri eğitmen, asıl uzman). Aşağıdakiler mantıklı varsayılan, kod içine gömme — tablodan oku:

```sql
create table wind_bands (
  level      text primary key,   -- 'beginner' | 'intermediate' | 'advanced'
  min_kn     numeric,
  max_kn     numeric,
  max_gust_kn numeric,           -- üstü "sert/riskli"
  ideal_kn   numeric,
  note_tr    text
);
-- Varsayılan seed (Volkan teyit etsin):
-- beginner     : min 11, max 18, gust 22, ideal 14  → düzenli rüzgâr şart
-- intermediate : min 14, max 24, gust 28, ideal 18
-- advanced     : min 17, max 32, gust 40, ideal 24
```

**Önemli:** Yeni başlayan için **düzenlilik (hamle/hız oranı)** ham hızdan önemli. Skorlama, gün içi ortalama hız bandın içinde olsa bile hamleler `max_gust_kn`'i aşıyorsa o günü "sert/riskli" işaretler.

---

## 3. Müsaitlik / takvim

Eğitim birebir → günlük kapasite = aktif eğitmen × slot. MVP basit:

```
site_settings.daily_slots  int   -- örn. 4
o günün kalan slotu = daily_slots - (o gün provisional+confirmed booking sayısı)
```

İleride eğitmen-bazlı takvime genişler; şimdilik günlük slot yeter.

---

## 4. Şema — `bookings` (mevcut Supabase'e ekle)

```sql
create table bookings (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid references students(id),     -- ön kayıtta null olabilir
  name          text not null,
  contact       text,                             -- telefon/whatsapp
  language      text,                             -- tr/en/bg/ro
  level         text,                             -- wind_bands.level
  package_id    uuid references packages(id),
  requested_start date,
  requested_end   date,
  days_needed   int,                              -- 10s paket ≈ 3 gün
  proposed_dates  jsonb,    -- ajanın önerdiği günler
  wind_match      jsonb,    -- gün → {avg_kn, gust_kn, label}
  accommodation_needed boolean default false,
  status        text default 'provisional',       -- provisional | confirmed | cancelled
  source        text default 'agent',             -- agent | manual
  notes         text,
  created_at    timestamptz default now()
);
alter table bookings enable row level security;
-- yalnız panel (authenticated staff) okur/yazar; anon erişimi yok.
```

**Ön kayıt = `status:'provisional', source:'agent'`.** Panelde "Ön Kayıtlar" sekmesine düşer.

---

## 5. Ajan tarafı — köprüye eklenen iki tool

`api/agent` endpoint'ine Claude **tool-use** ile iki fonksiyon:

```ts
// 1) Rüzgâr + müsaitlik sorgusu
check_wind_and_availability({ level, date_from, date_to })
//   → her gün için: { date, remaining_slots, in_forecast,
//                     wind:{avg_kn,gust_kn,dir}, label:'ideal'|'uygun'|'zayıf'|'sert'|'mevsimsel' }
//   Open-Meteo'dan tahmini çeker, wind_bands ile karşılaştırır,
//   bookings'ten o günün dolu slotunu düşer.

// 2) Ön kayıt oluştur
create_provisional_booking({ name, contact, language, level, package_id,
                             requested_start, requested_end, days_needed,
                             proposed_dates, wind_match, accommodation_needed })
//   → bookings'e provisional satır. Panele lead olarak düşer.
```

Bu tool'ları köprü endpoint'i yürütür (Open-Meteo fetch + Supabase yaz). Claude sadece çağırır.

### Skorlama (basit)
```
label = 
  gün tahmin penceresi dışında            → 'mevsimsel'
  avg < min_kn                            → 'zayıf'
  gust > max_gust_kn                      → 'sert'
  min_kn ≤ avg ≤ max_kn ve gust ok        → ideal_kn'e yakınlığa göre 'ideal'/'uygun'
```

---

## 6. Ajan davranışı (system prompt'a ek)

- Önce öğren: **seviye** (sıfırdan mı, sürebiliyor mu), **tarih aralığı**, **kaç gün**, **iletişim**, konaklama lazım mı.
- `check_wind_and_availability` çağır.
- **Pencere içi:** somut öneri → "14-15 Temmuz senin seviyen için ideal görünüyor (≈14 kn, düzenli). 17'si hamleli/sert olabilir, onu önermem."
- **Pencere dışı:** "Temmuz ortası Gökçeada'da rüzgâr çok istikrarlıdır; sana o aralıkta ön kayıt açayım, kesin günleri yaklaşınca rüzgâra göre netleştiririz."
- Onay alınca `create_provisional_booking` → "Ön kaydını aldım 🤙 Volkan teyit edip seninle iletişime geçecek. Kesin gün ve ödeme onunla netleşir."
- Sonuna `[[HANDOFF]]` → konuşma Volkan'a düşer, iç nota özet (seviye, tarih, önerilen günler).
- **Asla** kesin rezervasyon/ödeme/garanti verme; ön kayıt = niyet, onay Volkan'da.

---

## 7. Panel — "Ön Kayıtlar"

`/panel/on-kayitlar`: provisional bookings listesi — isim, seviye, istenen tarih, ajanın önerdiği günler, rüzgâr etiketi, iletişim, konaklama. Her satırda **Onayla / Reddet**.
- Onayla → `status:'confirmed'`; yoksa `students` kaydı oluştur/bağla; ders ilerlemesi (5 derslik müfredat) bu öğrenciye açılır.
- Reddet → `cancelled` + opsiyonel sebep.

---

## 8. Dürüstlük / kısıt notları

- Rüzgâr tahmini olasılıktır → ajan kesinlik satmaz.
- Pencere dışı kesin rüzgâr yok → mevsimsel + "yaklaşınca netleşir".
- Kesin rezervasyon ve ödeme **insan onayıyla** (Volkan).
- Tüm seviye→rüzgâr eşikleri Volkan'ın ayarı; varsayılanlar başlangıç içindir.

---

## 9. Sıra

1. `wind_bands` + `bookings` tabloları + `daily_slots` (Cline).
2. Köprüye iki tool + skorlama + Open-Meteo fetch.
3. System prompt'a §6 davranışı.
4. Panel "Ön Kayıtlar" görünümü + onay akışı.
5. Volkan ile rüzgâr eşiklerini gerçek değerlere ayarla.
