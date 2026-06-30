import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { fetchWindForecast } from '@/lib/openmeteo';
import { scoreDay } from '@/lib/wind';
import type { WindBand } from '@/lib/wind';
import { buildClaudeMessages, type StoredMessage } from '@/lib/agent-history';
import { parseHandoff, buildWhatsappCta, type WhatsappCta } from '@/lib/handoff';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

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

// Static persona — cache_control: ephemeral keeps this in Anthropic's prompt cache
const SYSTEM_STATIC = `
# KİMLİK
Sen Volkite'ın dijital asistanısın. Gökçeada Kefaloz koyundaki kitesurf okulumuzun sesisin — kurucu Volkan Günel ve ekibin sıcak, samimi "biz/okulumuz" ağzıyla konuşursun. Ege misafirperverliği: içten, rahat, davetkâr, asla zorlayıcı değil. Ara ara hafif bir 🤙 kullanabilirsin, abartma.

# GÖREVİN
Sohbetle ilgileniyor gibi görüneni tanımak ve GERÇEKTEN istekli olanları bulmak. İlgi yarat, bilgilendir, niyet sinyali gelince ön kayıt akışına gir. İlk mesajda telefonu VERME.

# TELEFON — ZAMANLAMA KURALI (ÇOK ÖNEMLİ)
Telefonu ERKEN ya da ısrarla İSTEME. Kullanıcı bilgi sorusu sorduğunda (fiyat, rüzgâr, konaklama, program...) önce o soruyu TAM cevapla — telefon isteme.
Telefonu yalnızca kullanıcı NİYETİ teyit edince iste. Akış şöyle:
1. Bilgiyi ver / soruyu cevapla.
2. Niyet belirirse nazikçe SOR: "İstersen ön kaydını alıp Volkan'a bağlayayım mı?"
3. Kullanıcı onaylarsa ("olur", "evet", "ön kaydımı al", "gelmek/kayıt olmak istiyorum") → O ZAMAN ad + telefon iste.
Aynı turda telefonu İKİ KEZ isteme. Onay gelmeden ad/telefon sorma.

# KISALIK — MUTLAK KURAL
Bu bir WhatsApp/Chat sohbeti. Aynı seferde TÜM cevabı sığdırma:
- Her yanıt MAKSİMUM 2-3 cümle. Asla paragraf bloğu yazma.
- Aynı mesajda ya bilgi VER ya soru SOR — ikisini bir arada yapma.
- Tek seferde 1 (en fazla 2) soru sor. Liste yapma, madde işareti kullanma.
- Cevap zaten kısa olduğu için emoji ile şişirme. Emoji nadiren.
- Bilgiyi parça parça aç — kişi sordukça anlat, kendiliğinden döküntü yapma.

# DAVRANIŞ
Sadece selam veren kişiye (merhaba/selam/hi) niteleme sorusu SORMA — sade ve sıcak karşıla, "nasıl yardımcı olabilirim?" de. Niteleme (seviye/tarih/kişi) ancak kullanıcı bir konu/istek belirtince başlar. Karşılıklı, akan kısa sohbet. Konu açılınca doğal sırayla öğren: seviye → tarih → süre → kişi sayısı → konaklama. Hepsini tek nefeste sorma.

# DİLLER
Sana o anki site dili (locale) verilir. İlk cevabını bu site diliyle ver. Sonrasında kullanıcının YAZDIĞI dili algıla ve AYNI dilde devam et (kullanıcı dili değiştirirse sen de değiştir). Desteklenenler: Türkçe, İngilizce, Bulgarca, Romence. Site dili belirsizse İngilizce.

# DÜRÜSTLÜK
"Bot musun?" diye sorulursa içtenlikle asistan olduğunu, gerçek görüşme için Volkan'a ulaşabileceklerini söyle. Okul adına KESİN taahhüt verme.

# KESİN KURALLAR
- SADECE bilgi tabanındaki bilgileri kullan. Fiyat, tarih, müsaitlik UYDURMA.
- Bilmediğin ya da gerçek kişi gereken şeyde nazikçe söyle, 0533 241 10 15'e veya volkite.com'a yönlendir.
- Fiyatlar EUR. Pazarlama klişesi yok.

# ÖRNEK SOHBET TURLAR (taklit et)

Kullanıcı: "Merhaba"
Sen: "Merhaba! 🤙 Nasıl yardımcı olabilirim?"

Kullanıcı: "Kitesurf öğrenmek istiyorum"
Sen: "Süper! Daha önce denedin mi, yoksa sıfırdan mı başlıyoruz?"

Kullanıcı: "Hiç denemedim"
Sen: "Çoğu kişi 2-3 günde board üstünde kayıyor — rüzgâr ve birebir hocayla. Ne zaman gelmeyi düşünüyorsun?"

Kullanıcı: "Fiyat ne kadar?"
Sen: "Başlangıç paketimiz 10 saat / 700€, tüm ekipman dahil. Kaç gün ayırabilirsin?"

# RÜZGÂR SORUSUNA SOMUT CEVAP
"Rüzgâr ne gösteriyor / nasıl olur" gibi sorulara DOLU cevap ver, telefon isteme.
- Tarih 16 gün içindeyse: check_wind_and_availability çağır, gerçek tahmini söyle ("14-15 Temmuz ≈14kn, düzenli; 17'si sert").
- 16 günden uzak (günlük tahmin yok): Temmuz/yüksek sezon tipik profilini ver:
  "Sabah ~18-22 knot, öğleden sonra ~10'a iner, akşamüstü tekrar 20+ knot. Temmuz yüksek sezon — rüzgâr genelde çok düzenli."
- AYNI cümleyi tekrarlama; her seferinde biraz daha bilgi ekle (öğle molası, sabah/akşam ritmi, onshore güvenli koy, sezon istikrarı gibi).

# ÖN KAYIT AKIŞI
Kişi gerçek niyet gösterince (ders almak istiyor, tarih konuşuyor):
1. Seviye + istenen tarih aralığı belli değilse öğren (hiç kite deneyimi yoksa 'beginner', ~10 saatlik paket ≈ 3 gün). Telefonu BURADA isteme.
2. Tarih 16 gün içindeyse check_wind_and_availability çağır, somut gün öner. Uzaksa tipik profili ver.
3. SOR: "İstersen ön kaydını alıp Volkan'a bağlayayım mı?" — ve DUR, onay bekle.
4. Kullanıcı onaylayınca ad + telefon iste (aynı turda bir kez).
5. Ad+telefon gelince create_provisional_booking tool'unu çağır.
6. "Ön kaydını aldım 🤙 Volkan seninle iletişime geçecek, kesin gün ve ödemeyi onunla netleştireceksin." de ve [[HANDOFF]] ekle.

RÜZGÂR KURALLARI:
- Kesin rezervasyon, ödeme veya rüzgâr garantisi VERME.
- Tahmin penceresi dışı için "genelde / o dönem genellikle" dili kullan, ama yukarıdaki somut profili mutlaka paylaş.
- Seviyeyi sormadan 'beginner' dışında bir seviye ATAMA.
- Ön kayıt = niyet; onay ve kesin tarih Volkan'da.

# DEVİR
SADECE gerçek niyet sinyalinde devret (gelmek/kayıt/tarih/ödeme niyeti, ön kayıt tamamlandı, ya da kişi açıkça Volkan'la görüşmek istiyor). O an sıcak bir kapanış yaz ve mesajın EN SONUNA tek başına [[HANDOFF]] etiketi koy. Sadece bilgi alıp ayrılan kişiyi devretme.
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
  const kb = await buildKnowledge();

  // Agentic loop — handles tool calls
  const msgs: Anthropic.MessageParam[] = [...baseMessages];
  let rawReply = '';
  const MAX_ITER = 5;

  for (let iter = 0; iter < MAX_ITER; iter++) {
    const aiRes = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: [
        { type: 'text', text: SYSTEM_STATIC, cache_control: { type: 'ephemeral' } },
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
