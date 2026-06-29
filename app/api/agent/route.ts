import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

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
Asıl amacın: sohbetle ilgilenen kişiyi tanımak ve GERÇEKTEN istekli olanları bulmak (lead nitelendirme). Ziyaretçiyi merak uyandıran sorular ve çekici bilgilerle içine çek — spot, deneyim, "ne kadar kolay başlanıyor" gibi. İlk mesajda telefonu VERME. Önce sohbet et, bilgilendir, ilgiyi büyüt. Kişi gerçek niyet gösterdiğinde (gelmek/kayıt/tarih) ancak o zaman devret.

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

# DEVİR
SADECE gerçek niyet sinyalinde devret (gelmek/kayıt/tarih/ödeme niyeti, ya da kişi açıkça Volkan'la görüşmek istiyor). O an sıcak bir kapanış yaz ve mesajın EN SONUNA tek başına [[HANDOFF]] etiketi koy. Sadece bilgi alıp ayrılan kişiyi devretme.
`.trim();

// Build live knowledge base from Supabase — same source as the website
async function buildKnowledge(): Promise<string> {
  const sb = supabase();
  const [pkgs, svcs, faq, settings] = await Promise.all([
    sb.from('packages').select('*').order('sort'),
    sb.from('services').select('*').order('sort'),
    sb.from('faq').select('*').order('sort'),
    sb.from('site_settings').select('*').eq('id', 1).single(),
  ]);

  const lines: string[] = ['## CANLI BİLGİ TABANI'];

  lines.push('\n### EĞİTİM PAKETLERİ');
  for (const p of pkgs.data ?? []) {
    const rows = (p.rows_tr as { label: string; price: string }[] | null) ?? [];
    const priceStr = rows.map((r) => `${r.label}: ${r.price}`).join(', ');
    lines.push(`- ${p.name_tr}: ${p.desc_tr ?? ''} [${priceStr}]`);
  }

  lines.push('\n### HİZMETLER');
  for (const s of svcs.data ?? []) {
    lines.push(`- ${s.name_tr}: ${s.desc_tr ?? ''}`);
  }

  lines.push('\n### SSS');
  for (const f of faq.data ?? []) {
    lines.push(`S: ${f.q_tr}\nC: ${f.a_tr}`);
  }

  const st = settings.data as Record<string, unknown> | null;
  if (st) {
    lines.push(
      `\n### İLETİŞİM & SPOT\nTel/WhatsApp: ${st['phone']}\nKonum: ${st['address_tr']}\nSezon: ${st['season_tr']}, yılın ~${st['windy_days']} günü rüzgârlı\nKoordinat: ${st['spot_coords']}`
    );
  }

  return lines.join('\n');
}

// Post to Chatwoot REST API
async function cw(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${CW_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      api_access_token: BOT_TOKEN,
    },
    body: JSON.stringify(body),
  });
  return res;
}

type CwMessage = { message_type: number; content?: string };

export async function POST(req: NextRequest) {
  // Webhook secret validation
  if (req.nextUrl.searchParams.get('secret') !== process.env.AGENT_SHARED_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const event = await req.json() as Record<string, any>;

  // Only handle new incoming (customer) messages
  if (event['event'] !== 'message_created') return NextResponse.json({ ok: true });
  if (event['message_type'] !== 0) return NextResponse.json({ ok: true }); // 0 = incoming

  const accountId = event['account']?.id ?? event['conversation']?.account_id;
  const convId = event['conversation']?.id;
  if (!convId || !accountId) return NextResponse.json({ ok: true });

  // If a human agent has already taken over, stay silent
  if (event['conversation']?.status === 'open' && event['conversation']?.meta?.assignee) {
    return NextResponse.json({ ok: true });
  }

  // Build messages array from conversation history
  const history: { role: 'user' | 'assistant'; content: string }[] = (
    (event['conversation']?.messages ?? []) as CwMessage[]
  )
    .filter((m) => m.message_type === 0 || m.message_type === 1)
    .map((m) => ({
      role: (m.message_type === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: (m.content ?? '').trim(),
    }))
    .filter((m) => m.content.length > 0);

  const currentContent = (event['content'] ?? '') as string;
  const messages =
    history.length > 0
      ? history
      : [{ role: 'user' as const, content: currentContent }];

  const kb = await buildKnowledge();

  const aiRes = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system: [
      { type: 'text', text: SYSTEM_STATIC, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: kb },
    ],
    messages,
  });

  let reply = aiRes.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('\n')
    .trim();

  const handoff = reply.includes('[[HANDOFF]]');
  reply = reply.replace('[[HANDOFF]]', '').trim();

  // Send reply to customer
  await cw(`/api/v1/accounts/${accountId}/conversations/${convId}/messages`, {
    content: reply,
    message_type: 'outgoing',
  });

  // If handoff requested: set conversation open + private note for Volkan
  if (handoff) {
    await cw(`/api/v1/accounts/${accountId}/conversations/${convId}/toggle_status`, {
      status: 'open',
    });
    await cw(`/api/v1/accounts/${accountId}/conversations/${convId}/messages`, {
      content: '🤖→👤 Bot devretti: müşteri rezervasyon/özel istek aşamasında.',
      message_type: 'outgoing',
      private: true,
    });
  }

  return NextResponse.json({ ok: true });
}
