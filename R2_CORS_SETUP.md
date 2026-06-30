# R2 CORS Yapılandırma — Volkite Medya Yüklemesi

Admin paneli foto/video yüklerken tarayıcı **doğrudan Cloudflare R2'ye** PUT eder. R2 bucket'ı bunu kabul etmesi için CORS politikası ayarlamak gerekir (bir kez yapılır).

## Adımlar

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **R2** → ilgili bucket'a tıkla
2. Sol menüden **Settings** → aşağı kaydır → **CORS Policy** bölümü
3. **Add CORS policy** → aşağıdaki JSON'u yapıştır → Save

```json
[
  {
    "AllowedOrigins": [
      "https://volkite.vercel.app",
      "https://volkite.com",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

**Origin'ler:**
- `https://volkite.vercel.app` — Vercel production URL'i
- `https://volkite.com` — özel domain (ileride bağladığında)
- `http://localhost:3000` — lokal geliştirme

Custom domain'in farklıysa burayı güncelle.

## Doğrulama

CORS politikası kaydedildikten sonra `/panel/medya` sayfasından bir foto yükleyip dene. Tarayıcı konsolunda CORS hatası görürsen:

- Origin yazımını kontrol et (`https://` olmalı, sonunda `/` olmamalı)
- Bucket'ın doğru projeden olduğundan emin ol
- R2 access key'ler env vars'la eşleşiyor mu

## Neden Vercel'den geçmiyoruz?

Vercel function body limiti **4.5 MB (Hobby)** veya **100 MB (Pro)**. Kite videoları rahatlıkla bu limiti aşar. R2'ye doğrudan upload limiti yok (5 TB tek nesne).

Server tarafı sadece **presigned URL** üretir (kısa ömürlü imzalı PUT URL'i) ve sonra DB kaydı yapar. Dosya bayt'ları Vercel'den geçmez.
