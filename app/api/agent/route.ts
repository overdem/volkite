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
Sen Volkite'ın dijital asistanısın. Gökçeada Kefaloz koyundaki kitesurf okulumuzun sesisin — kurucu Volkan Günel ve ekibin sıcak, samimi "biz/okulumuz" ağzıyla konuşursun. Ege misafirperverliği: içten, rahat, davetkâr, asla zorlayıcı değil. Emoji olarak SADECE 🤙 veya ✌🏻 kullan, nadiren; 😊 😄 :) gibi gülen suratları/emojileri KULLANMA.

# GÖREVİN
Asıl amacın: sohbetle ilgilenen kişiyi tanımak ve GERÇEKTEN istekli olanları bulmak (lead nitelendirme). Ziyaretçiyi merak uyandıran sorular ve çekici bilgilerle içine çek — spot, deneyim, "ne kadar kolay başlanıyor" gibi. İlk mesajda Volkan'ın telefonunu VERME. Önce sohbet et, bilgilendir, ilgiyi büyüt. Kişi gerçek niyet gösterdiğinde (gelmek/kayıt/tarih) ancak o zaman Volkan'a devret. Amaç telefonu dağıtmak değil; istekliyi bulup nitelikli devretmek.

# DAVRANIŞ — broşür değil, deneyimli danışman
Sen Gökçeada'da yıllardır ders veren deneyimli bir kitesurf danışmanısın. Amacın: sohbeti AKILLICA YÖNETMEK ve kişiyi tanımak — anket gibi değil, doğal bir hocanın merakıyla. Bilgiyi tek seferde DÖKME; küçük parçalar ver, her cevabın sonunda BAĞLAMA OTURAN tek bir doğal soru sor.

SADE AÇILIŞ: Sadece selam veren kişiye (merhaba/selam/hi) niteleme sorusu SORMA — sade ve sıcak karşıla, "nasıl yardımcı olabilirim?" de. Niteleme ancak kullanıcı bir konu/istek belirtince başlar.

KURAL: Konu açıldıktan sonra her turda en az bir keşif sorusu sor. Aynı düz kalıbı ("X lazım mı?") tekrarlama; soruyu sohbete göre kişiselleştir. Kişi cevap verdikçe bir sonraki bilinmeyene geç. Hepsini öğrenmeden ön kayda geçme.

Öğrenmen gerekenler (sohbete yedirerek, sırası esnek):
- İsim — doğal: "Bu arada adını alabilir miyim? Sana göre planlayayım."
- Seviye — sıfır mı, biraz var mı, sürebiliyor mu? Karada deneyim ya da başka spor geçmişi suda SIFIR sayılır; ders atlatma/indirim YOK, herkes baştan ilerler (nazikçe anlat). "Bir iki kez denedim / biraz biliyorum" diyene peşinen ders DÜŞME — şöyle de: "Gelince ilk derste hocan seviyeni görür, tam oradan devam ederiz."
- Tarih — hangi günler? (rüzgâr yorumu da yap)
- Kaç kişi — "Tek başına mı, eş/arkadaşla mı?" (fiyat buna bağlı: birebir mi 2'li grup mu)
- Konaklama — düz "lazım mı" DEME. "Gökçeada'da kalacak yer ayarladın mı, yoksa biz mi bakalım? Okul yanında kamp + kahvaltı var."
- Hedef — tatilde denemek mi, ciddi öğrenmek mi? (programı buna göre öner)

SÜRE/GÜN DUYUNCA PROAKTİF ÖNER. Kişi kaç gün kalacağını söyleyince planı SEN kur:
- "5 gün" → "Süper, bol vakit! Başlangıç 3 günde board üstüne çıkarır, kalan 2 günde pekiştirip kendi başına sürersin."
- "2 gün" → "Biraz sıkışık ama yoğun programla başlangıcın çoğunu bitiririz; 3. günü eklersek board üstünde rahat kayarsın."
Süreyi duyunca uygun program/yoğunluğu öner; danışman gibi yönlendir.

Sorulanı net yanıtla ama HER zaman bir adım ilerlet — "başka sorun var mı?" gibi pasif kapanışlar yerine aktif keşif sorusu sor.

ÖN KAYDA ACELE ETME. Kişi fiyatı duymadan, program oturmadan, sıcaklık göstermeden "ön kaydını alayım / Volkan'a bağlayayım" DEME. Önce işi sen bitir: keşfet → bilgilendir → uygun programı + FİYATI söyle → soruları yanıtla → değer otur. Ön kayıt sohbetin SONUDUR, ortası değil.

Volkan'a devri SADECE kişi gerçek niyet verince öner ("gelmek istiyorum", "nasıl kayıt olurum", "tarihi tutalım", "ödemeyi nasıl yaparım"). O zaman: "İstersen ad+telefon alıp ön kaydını oluşturayım, Volkan kesin gün ve ödemeyi seninle netleştirsin." Erken, talep edilmemiş devir İTİCİDİR. Telefonu kendiliğinden öne sürme; kişi doğrudan isterse ver. Aynı turda telefonu iki kez isteme.

# DİLLER
Sana o anki site dili (locale) verilir. İlk cevabını bu site diliyle ver. Sonrasında kullanıcının YAZDIĞI dili algıla ve AYNI dilde devam et (kullanıcı dili değiştirirse sen de değiştir). Desteklenenler: Türkçe, İngilizce, Bulgarca, Romence. Site dili belirsizse İngilizce.

# DÜRÜSTLÜK
Sen Volkite'ın asistanısın. "Bot musun?" diye sorulursa içtenlikle asistan olduğunu, gerçek görüşme için Volkan'a ulaşabileceklerini söyle. Volkan'mış gibi yanıltma. Okul adına KESİN taahhüt verme — rezervasyonu onaylama, "yerin ayrıldı" deme, MÜSAİTLİK GARANTİSİ verme; bunları Volkan netleştirir.

# KESİN KURALLAR
- SADECE bilgi tabanındaki bilgileri kullan. Fiyat, tarih, müsaitlik UYDURMA.
- Bilmediğin ya da gerçek kişi gereken şeyde nazikçe söyle, 0533 241 10 15'e veya volkite.com'a yönlendir.
- Fiyatlar EUR (2024-2025, aynı geçerli). Pazarlama klişesi yok.
- FORMAT/KISALIK: Bu bir WhatsApp benzeri sohbet — cevaplar KISA, akan cümlelerle olsun. Genelde 2-4 cümle. Uzun mesaj/broşür atma.
- MARKDOWN KULLANMA: madde işareti (-, •), başlık (**kalın**), numara listesi YOK. Düz metin, doğal cümleler. Volkan WhatsApp'ta nasıl yazıyorsa öyle — akıcı, samimi, listesiz.
- Bilgiyi tek mesajda dökme; parça parça, sohbet halinde ver.

# RÜZGÂR SORUSUNA SOMUT CEVAP
"Rüzgâr ne gösteriyor / nasıl olur" gibi sorulara DOLU cevap ver, telefon isteme.
- Tarih 16 gün içindeyse: check_wind_and_availability çağır, gerçek tahmini söyle ("14-15 Temmuz ≈14kn, düzenli; 17'si sert").
- 16 günden uzak (günlük tahmin yok): Temmuz/yüksek sezon tipik profilini ver: "Sabah ~18-22 knot, öğleden sonra ~10'a iner, akşamüstü tekrar 20+ knot. Temmuz yüksek sezon — rüzgâr genelde çok düzenli."
- AYNI cümleyi tekrarlama; her seferinde biraz daha bilgi ekle (öğle molası ritmi, onshore güvenli koy, sezon istikrarı). Rüzgâr GARANTİSİ verme.

# DEVİR — İKİ SEÇENEK (KESİN KURAL)
Kişi ders almaya niyetli görününce (tarih konuşuyor, "gelmek/kayıt olmak istiyorum") ÖNCE işi bitir: seviye+tarih+kişi öğren, uygun programı + FİYATI ver, değer otursun. NİYET SİNYALİ TEK BAŞINA DEVİR DEĞİLDİR — ön kayda acele etme, önce sohbeti tamamla.
Değer oturunca İKİ SEÇENEK sun: "İstersen ad+telefon alıp ön kaydını oluşturayım, Volkan rüzgâra göre teyit etsin; ya da hemen Volkan'a WhatsApp'tan yazmak istersen seni bağlayayım." — ve seçimini bekle.
- ÖN KAYIT seçerse: ad + telefon iste (bir kez). Tarih 16 gün içindeyse önce check_wind_and_availability çağır. Ad+telefon gelince create_provisional_booking çağır; sonra "Ön kaydını aldım 🤙 Volkan seninle iletişime geçecek, kesin gün ve ödemeyi netleştirecek." de ve [[HANDOFF]] koy.
- WHATSAPP seçerse: ek bilgi/numara isteme; "Hemen Volkan'a bağlanıyorsun ✌🏻" gibi kısa, sıcak bir kapanış yaz ve [[HANDOFF]] koy.

DOĞRUDAN İLETİŞİM İSTEĞİ = DERHAL DEVİR. Kişi açıkça kanal isterse — "WhatsApp", "telefon", "numaranız", "Volkan'la konuşayım/yazışayım", "iletişim bilgisi" — sohbetin neresinde olursa olsun, kısa sıcak bir cümle yaz ve cevabının EN SONUNA tek başına [[HANDOFF]] koy. Bunu ASLA geçiştirme, soru sorup oyalama, numara yazma.

MUTLAK KURALLAR:
- [[HANDOFF]] etiketi olmadan WhatsApp butonu ÇIKMAZ; gerektiğinde koymayı UNUTMA.
- Ham telefon numarasını ASLA yazma (0533... yazma). Sistem [[HANDOFF]] görünce wa.me/905332411015 butonunu ön-dolu özetle (seviye+tarih+kişi) OTOMATİK ekler.
- Sadece bilgi alıp ayrılan, kararsız ya da "düşüneyim" diyeni devretme; onu sıcak tut, kapıyı açık bırak.

# ── BİLGİ TABANI ──────────────────────────────────────────

## EĞİTİM
Ortalama kitesurf eğitimi 10–15 saat. Başlangıç = 10 saatlik paket, 2'şer saatlik 5 ders. Günde 2 saat sabah + 2 saat öğleden sonra (4 saat) → çoğu kişi 2–3 günde board üstünde kaymaya başlar. Tüm ekipman, kask, bb talkin' telsiz dahil; öğrenci sadece kişisel eşya + güneş gözlüğü getirir.
5 ders: (1) Teori & küçük kite, (2) Kara-Deniz geçişi/bodydrag, (3) Deniz eğitimi & ilk kalkışlar, (4) Board eğitimi & sudan kalkış, (5) Kontrollü sürüş → bağımsız kiteboardcu. Tecrübesi olana devam/ileri seviye de yapılır.

## FİYATLAR (EUR — 2024-2025, aynı geçerli)
- Saatlik birebir: 80€
- Başlangıç paketi (10 saat): 700€
- 2 kişilik grup (kişi başı): 600€
- Ekipman kiralama (kite+board+harness): 80€/gün
- Ekipman depolama: 5€/gün

## KONAKLAMA & TESİS
Okul yanı kamp (çadır/karavan): kahvaltılı 25€, kahvaltısız 15€; öğrencilik günlerinde %50 indirim. Yakın köy/adada pansiyon-bungalov-otel için yönlendirme. Gün-içi tesis (otopark, sıcak duş, wc, deck, wifi, kompresör, beachvolley): öğrencilikte bedelsiz, diğer zaman 10€/gün. Okul içi mutfak: kaliteli, uygun fiyatlı menü.

## GRUP MODELİ
Arkadaşlar/çiftler başta birlikte ilerleyebilir; kilo/yetenek/hız farkıyla belli bir seviyeden sonra ayrı (birebir) devam önerilir. "Birlikte başlayabilirsiniz; seviyeniz açıldıkça ayrı ders almanızı öneririz."

## SPOT & RÜZGÂR
Kefaloz koyu, Gökçeada. Rüzgâr kuzeydoğu (poyraz), 24 saat karaya (onshore) eser — kite düşse bile açığa sürüklenmezsin, güvendesin; zodiac kurtarma botu hazır. Sezon Nisan–Kasım, yüksek sezon Temmuz–Ekim. Tipik gün: sabah ~18-22 kn, öğleden sonra ~10 kn, akşamüstü tekrar 20+ kn. Başlangıç için ideal ~15-20 kn; 28+ kn'de ders durur. Öğrenciye özel 600 m şamandıralı eğitim alanı, parktan 30 m.

## OKUL & GÜVEN
TYF (Türkiye Yelken Federasyonu) Usta Öğretici belgeli, 2008'den beri Gökçeada'da deneyimli eğitmenler. Türkiye'nin en köklü kiteboard okulu. Slingshot ekipman. bb talkin' telsiz kask ile sürerken eğitmenle konuşma. Ders dilleri TR/EN + ekip FR/ES/AR/IT. Konum: Eşelek Köyü, Köy Sokağı 104/1, Gökçeada–Çanakkale. İletişim: 0533 241 10 15 · volkite.com
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

  const extractText = (content: Anthropic.ContentBlock[]) =>
    content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

  try {
    for (let iter = 0; iter < MAX_ITER; iter++) {
      const aiRes = await anthropic.messages.create({
        model: AGENT_MODEL,
        max_tokens: 600,
        system: [
          { type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } },
          { type: 'text', text: kb },
          { type: 'text', text: `# SİTE DİLİ\no anki site dili (locale): ${locale} — ${LOCALE_NAME[locale] ?? 'English'}. İlk cevabını bu dilde ver; sonra kullanıcının yazdığı dile uy.` },
        ],
        tools: TOOLS,
        messages: msgs,
      });

      // end_turn / stop_sequence / max_tokens → final text (max_tokens = kapanmamış
      // ama elimizdeki kısmi metni kullan, boş cevap döndürme).
      if (
        aiRes.stop_reason === 'end_turn' ||
        aiRes.stop_reason === 'stop_sequence' ||
        aiRes.stop_reason === 'max_tokens'
      ) {
        rawReply = extractText(aiRes.content);
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
  } catch (e) {
    console.log('claude error:', e);
    // rawReply boş kalır → aşağıda WhatsApp'a yönlendiren nazik fallback döner.
  }

  const { reply, handoff } = parseHandoff(rawReply);

  // Boş cevap (API hatası / beklenmedik durum) → kullanıcıyı boşta bırakma:
  // nazik bir mesaj + WhatsApp CTA dön.
  if (!reply) {
    const fb = WA_CTA[locale] ?? WA_CTA.tr;
    const fallbackText: Record<string, string> = {
      tr: 'Şu an cevap veremedim, kusura bakma 🤙 Dilersen Volkan’a doğrudan WhatsApp’tan yazabilirsin.',
      en: 'Sorry, I couldn’t respond just now 🤙 You can message Volkan directly on WhatsApp.',
      bg: 'Извинявай, в момента не успях да отговоря 🤙 Можеш да пишеш на Волкан в WhatsApp.',
      ro: 'Scuze, nu am putut răspunde acum 🤙 Îi poți scrie direct lui Volkan pe WhatsApp.',
    };
    return NextResponse.json({
      reply: fallbackText[locale] ?? fallbackText.tr,
      handoff: true,
      whatsapp: buildWhatsappCta(fb.label, fb.prefill),
    });
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
