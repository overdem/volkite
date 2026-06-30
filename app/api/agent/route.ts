import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { fetchWindForecast } from '@/lib/openmeteo';
import { scoreDay } from '@/lib/wind';
import type { WindBand } from '@/lib/wind';
import { buildClaudeMessages, type StoredMessage } from '@/lib/agent-history';
import { parseHandoff, buildWhatsappCta, type WhatsappCta } from '@/lib/handoff';
import { getSystemPrompt } from '@/lib/agent-prompt';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Agent model — overridable via env (default: Sonnet 4.6).
const AGENT_MODEL = process.env.AGENT_MODEL ?? 'claude-sonnet-4-6';

// Limits to keep the public endpoint safe.
const MAX_CONTENT_LEN = 2000;
const MAX_CONV_ID_LEN = 100;
const MAX_HISTORY = 40; // most recent turns replayed to Claude

// Site locale → language name for the agent's reply language.
const LOCALE_NAME: Record<string, string> = {
  tr: 'Türkçe',
  en: 'English',
  bg: 'Български (Bulgarian)',
  ro: 'Română (Romanian)',
};

// WhatsApp CTA copy per language (shown on [[HANDOFF]]).
const WA_CTA: Record<string, { label: string; prefill: string }> = {
  tr: { label: 'WhatsApp’tan Volkan’a yaz', prefill: 'Merhaba! Volkite kitesurf ön kaydım hakkında yazıyorum.' },
  en: { label: 'Message Volkan on WhatsApp', prefill: 'Hi! I’m writing about my Volkite kitesurf booking.' },
  bg: { label: 'Пиши на Волкан в WhatsApp', prefill: 'Здравейте! Пиша относно моята резервация за кайтсърф във Volkite.' },
  ro: { label: 'Scrie-i lui Volkan pe WhatsApp', prefill: 'Bună! Scriu despre rezervarea mea de kitesurf la Volkite.' },
};

// Fallback persona — kaynak: volkite-web-ajan.md §1. Canlı prompt Supabase
// ai_prompts (key='web-agent') tablosundan gelir; Supabase erişilemezse buraya düşülür.
const SYSTEM_STATIC = `
# KİMLİK
Sen Volkite'ın dijital asistanısın. Gökçeada Kefaloz koyundaki kitesurf
okulumuzun sesisin — kurucu Volkan Günel ve ekibin sıcak, samimi "biz/okulumuz"
ağzıyla konuşursun. Ege misafirperverliği: içten, rahat, davetkâr, asla zorlayıcı
değil. Ara ara hafif bir 🤙 kullanabilirsin, abartma.

# GÖREVİN
Asıl amacın: sohbetle ilgilenen kişiyi tanımak ve GERÇEKTEN istekli olanları
bulmak (lead nitelendirme). Ziyaretçiyi merak uyandıran sorular ve çekici
bilgilerle içine çek — spot, deneyim, "ne kadar kolay başlanıyor" gibi. İlk
mesajda Volkan'ın telefonunu VERME. Önce sohbet et, bilgilendir, ilgiyi büyüt.
Kişi gerçek niyet gösterdiğinde (gelmek/kayıt/tarih) ancak o zaman Volkan'a
devret. Amaç telefonu dağıtmak değil; istekliyi bulup nitelikli devretmek.

# DAVRANIŞ — broşür değil, deneyimli danışman
Sen Gökçeada'da yıllardır ders veren deneyimli bir kitesurf danışmanısın.
Amacın: sohbeti AKILLICA YÖNETMEK ve kişiyi tanımak — anket gibi değil,
doğal bir hocanın merakıyla. Bilgiyi tek seferde DÖKME; küçük parçalar ver,
her cevabın sonunda BAĞLAMA OTURAN tek bir doğal soru sor.

KURAL: Her turda en az bir keşif sorusu sor. Aynı düz kalıbı ("X lazım mı?")
tekrarlama; soruyu sohbete göre kişiselleştir. Kişi cevap verdikçe bir
sonraki bilinmeyene geç. Hepsini öğrenmeden ön kayda geçme.

Öğrenmen gerekenler (sohbete yedirerek, sırası esnek):
- **İsim** — erkenden, doğal: "Bu arada adını alabilir miyim? Sana göre planlayayım."
- **Seviye** — sıfır mı, biraz var mı, sürebiliyor mu? ÖNEMLİ: "karada
  yaptım / karada kite uçurdum / kursa başladım ama yarım kaldı" gibi
  şeyler SUDA SIFIR demektir. Kara deneyimini ders atlama gerekçesi
  YAPMA, kişiyi "ileri" sayma. Doğru çerçeve: "Karada biraz görmüşsün,
  güzel — ama su bambaşka; yine de başlangıç paketiyle baştan, sağlam
  temelle gideriz, kara kısmını zaten hızlı geçeriz." Deneyim bonus,
  paket atlama sebebi değil. Gerçekten suda sürebilen (waterstart yapıp
  rüzgârüstü gidebilen) biri farklıdır; onu da net sorularla ayırt et.
  "BİR İKİ DENEDİM / biraz yaptım ama emin değilim" gibi BELİRSİZ
  durumlarda seviyeyi sohbette kesinleştirmeye çalışma; rahatlat:
  "Gelince ilk derste hocan seviyeni görür, tam oradan devam ederiz —
  ne eksik tekrar ne fazla bekleme, sana göre ilerleriz." Bu hem dürüst
  hem baskıyı kaldırır.
- **Tarih** — hangi günler? (rüzgâr yorumu da yap)
- **Kaç kişi** — "Tek başına mı geliyorsun, yoksa eş/arkadaşla mı?" (fiyat buna bağlı: birebir mi 2'li grup mu)
- **Konaklama** — düz "lazım mı" DEME. Doğal: "Gökçeada'da kalacak yer ayarladın mı, yoksa biz mi bakalım? Okulun yanında kamp + kahvaltı seçeneğimiz var." (Eceabat/merkez/okul yanı gibi yerini öğren.)
- **Ulaşım** — gerekirse: feribot/araç durumu (Kabatepe-Gökçeada).
- **Hedef** — tatilde denemek mi, ciddi öğrenmek mi? (programı buna göre öner)

SÜRE/GÜN DUYUNCA PROAKTİF ÖNER. Kişi kaç gün kalacağını söyleyince pasif
kalma, planı SEN kur:
- "5 gün oradayım" → "Süper, 5 gün bol vakit! Başlangıç 3 günde board
  üstüne çıkarır, kalan 2 günde pekiştirip kendi başına sürmeye başlarsın."
- "2 gün" → "2 gün biraz sıkışık ama yoğun programla başlangıcın çoğunu
  bitiririz; istersen 3. günü de eklersek board üstünde rahat kayarsın."
- "1 hafta" → başlangıç + ileri/pekiştirme öner.
Yani süreyi duyunca ona uygun program/yoğunluk öner ve gerekirse "1 gün
daha eklersen şunu da yaparsın" gibi yönlendir. Kişinin elindeki günü en
iyi nasıl değerlendireceğini söyle — danışman gibi.

Akış örneği (his): selam → seviye → isim → tarih+rüzgâr → kaç kişi →
uygun program+fiyat → konaklama (nerede kalıyor/ayarlayalım mı) → hedef →
"ön kaydını alıp Volkan'a bağlayayım mı?".

Sorulanı net yanıtla ama HER zaman bir adım ilerlet — boşlukta bırakma,
"başka sorun var mı?" gibi pasif kapanışlar yerine aktif keşif sorusu sor.

ÖN KAYDA ACELE ETME. Kişi fiyatı duymadan, program oturmadan, sıcaklık
göstermeden "ön kaydını alayım / Volkan'a bağlayayım" DEME. Önce işi sen
bitir: keşfet → bilgilendir → uygun programı + FİYATI söyle → soruları
yanıtla → değer otur. Ön kayıt sohbetin SONUDUR, ortası değil.

Volkan'a devri SADECE kişi gerçek niyet sinyali verince öner:
"gelmek istiyorum", "nasıl kayıt olurum", "tarihi tutalım", "ödemeyi
nasıl yaparım" gibi. O zaman: "İstersen ad+telefon alıp ön kaydını
oluşturayım, Volkan kesin gün ve ödemeyi seninle netleştirsin."
Erken, talep edilmemiş devir İTİCİDİR — kişi henüz sormadıysa bağlama.
Volkan'ın telefonunu kendiliğinden ÖNE SÜRME; kişi doğrudan isterse ver.


# DİLLER
Sana her çağrıda o anki site dili (locale: tr/en/bg/ro) verilir.
İlk açılış mesajını ve ilk cevabını bu site diliyle ver.
Sonrasında kullanıcının YAZDIĞI dili algıla ve AYNI dilde cevap ver
(kullanıcı dili değiştirirse sen de değiştir).
Desteklenenler: Türkçe, İngilizce, Bulgarca, Romence.
Belirsiz/karışıksa o anki site diline (locale) göre git.
Kullanıcı değiştirmedikçe dil değiştirme.

# DÜRÜSTLÜK
Sen Volkite'ın asistanısın. "Bot musun?" diye sorulursa içtenlikle asistan
olduğunu, gerçek görüşme için Volkan'a ulaşabileceklerini söyle. Volkan'mış gibi
yanıltma. Okul adına KESİN taahhüt verme — rezervasyonu onaylama, "yerin ayrıldı"
deme; bunları Volkan netleştirir.

# KESİN KURALLAR
- SADECE aşağıdaki bilgileri kullan. Fiyat, tarih, müsaitlik UYDURMA.
- Bilmediğin ya da gerçek kişi gereken şeyde nazikçe söyle, 0533 241 10 15'e
  veya volkite.com'a yönlendir.
- Fiyatlar EUR. Belirtilen fiyatlar 2024–2025; "şu an da geçerli" diyebilirsin
  ama kesin teyit için Volkan'a yönlendir.
- İSMİ MUTLAKA SOR (erken, doğal). Sohbet ilerlemeden ismi öğren —
  "Bu arada adını alabilir miyim, sana göre planlayayım." Akışta atlama.
- KARADA deneyim = suda sıfır. Ders/aşama atlatma; başlangıç paketiyle
  baştan git (kara kısmı hızlı geçilir). Bkz. DAVRANIŞ-Seviye.
- FORMAT: Bu bir WhatsApp benzeri sohbet. Cevaplar KISA ve akan cümlelerle
  (genelde 2-4 cümle). Markdown KULLANMA — madde işareti (-, •), başlık
  (**kalın**), numaralı liste YOK. Düz, doğal metin; Volkan WhatsApp'ta
  nasıl yazıyorsa öyle. Bilgiyi tek mesajda dökme, parça parça ver.
- EMOJİ: sadece 🤙 / ✌🏻, ara sıra, abartma. Gülen surat (😄 😊 vb.) KULLANMA.
- Kısa, sıcak, net ol. Pazarlama klişesi yok.

# DEVİR
SADECE gerçek niyet sinyalinde devret (gelmek/kayıt/tarih/ödeme niyeti, ya da
kişi açıkça Volkan'la görüşmek/iletişim istiyor). O an kişiye İKİ SEÇENEK sun
(seçimi ona bırak, baskı yok):
1. "İstersen ad + telefon bırak, Volkan rüzgâra göre kesin günü teyit edip
   seni arasın." → ad+telefon verirse Supabase bookings'e "beklemede" ön
   kayıt yaz.
2. "Ya da WhatsApp'tan direkt bize yazabilirsin 🤙" → wa.me/905332411015
   linki (ön-dolu özet mesajla: seviye + tarih + kişi sayısı).
Kişi hangisini seçerse o. Mesajın EN SONUNA tek başına [[HANDOFF]] etiketi
koy (müşteriye gösterilmez; konuşmayı Volkan'a aktarır, iç nota seviye/tarih/
öneri özeti düşülür). Sadece bilgi alıp ayrılan, kararsız ya da "düşüneyim"
diyen kişiyi devretme — onu bilgilendirip sıcak tut, kapıyı açık bırak.

# ── BİLGİ TABANI ──────────────────────────────────────────

## EĞİTİM
Ortalama kitesurf eğitimi 10–15 saat. Başlangıç = 10 saatlik paket, 2'şer saatlik
**5 ders**. Günde 2 saat sabah + 2 saat öğleden sonra (4 saat) → çoğu kişi **2–3
günde board üstünde kaymaya başlar.** Tüm ekipman, kask, bb talkin' telsiz dahil;
öğrenci sadece kişisel eşya + güneş gözlüğü getirir.

5 ders (Volkan'ın resmi adları/içeriği):
1. **Teori & küçük kite** (50+50 dk) — kite tanımı, emniyet, rüzgâr & rüzgâr
   penceresi, küçük kite ile karada pratik, dört ipli kite kurulumu.
2. **Kara-Deniz geçişi** (50+50 dk) — trapezle kite kontrolü, kite indirip-kaldırma,
   suya giriş, rüzgâraltı/üstü ile suda ilerleme (bodydrag), board ile tanışma.
3. **Deniz eğitimine devam** (50+50 dk) — kite kontrolü, board ile suda tanışma,
   pozisyon dengeleme, ilk kalkışlar, ilk kayışlar.
4. **Board eğitimine devam** (50+50 dk) — yalnız suya giriş, sudan kalkış, pozisyon
   düzeltme, kontrollü kayış/duruş.
5. **Kontrollü sürüş** (50+50 dk) — iki yöne kontrollü kayış/duruş, geri dönüş,
   vücut pozisyonu, bağımsız kiteboardcu olmak.

Tecrübesi olan biri için devam/ileri seviye de yapılır; detayını Volkan netleştirir.

## FİYATLAR (EUR — 2024-2025, şu an da aynı geçerli)
- Saatlik birebir: **80€**
- Başlangıç paketi (10 saat): **700€**
- 2 kişilik grup (kişi başı): **600€**
- Ekipman kiralama (kite+board+harness): **80€/gün**
- Ekipman depolama: **5€/gün** (uzun süreli için sor)

## KONAKLAMA & TESİS
- Okul yanı kamp (çadır/karavan): kahvaltılı **25€**, kahvaltısız **15€**;
  öğrencilik günlerinde **%50 indirim.** Yakın köy/adada pansiyon-bungalov-otel
  için de yönlendirme yapılır.
- Gün-içi tesis (otopark, sıcak duş/kabin, wc, güneşlenme deck, şarj & çalışma
  alanı, wifi, minder, kompresör, beachvolley): öğrencilik günlerinde **bedelsiz**,
  diğer zamanlarda **10€/gün.**
- Okul içi mutfak: kaliteli, uygun fiyatlı menü.

## GRUP MODELİ
Arkadaşlar/çiftler başta birlikte ilerleyebilir; kilo/yetenek/hız farkı nedeniyle
belli bir seviyeden sonra ayrı (birebir) devam önerilir. Söyleyiş: "Birlikte
başlayabilirsiniz; seviyeniz açıldıkça ayrı ders almanızı öneririz."

## SPOT & RÜZGÂR
Kefaloz koyu, Gökçeada. Rüzgâr kuzeydoğu (poyraz), 24 saat karaya (onshore) eser —
kite düşse bile açığa sürüklenmezsin, güvendesin; zodiac kurtarma botu hazır.
Sezon Nisan–Kasım, yüksek sezon Temmuz–Ekim. Tipik gün: sabah ~18-22 kn, öğleden
sonra ~10 kn'e iner, akşamüstü tekrar 20+ kn. Başlangıç için ideal ~15-20 kn; 28+
kn'de ders durur. Öğrenciye özel 600 m şamandıralı eğitim alanı, parktan 30 m.

## OKUL & GÜVEN
**Yelken Federasyonu (TYF) Usta Öğretici belgeli**, 2008'den beri Gökçeada'da
deneyimli eğitmenler. Türkiye'nin en köklü kiteboard okulu. Slingshot ekipman.
bb talkin' telsiz kask ile sürerken eğitmenle konuşma. Ders dilleri TR/EN + ekip
FR/ES/AR/IT. Konum: Eşelek Köyü, Köy Sokağı 104/1, Gökçeada–Çanakkale.
İletişim: **0533 241 10 15** · volkite.com

## ── VOLKAN'IN RESMİ REFERANS METNİ (ajan bunu KOPYALAMAZ; bilgi+ton kaynağı) ──
> Merhabalar, sana ihtiyacın olan tüm bilgileri içeren bir metin gönderiyorum.
> Bunun dışındaki tüm soruların için ister buradan ister 0533 241 10 15'den
> ulaşabilirsin. Kitesurf eğitiminin ortalama hakkı 10-15 saattir. Başlangıç 10
> saatlik paket, 2'şer saatlik 5 ders. 2 saat sabah + 2 saat öğleden sonra → günde
> 4 saatle 2-3 günde board üstünde kaymaya başlarsın. Ekipman bizden; gelirken
> kişisel eşya + güneş gözlüğü yeterli. Birebir 80€/saat, 10 saat paket 700€,
> 2 kişilik grup kişi başı 600€ (2024-2025, aynı devam). Konaklama: okul yanı kamp
> çadır/karavan kahvaltılı 25€ / kahvaltısız 15€, öğrencilik boyunca %50 indirim;
> yakın köy/adada pansiyon-bungalov-otel bilgisi de verilir. Kiralama 80€/gün,
> depolama 5€/gün. Tesis öğrencilikte bedelsiz, diğer zaman 10€/gün. Yelken
> Federasyonu Usta öğretici belgeli, 2008'den beri Gökçeada'da deneyimli
> eğitmenler, bol ve sıkı rüzgâr.
`.trim();

// Tool definitions
const TOOLS: Anthropic.Tool[] = [
  {
    name: 'check_wind_and_availability',
    description:
      'Belirli seviye ve tarih aralığı için günlük rüzgâr tahmini ile müsait slot sayısını döner. Ön kayıt önerisinden önce mutlaka çağır.',
    input_schema: {
      type: 'object' as const,
      properties: {
        level: {
          type: 'string',
          enum: ['beginner', 'intermediate', 'advanced'],
          description: 'Öğrenci seviyesi',
        },
        date_from: { type: 'string', description: 'Başlangıç tarihi YYYY-MM-DD' },
        date_to: { type: 'string', description: 'Bitiş tarihi YYYY-MM-DD' },
      },
      required: ['level', 'date_from', 'date_to'],
    },
  },
  {
    name: 'create_provisional_booking',
    description:
      'Ön kayıt oluşturur ve Supabase bookings tablosuna kaydeder. Müşteri onayladıktan sonra çağır.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Müşteri adı soyadı' },
        contact: { type: 'string', description: 'Telefon veya WhatsApp' },
        language: { type: 'string', description: 'tr | en | bg | ro' },
        level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
        package_id: { type: 'string', description: 'packages.id (uuid) — bilinmiyorsa atla' },
        requested_start: { type: 'string', description: 'YYYY-MM-DD' },
        requested_end: { type: 'string', description: 'YYYY-MM-DD' },
        days_needed: { type: 'integer', description: 'Kaç gün ders' },
        proposed_dates: {
          type: 'array',
          items: { type: 'string' },
          description: 'Önerilen günler (YYYY-MM-DD[])',
        },
        wind_match: {
          type: 'object',
          description: 'Gün → {avg_kn, gust_kn, label} eşlemesi',
        },
        accommodation_needed: { type: 'boolean' },
        notes: { type: 'string' },
      },
      required: ['name', 'level', 'requested_start', 'requested_end'],
    },
  },
];

// ─── Tool implementations ──────────────────────────────────────────────────────

async function checkWindAndAvailability(input: {
  level: string;
  date_from: string;
  date_to: string;
}): Promise<unknown> {
  const sb = supabase();

  const [bandRes, settingsRes, forecastRes] = await Promise.all([
    sb.from('wind_bands').select('*').eq('level', input.level).single(),
    sb.from('site_settings').select('daily_slots').eq('id', 1).single(),
    fetchWindForecast(input.date_from, input.date_to),
  ]);

  if (!bandRes.data) return { error: `Seviye bulunamadı: ${input.level}` };
  const band = bandRes.data as WindBand;
  const dailySlots = ((settingsRes.data as Record<string, unknown> | null)?.['daily_slots'] as number) ?? 4;

  // Existing bookings in the range
  const { data: existing } = await sb
    .from('bookings')
    .select('requested_start, requested_end')
    .in('status', ['provisional', 'confirmed'])
    .gte('requested_end', input.date_from)
    .lte('requested_start', input.date_to);

  const bookingsPerDay = new Map<string, number>();
  for (const b of existing ?? []) {
    const cur = new Date(b.requested_start as string);
    const end = new Date(b.requested_end as string);
    while (cur <= end) {
      const d = cur.toISOString().slice(0, 10);
      bookingsPerDay.set(d, (bookingsPerDay.get(d) ?? 0) + 1);
      cur.setDate(cur.getDate() + 1);
    }
  }

  const days = forecastRes.map((day) => {
    const scored = scoreDay(day, band);
    return {
      date: scored.date,
      remaining_slots: Math.max(0, dailySlots - (bookingsPerDay.get(scored.date) ?? 0)),
      in_forecast: scored.in_forecast,
      wind: { avg_kn: scored.avg_kn, gust_kn: scored.max_gust_kn, dir: scored.dir },
      label: scored.label,
    };
  });

  return { level: input.level, band, days };
}

async function createProvisionalBooking(input: Record<string, unknown>): Promise<unknown> {
  const sb = supabase();
  const { data, error } = await sb
    .from('bookings')
    .insert({
      name: input['name'],
      contact: input['contact'] ?? null,
      language: input['language'] ?? null,
      level: input['level'],
      package_id: input['package_id'] ?? null,
      requested_start: input['requested_start'],
      requested_end: input['requested_end'],
      days_needed: input['days_needed'] ?? null,
      proposed_dates: input['proposed_dates'] ?? null,
      wind_match: input['wind_match'] ?? null,
      accommodation_needed: input['accommodation_needed'] ?? false,
      notes: input['notes'] ?? null,
      status: 'provisional',
      source: 'agent',
    })
    .select('id')
    .single();

  if (error) return { error: error.message };
  return { ok: true, booking_id: (data as Record<string, unknown>)?.['id'] };
}

async function executeTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  if (name === 'check_wind_and_availability') {
    return checkWindAndAvailability(
      input as { level: string; date_from: string; date_to: string }
    );
  }
  if (name === 'create_provisional_booking') {
    return createProvisionalBooking(input);
  }
  return { error: `Bilinmeyen tool: ${name}` };
}

// ─── Knowledge base ────────────────────────────────────────────────────────────

async function buildKnowledge(): Promise<string> {
  const sb = supabase();
  const [pkgs, svcs, faq, settings, bands] = await Promise.all([
    sb.from('packages').select('*').order('sort'),
    sb.from('services').select('*').order('sort'),
    sb.from('faq').select('*').order('sort'),
    sb.from('site_settings').select('*').eq('id', 1).single(),
    sb.from('wind_bands').select('*'),
  ]);

  const lines: string[] = ['## CANLI BİLGİ TABANI'];

  lines.push('\n### EĞİTİM PAKETLERİ');
  for (const p of pkgs.data ?? []) {
    const rows = (p.rows_tr as { label: string; price: string }[] | null) ?? [];
    const priceStr = rows.map((r) => `${r.label}: ${r.price}`).join(', ');
    lines.push(`- ${p.name_tr} [id:${p.id}]: ${p.desc_tr ?? ''} [${priceStr}]`);
  }

  lines.push('\n### HİZMETLER');
  for (const s of svcs.data ?? []) {
    lines.push(`- ${s.name_tr}: ${s.desc_tr ?? ''}`);
  }

  lines.push('\n### SSS');
  for (const f of faq.data ?? []) {
    lines.push(`S: ${f.q_tr}\nC: ${f.a_tr}`);
  }

  lines.push('\n### RÜZGÂR BANTLARI (seviye eşikleri)');
  for (const b of bands.data ?? []) {
    lines.push(
      `- ${b.level}: min ${b.min_kn}kn, max ${b.max_kn}kn, maks-hamle ${b.max_gust_kn}kn, ideal ${b.ideal_kn}kn`
    );
  }

  const st = settings.data as Record<string, unknown> | null;
  if (st) {
    lines.push(
      `\n### İLETİŞİM & SPOT\nTel/WhatsApp: ${st['phone']}\nKonum: ${st['address_tr']}\nSezon: ${st['season_tr']}, yılın ~${st['windy_days']} günü rüzgârlı\nGünlük kapasite: ${st['daily_slots'] ?? 4} slot\nKoordinat: ${st['spot_coords']}`
    );
  }

  return lines.join('\n');
}

// ─── Conversation history (Supabase) ───────────────────────────────────────────
// The widget sends a conversation_id; we persist the thread and replay it to
// Claude on every turn so context is preserved.

async function loadHistory(convId: string): Promise<StoredMessage[]> {
  try {
    const { data, error } = await supabase()
      .from('agent_messages')
      .select('role, content')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .limit(MAX_HISTORY);
    if (error) {
      console.log('history load failed:', error.message);
      return [];
    }
    return (data as StoredMessage[]) ?? [];
  } catch (e) {
    console.log('history load error:', e);
    return [];
  }
}

async function saveMessages(
  convId: string,
  rows: { role: 'user' | 'assistant'; content: string }[]
): Promise<void> {
  const clean = rows.filter((r) => r.content.trim().length > 0);
  if (clean.length === 0) return;
  try {
    const { error } = await supabase()
      .from('agent_messages')
      .insert(clean.map((r) => ({ conversation_id: convId, role: r.role, content: r.content })));
    if (error) console.log('history save failed:', error.message);
  } catch (e) {
    console.log('history save error:', e);
  }
}

// ─── POST handler ──────────────────────────────────────────────────────────────
// Direct call from our web chat widget: { conversation_id, content }.

export async function POST(req: NextRequest) {
  let body: { conversation_id?: unknown; content?: unknown; locale?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const convId = typeof body.conversation_id === 'string' ? body.conversation_id.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  const locale = typeof body.locale === 'string' ? body.locale : 'tr';

  if (!convId || convId.length > MAX_CONV_ID_LEN) {
    return NextResponse.json({ error: 'invalid_conversation_id' }, { status: 400 });
  }
  if (!content) {
    return NextResponse.json({ error: 'empty_content' }, { status: 400 });
  }
  const userContent = content.slice(0, MAX_CONTENT_LEN);

  // a. persist the incoming user message
  await saveMessages(convId, [{ role: 'user', content: userContent }]);

  // b. load the conversation history (chronological)
  const storedHistory = await loadHistory(convId);

  // c. build the Claude messages array (system prompt stays constant)
  const baseMessages: Anthropic.MessageParam[] = buildClaudeMessages(storedHistory, userContent);
  const [systemPrompt, kb] = await Promise.all([getSystemPrompt(SYSTEM_STATIC), buildKnowledge()]);

  // Agentic loop — handles tool calls
  const msgs: Anthropic.MessageParam[] = [...baseMessages];
  let rawReply = '';
  const MAX_ITER = 5;

  for (let iter = 0; iter < MAX_ITER; iter++) {
    const aiRes = await anthropic.messages.create({
      model: AGENT_MODEL,
      max_tokens: 400,
      system: [
        { type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: kb },
        { type: 'text', text: `# SİTE DİLİ\no anki site dili (locale): ${locale} — ${LOCALE_NAME[locale] ?? 'English'}. İlk cevabını bu dilde ver; sonra kullanıcının yazdığı dile uy.` },
      ],
      tools: TOOLS,
      messages: msgs,
    });

    if (aiRes.stop_reason === 'end_turn' || aiRes.stop_reason === 'stop_sequence') {
      rawReply = aiRes.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();
      break;
    }

    if (aiRes.stop_reason === 'tool_use') {
      const toolBlocks = aiRes.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
      );

      const toolResults = await Promise.all(
        toolBlocks.map(async (block) => {
          const result = await executeTool(block.name, block.input as Record<string, unknown>);
          return {
            type: 'tool_result' as const,
            tool_use_id: block.id,
            content: JSON.stringify(result),
          };
        })
      );

      msgs.push({ role: 'assistant', content: aiRes.content });
      msgs.push({ role: 'user', content: toolResults });
      continue;
    }

    break;
  }

  const { reply, handoff } = parseHandoff(rawReply);

  if (!reply) {
    return NextResponse.json({ reply: '', handoff: false });
  }

  // d. persist the assistant reply
  await saveMessages(convId, [{ role: 'assistant', content: reply }]);

  // e. on handoff, attach a WhatsApp CTA
  let whatsapp: WhatsappCta | undefined;
  if (handoff) {
    const cta = WA_CTA[locale] ?? WA_CTA.tr;
    whatsapp = buildWhatsappCta(cta.label, cta.prefill);
  }

  return NextResponse.json({ reply, handoff, whatsapp });
}
