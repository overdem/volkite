# Volkite Panel Modülü — Rol Bazlı (admin / hoca / öğrenci)

> **Mevcut durum:** `/panel` herkese aynı "Hoca Paneli"ni gösteriyor. `profiles.role=admin` olsa bile admin'e özel görünüm YOK — admin ve hoca aynı sade paneli paylaşıyor. Bu brief rol bazlı tam modülü tanımlar. **Opus 4.8** ile yapılır. RLS kritik (KVKK).

## 1. Rol modeli (revize — Özdem onaylı)
- **admin (Özdem/Volkan):** her şeyi yönetir; **fotoğraf/video yükler ve öğrenciye atar**; ödemeleri, fiyatları, içeriği görür/düzenler.
- **hoca:** yeni öğrenci ekler; ders ilerlemesi işaretler; nakit ödeme işaretler. **Foto seçmez/yüklemez.** Telefondan (iPhone) kullanır → mobil öncelikli.
- **öğrenci:** kendi ilerlemesini ve **kendisine atanmış** medyayı görür; ödeme sonrası indirir.

## 2. Rol bazlı yönlendirme (asıl eksik olan)
- Giriş sonrası `profiles.role` oku.
- `admin` → **Admin shell** (tam menü, başlık "Admin Paneli").
- `hoca` → **Hoca shell** (sade menü, "Hoca Paneli", mobil öncelikli).
- `öğrenci/student` → `/ogrenci` portalına yönlendir (panele sokma).
- Yanlış rolle `/panel`'e gelen reddedilir/yönlendirilir.

## 3. Admin paneli (tam)
Menü: **Dashboard · Öğrenciler · Hocalar · Ön Kayıtlar · Ödemeler · Medya · Ayarlar** (· Blog — sonraki faz)
- **Dashboard:** aktif öğrenci, bekleyen ön kayıt, gelir özeti, son aktiviteler.
- **Öğrenciler:** liste + detay; ekle/düzenle; ilerleme; ödeme durumu; atanmış medya.
- **Hocalar:** hoca hesabı ekle/yönet (`role=hoca` profil oluştur).
- **Ön Kayıtlar:** rüzgâr-duyarlı ön kayıt (bookings) onay/red.
- **Ödemeler:** tüm ödemeler; nakit işaretleme; özet.
- **Medya:** foto/video **yükle (R2)** → öğrenciye **ata** → nakit ödeme sonrası **"indirilebilir" işaretle.** Orijinal private; önizleme filigranlı.
- **Ayarlar:** fiyatlar (site_settings/packages), genel ayarlar.

## 4. Hoca paneli (sade, mobil öncelikli)
Menü (iPhone alt sekme çubuğu): **Bugün · Öğrenciler · Ayarlar**
- **Bugün:** kendi öğrencileri / günün dersleri.
- **Öğrenciler:** **yeni öğrenci ekle**; ders ilerlemesi işaretle; nakit ödeme işaretle; not düş.
- **Foto/medya YOK** (admin'in işi).
- Büyük dokunma alanları, tek el kullanımı, sade.

## 5. Öğrenci portalı (/ogrenci, mobil)
- Magic-link giriş (Opus'un "doğrulanmadı" dediği akış — burada tam çalışır hale getir).
- Kendi ders ilerlemesi (lesson_progress).
- **Atanmış medya:** `downloadable=true` ise kısa ömürlü imzalı R2 URL ile indir; değilse filigranlı önizleme.
- Ödeme durumu, sonraki ders bilgisi.

## 6. Medya akışı (admin → öğrenci)
1. Admin foto/video yükler → R2 private bucket `volkite-media`; `student_media` kaydı (`student_id`, `key`, `type`, `downloadable=false`).
2. Admin medyayı öğrenciye atar (`student_id`).
3. Nakit ödeme alınınca admin **"indirilebilir"** işaretler (`downloadable=true`).
4. Öğrenci portalında: `downloadable=true` → imzalı URL ile indirir; değilse filigranlı önizleme.
- `/api/student/download`: imzalı URL üretir; **downloadable kontrolü + öğrenci kimliği doğrulaması** (başkasının medyası indirilemez).

## 7. RLS politikaları (KRİTİK — her tablo)
- **profiles:** kullanıcı kendi profilini okur; admin hepsini.
- **students:** hoca/admin yazar; öğrenci kendi kaydını okur.
- **lesson_progress:** öğrenci kendi ilerlemesini okur; hoca/admin yazar.
- **payments:** öğrenci kendi ödemesini okur; hoca/admin yazar.
- **student_media:** öğrenci SADECE kendine atanmış + `downloadable=true` olanı okur; admin hepsini yönetir; hoca erişmez.
- **bookings:** admin/hoca yönetir.
- **Genel kural:** hiçbir öğrenci başka öğrencinin satırını göremez/indiremez.

## 8. Kabul testleri (build sonu — Opus doğrulasın + Özdem elle)
1. **admin** ile giriş → "Admin Paneli", tam menü (Medya/Ödemeler/Hocalar dahil).
2. **hoca** ile giriş → "Hoca Paneli" sade, mobil.
3. hoca yeni öğrenci ekler → listede görünür.
4. admin foto yükler → öğrenciye atar → indirilebilir işaretler.
5. öğrenci magic-link giriş → kendi ilerlemesi + atanmış medya görünür.
6. **RLS sızıntı testi:** iki öğrenci; biriyle giriş, diğerinin verisi/medyasına id/URL ile erişmeyi DENE → **engellenmeli.**
7. ödenmemiş (`downloadable=false`) medya için imzalı indirme üretilememeli.

## 9. PWA (hoca için — modül çalışınca ayrı alt faz)
- Panel'i installable PWA yap: `manifest.json` + service worker + ikonlar (volkite ahtapot).
- iOS Safari "Ana Ekrana Ekle" → standalone, tam ekran, app hissi.
- Hoca shell mobil öncelikli (alt sekme çubuğu).
- Push bildirimi (iOS 16.4+) sonraya bırakılabilir.

---
**Opus'a ilk task sırası:** §2 rol yönlendirme + §3 admin paneli + §6 medya akışı + §7 RLS + §8 kabul testleri. Bunlar geçince → §9 PWA → sonra Blog + Instagram-assisted.
