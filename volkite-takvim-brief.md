# Volkite — Rüzgâr-Duyarlı Takvim & Programlama (Build Brief)

> **Ön koşul:** Rol modülü (`volkite-panel-modul.md`) main'de çalışıyor ve kabul testinden geçti (admin/hoca ayrımı + RLS). Bu özellik onun üstüne biner. **Opus 4.8.**
> **Çerçeve:** Bu "kesin randevu sistemi" DEĞİL. Kitesurf'te saatler rüzgâra göre sürekli değişir. Takvim, **planlamaya fikir veren** bir araçtır — yakın günlerde güvenilir, uzakta yön gösterir. UI bunu açıkça anlatmalı; kimse "saat 14:00 garanti" sanmamalı.

## 1. Mevcut altyapı (yeniden kurma — kullan)
- `lib/openmeteo.ts`, `lib/wind.ts` — Open-Meteo entegrasyonu zaten var (lat 40.18, lon 25.90, Kefaloz).
- `wind_bands` tablosu — **seviye bazlı** (başlangıç/orta/ileri için ayrı uygun aralıklar). Takvimin renklendirmesi buna dayanır.
- Bu özellik = mevcut rüzgâr verisini panele "takvim görünümü" olarak bağlamak. Yeni entegrasyon değil.

## 2. Veri modeli (önerilen)
Yeni `sessions` (planlanan dersler) tablosu:
- `id`, `student_id` (FK), `instructor_id` (FK profiles), `scheduled_at` (timestamptz), `duration_hours`, `status` (planned/done/cancelled), `completed_at` (timestamptz, null), `wind_kn` (yapıldığında kaydedilen gerçek rüzgâr, opsiyonel), `note`.
- `bookings` (ön kayıt) ile bağ: hangi öğrenci hangi tarih aralığında geliyor → takvimde o öğrenciler önerilir.
- **Ders ilerleme tarihi:** `lesson_progress`'e `completed_at` ekle (her müfredat dersi yapıldığında tarih). Böylece §"tarih yok" sorunu kapanır — ders kartlarında planlanan/yapılan tarih görünür.

## 3. Takvim görünümü (hoca + admin)
- **Canlı rüzgâr chip'i:** Panelde anlık rüzgâr (Open-Meteo current) — hero'daki gibi.
- **Öğrenci seç → uygun saatler:** Seçilen öğrencinin **seviyesine** (wind_bands) göre, Open-Meteo **saatlik** tahmininden her saat renklenir:
  - 🟢 Yeşil = seviyeye ideal
  - 🟡 Sarı = sınırda
  - 🔴 Kırmızı = uygun değil (çok az rüzgâr / +30 fırtına)
- **3 GÜNLÜK net pencere:** Bu aralıkta tahmin güvenilir → hoca saat seçip ders planlayabilir (planned session oluşur).
- **3 GÜN SONRASI:** "genel eğilim" olarak soluk göster (örn. "sabahlar genelde uygun") — saate bağlama, sadece fikir. Planlama yapılsa bile "tahmini" etiketiyle.
- **Hoca seçer:** Uygun saate dokunur → session planned. Gün içinde rüzgâr değişirse anlık rüzgâra bakıp kaydırır/iptal eder.
- **UI uyarısı (ZORUNLU):** "Tahmin, garanti değil; rüzgâra göre değişebilir." Yakın günler "kesin", uzak günler "tahmini" rozetli.

## 4. Ders tamamlama akışı
- Hoca dersi yapınca: session `done` + `completed_at` = şimdi; ilgili müfredat dersini (`lesson_progress`) "tamamlandı" + `completed_at` işaretler; isterse o anki rüzgârı (`wind_kn`) ve not kaydeder.
- Ders kartlarında artık tarih görünür: planlanan + yapılan.

## 5. Roller & görünürlük
- **Hoca:** kendi sessions'ını görür/planlar/tamamlar; kendi öğrencilerinin takvimi.
- **Admin:** tüm hocaların takvimini görür/yönetir (kim, ne zaman, kiminle); çakışma/dağılım görünümü.
- **Öğrenci (portal):** kendi planlanan/yapılan derslerini ve tarihlerini görür (salt okuma).

## 6. RLS
- `sessions`: hoca kendi (instructor_id = kendisi) satırlarını okur/yazar; admin hepsini; öğrenci kendi (student_id = kendisi) satırlarını okur (salt).
- `lesson_progress`: öğrenci kendi ilerlemesini okur; hoca/admin yazar.
- Öğrenci başka öğrencinin sessions/ilerlemesini göremez.

## 7. Mobil (hoca iPhone)
- Takvim hoca panelinde alt sekme "Takvim". Mobil öncelikli: dikey gün listesi, renkli saat şeritleri, büyük dokunma alanları. Masaüstünde (admin) haftalık/çok-hocalı görünüm olabilir.

## 8. Kabul testleri
1. Öğrenci seç → seviyesine göre saatler renklensin (Open-Meteo + wind_bands seviye bazlı).
2. 3 gün içi planlanabilir; 3 gün sonrası "tahmini" rozetli, saate bağlanmaz.
3. Hoca saat seçer → planned session oluşur; ders kartında planlanan tarih görünür.
4. Ders tamamlanınca: session done + completed_at; müfredat ilerlemesi + tarih güncellenir.
5. Canlı rüzgâr chip'i anlık değeri gösterir.
6. **RLS:** bir hoca/öğrenci başka öğrencinin/hocanın sessions'ını GÖREMEZ.
7. Admin tüm hocaların takvimini görür.
8. UI'da "tahmin, garanti değil" uyarısı net.

---
**Not:** Open-Meteo saatlik tahmin ~7-16 gün verir ama güvenilirlik 1-3 günde yüksek. Renklendirmeyi 3 günde "kesin", sonrasında "eğilim" olarak ayır. wind_bands seviye bazlı değilse önce onu seviye bazlı yap (Volkan'ın eşikleri: başlangıç ~15-22 ideal, +30 herkese durur).
