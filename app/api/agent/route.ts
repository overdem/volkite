import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { fetchWindForecast } from '@/lib/openmeteo';
import { scoreDay } from '@/lib/wind';
import type { WindBand } from '@/lib/wind';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const CW_BASE = process.env.CHATWOOT_BASE_URL ?? 'https://app.chatwoot.com';
const BOT_TOKEN = process.env.CHATWOOT_BOT_TOKEN ?? '';

// Static persona — cache_control: ephemeral keeps this in Anthropic's prompt cache
const SYSTEM_STATIC = `
# KİMLİK
Sen Volkite'ın dijital asistanısın. Gökçeada Kefaloz koyundaki kitesurf okulumuzun sesisin — kurucu Volkan Günel ve ekibin sıcak, samimi "biz/okulumuz" ağzıyla konuşursun. Ege misafirperverliği: içten, rahat, davetkâr, asla zorlayıcı değil. Ara ara hafif bir 🤙 kullanabilirsin, abartma.

# GÖREVİN
Asıl amacın: sohbetle ilgilenen kişiyi tanımak ve GERÇEKTEN istekli olanları bulmak (lead nitelendirme). Ziyaretçiyi merak uyandıran sorular ve çekici bilgilerle içine çek — spot, deneyim, "ne kadar kolay başlanıyor" gibi. İlk mesajda telefonu VERME. Önce sohbet et, bilgilendir, ilgiyi büyüt. Kişi gerçek niyet gösterdiğinde (gelmek/kayıt/tarih) ancak o zaman ön kayıt akışına gir.

# DAVRANIŞ
Bilgiyi tek seferde DÖKME. Önce ihtiyacı anla, sonra yönlendir. Karşılıklı, akan bir sohbet kur. Doğal biçimde öğren: seviye, ne zaman, kaç gün, tek mi, konaklama lazım mı? Aldığın cevaba göre çekici biçimde bilgilendir ve uygun programı öner.

# DİLLER
Kullanıcının yazdığı dili algıla ve AYNI dilde cevap ver. Desteklenenler: Türkçe, İngilizce, Bulgarca, Romence. Belirsiz/karışıksa İngilizce.

# DÜRÜSTLÜK
"Bot musun?" diye sorulursa içtenlikle asistan olduğunu, gerçek görüşme için Volkan'a ulaşabileceklerini söyle. Okul adına KESİN taahhüt verme.

# KESİN KURALLAR
- SADECE bilgi tabanındaki bilgileri kullan. Fiyat, tarih, müsaitlik UYDURMA.
- Bilmediğin ya da gerçek kişi gereken şeyde nazikçe söyle, 0533 241 10 15'e veya volkite.com'a yönlendir.
- Fiyatlar EUR. Kısa, sıcak, net ol. Pazarlama klişesi yok.

# RÜZGÂR-DUYARLI ÖN KAYIT
Kişi gerçek niyet gösterince (tarih+seviye belli, ders almak istiyor):
1. Öğren (henüz bilmiyorsan): seviye (hiç kite deneyimi yoksa 'beginner'), istenen tarih aralığı, kaç gün (~10 saatlik paket ≈ 3 gün), iletişim (telefon/WhatsApp), konaklama lazım mı.
2. check_wind_and_availability tool'unu çağır.
3. Sonuca göre yanıt ver:
   - Tahmin penceresi içi (label ≠ 'mevsimsel' günler var): somut gün öner — "14-15 Temmuz seninle için ideal (≈14kn, düzenli). 17'si sert olabilir, onu önermem." gibi.
   - Tüm günler 'mevsimsel' (pencere dışı): "O dönem Gökçeada rüzgârı çok istikrarlı olur; ön kayıt açayım, kesin günleri yaklaşınca netleştiririz."
4. Müşteri kabul edince create_provisional_booking tool'unu çağır.
5. "Ön kaydını aldım 🤙 Volkan seninle iletişime geçecek, kesin gün ve ödemeyi onunla netleştireceksin." de ve [[HANDOFF]] ekle.

RÜZGÂR KURALLARI:
- Kesin rezervasyon, ödeme veya rüzgâr garantisi VERME.
- Tahmin penceresi dışı için "muhtemelen / o dönem genellikle iyi" dili kullan.
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

// ─── Chatwoot helper ──────────────────────────────────────────────────────────

async function cw(path: string, body: Record<string, unknown>) {
  return fetch(`${CW_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', api_access_token: BOT_TOKEN },
    body: JSON.stringify(body),
  });
}

type CwMessage = { message_type: number; content?: string };

// ─── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (req.nextUrl.searchParams.get('secret') !== process.env.AGENT_SHARED_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const event = (await req.json()) as Record<string, any>;

  if (event['event'] !== 'message_created') return NextResponse.json({ ok: true });
  if (event['message_type'] !== 0) return NextResponse.json({ ok: true });

  const accountId = event['account']?.id ?? event['conversation']?.account_id;
  const convId = event['conversation']?.id;
  if (!convId || !accountId) return NextResponse.json({ ok: true });

  if (event['conversation']?.status === 'open' && event['conversation']?.meta?.assignee) {
    return NextResponse.json({ ok: true });
  }

  // Build conversation history
  const history = (
    (event['conversation']?.messages ?? []) as CwMessage[]
  )
    .filter((m) => m.message_type === 0 || m.message_type === 1)
    .map((m) => ({
      role: (m.message_type === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: (m.content ?? '').trim(),
    }))
    .filter((m) => m.content.length > 0);

  const currentContent = (event['content'] ?? '') as string;
  const baseMessages: Anthropic.MessageParam[] =
    history.length > 0 ? history : [{ role: 'user', content: currentContent }];

  const kb = await buildKnowledge();

  // Agentic loop — handles tool calls
  const msgs: Anthropic.MessageParam[] = [...baseMessages];
  let finalReply = '';
  let handoff = false;
  const MAX_ITER = 5;

  for (let iter = 0; iter < MAX_ITER; iter++) {
    const aiRes = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: [
        { type: 'text', text: SYSTEM_STATIC, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: kb },
      ],
      tools: TOOLS,
      messages: msgs,
    });

    if (aiRes.stop_reason === 'end_turn' || aiRes.stop_reason === 'stop_sequence') {
      finalReply = aiRes.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();
      handoff = finalReply.includes('[[HANDOFF]]');
      finalReply = finalReply.replace('[[HANDOFF]]', '').trim();
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

  if (!finalReply) return NextResponse.json({ ok: true });

  await cw(`/api/v1/accounts/${accountId}/conversations/${convId}/messages`, {
    content: finalReply,
    message_type: 'outgoing',
  });

  if (handoff) {
    await cw(`/api/v1/accounts/${accountId}/conversations/${convId}/toggle_status`, {
      status: 'open',
    });
    await cw(`/api/v1/accounts/${accountId}/conversations/${convId}/messages`, {
      content: '🤖→👤 Bot devretti: müşteri rezervasyon/ön kayıt aşamasında.',
      message_type: 'outgoing',
      private: true,
    });
  }

  return NextResponse.json({ ok: true });
}
