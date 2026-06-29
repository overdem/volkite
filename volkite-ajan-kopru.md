# Volkite Ajan Botu — Köprü Build Brief (Etap 1)

> Çekirdek: Chatwoot'tan gelen mesajı alıp **Claude beyni**ne soran, cevabı geri yazan tek bir Next.js endpoint'i. Bu endpoint **hem web hem (Etap 2'de) WhatsApp** için aynıdır — değişen tek şey Chatwoot'taki inbox. Persona + bilgi tabanı için referans: `volkite-web-ajan.md`.

---

## 0. Akış

```
Müşteri (web widget) → Chatwoot Cloud → Agent Bot webhook → /api/agent
   → Supabase'den canlı bilgi + persona (system prompt) + sohbet geçmişi
   → Claude Haiku 4.5  → cevap → Chatwoot API → müşteriye geri
   → (rezervasyon/özel istek varsa) konuşmayı Volkan'a devret
```

Önemli: **Captain AI değil, Agent Bot.** Kendi beynimizi bağlıyoruz; Captain kredisi harcanmıyor.

---

## 1. Ortam değişkenleri (.env)

```
ANTHROPIC_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...        # server-side okuma
CHATWOOT_BASE_URL=https://app.chatwoot.com
CHATWOOT_BOT_TOKEN=...               # Agent Bot access token (aşağıda alınıyor)
AGENT_SHARED_SECRET=...              # webhook doğrulama için kendi ürettiğin gizli dize
```

---

## 2. Endpoint — `app/api/agent/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CW = process.env.CHATWOOT_BASE_URL!;
const BOT = process.env.CHATWOOT_BOT_TOKEN!;

// Persona + kurallar (volkite-web-ajan.md'den). STATİK → cache'lenir.
const SYSTEM_STATIC = `
Sen Volkite'ın dijital asistanısın... (volkite-web-ajan.md'deki system prompt'un
KİMLİK + GÖREV + DİLLER + DÜRÜSTLÜK + KESİN KURALLAR + HUNİ bölümleri buraya).

DAVRANIŞ: Broşür gibi değil, danışman gibi davran. Önce ihtiyacı anla — daha
önce kite yaptı mı, hangi tarihler, kaç gün, tek mi geliyor — sonra yönlendir.
Tüm bilgiyi tek mesajda dökme.

DEVİR: Müşteri rezervasyon yapmak istediğinde ya da kişiye özel/teyit gereken bir
şey olduğunda, sıcak bir kapanış mesajı yaz ve mesajın EN SONUNA tek başına
[[HANDOFF]] etiketi koy. Bu etiket müşteriye gösterilmez; konuşmayı Volkan'a
aktarır.
`.trim();

// Supabase'den CANLI bilgi tabanı — fiyatlar site ile tek kaynaktan senkron
async function buildKnowledge(): Promise<string> {
  const [pkgs, svcs, faq, settings] = await Promise.all([
    supabase.from("packages").select("*").eq("active", true).order("sort"),
    supabase.from("services").select("*").eq("active", true).order("sort"),
    supabase.from("faq").select("*").eq("active", true).order("sort"),
    supabase.from("site_settings").select("*").eq("id", 1).single(),
  ]);

  const lines: string[] = ["## CANLI BİLGİ TABANI"];
  lines.push("\n### EĞİTİM PAKETLERİ (EUR)");
  for (const p of pkgs.data ?? [])
    lines.push(`- ${p.name_tr}: ${p.price_eur}€ ${p.unit_tr ?? ""} — ${p.desc_tr ?? ""}`);
  lines.push("\n### HİZMETLER");
  for (const s of svcs.data ?? [])
    lines.push(`- ${s.name_tr}: ${s.desc_tr ?? ""}`);
  lines.push("\n### SSS");
  for (const f of faq.data ?? [])
    lines.push(`S: ${f.q_tr}\nC: ${f.a_tr}`);
  const st = settings.data;
  if (st)
    lines.push(`\n### İLETİŞİM\nTel/WhatsApp: ${st.phone}\nKonum: ${st.address_tr}\nSezon: ${st.season_tr}\nRüzgâr: yılın ~${st.windy_days} günü`);
  return lines.join("\n");
}

async function cw(path: string, body: object) {
  return fetch(`${CW}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", api_access_token: BOT },
    body: JSON.stringify(body),
  });
}

export async function POST(req: NextRequest) {
  // Basit webhook doğrulama
  if (req.nextUrl.searchParams.get("secret") !== process.env.AGENT_SHARED_SECRET)
    return NextResponse.json({ ok: false }, { status: 401 });

  const e = await req.json();

  // Sadece yeni GELEN (müşteri) mesajına yanıt ver
  if (e.event !== "message_created") return NextResponse.json({ ok: true });
  if (e.message_type !== "incoming") return NextResponse.json({ ok: true });

  const accountId = e.account?.id ?? e.conversation?.account_id;
  const convId = e.conversation?.id;
  if (!convId) return NextResponse.json({ ok: true });

  // İnsan zaten devraldıysa sus (open + bir agent atanmışsa)
  if (e.conversation?.status === "open" && e.conversation?.meta?.assignee)
    return NextResponse.json({ ok: true });

  // Sohbet geçmişi → Claude formatı (0=incoming/user, 1=outgoing/assistant)
  const history = (e.conversation?.messages ?? [])
    .filter((m: any) => m.message_type === 0 || m.message_type === 1)
    .map((m: any) => ({
      role: m.message_type === 0 ? "user" : "assistant",
      content: (m.content ?? "").trim(),
    }))
    .filter((m: any) => m.content);

  const kb = await buildKnowledge();

  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    system: [
      { type: "text", text: SYSTEM_STATIC, cache_control: { type: "ephemeral" } },
      { type: "text", text: kb },
    ],
    messages: history.length ? history : [{ role: "user", content: e.content ?? "" }],
  });

  let reply = res.content
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("\n")
    .trim();

  const handoff = reply.includes("[[HANDOFF]]");
  reply = reply.replace("[[HANDOFF]]", "").trim();

  // Cevabı gönder
  await cw(`/api/v1/accounts/${accountId}/conversations/${convId}/messages`, {
    content: reply,
    message_type: "outgoing",
  });

  // Gerekiyorsa Volkan'a devret
  if (handoff) {
    await cw(`/api/v1/accounts/${accountId}/conversations/${convId}/toggle_status`, {
      status: "open",
    });
    await cw(`/api/v1/accounts/${accountId}/conversations/${convId}/messages`, {
      content: "🤖→👤 Bot devretti: müşteri rezervasyon/özel istek aşamasında.",
      message_type: "outgoing",
      private: true, // iç not, müşteri görmez
    });
  }

  return NextResponse.json({ ok: true });
}
```

Paketler: `npm i @anthropic-ai/sdk @supabase/supabase-js`

---

## 3. Chatwoot kurulum adımları (dashboard)

1. **Chatwoot Cloud** hesabı aç (Startups, 15 gün ücretsiz deneme). Workspace oluştur.
2. **Website inbox** ekle: Settings → Inboxes → Add Inbox → Website. Adı "Volkite Web". Sonunda bir **widget script** verir — bunu sakla (§4).
3. **Agent Bot oluştur:** Settings → Agent Bots → Add (Cloud'da UI'de yoksa Platform API ile). 
   - Outgoing URL: `https://<site-domainin>/api/agent?secret=<AGENT_SHARED_SECRET>`
   - Oluşunca verdiği **access token**'ı kopyala → `.env`'de `CHATWOOT_BOT_TOKEN`.
4. **Botu inbox'a bağla:** Website inbox ayarları → Bot → "Volkite" botunu seç. Artık gelen web mesajları bota düşer.
5. Akış kontrolü: yeni konuşma → bota gider → bot cevaplar → `[[HANDOFF]]` çıkınca konuşma "open" olur ve Volkan'a görünür.

> Doğrulama: token gizli, URL'de `secret` parametresi var. İstersen Chatwoot'un HMAC imzasını da ekleyebilirsin (sonra).

---

## 4. Web widget'ı siteye gömme

Site build brief'indeki `ChatWidget.tsx` placeholder'ını, Chatwoot website widget script'iyle değiştir. Inbox kurulumunda verilen script `app/layout.tsx`'e (veya client component'e) eklenir:

```html
<script>
  (function(d,t){var s=d.createElement(t),x=d.getElementsByTagName(t)[0];
  s.src="https://app.chatwoot.com/packs/js/sdk.js";s.async=true;
  x.parentNode.insertBefore(s,x);s.onload=function(){
    window.chatwootSDK.run({websiteToken:"<INBOX_WEBSITE_TOKEN>",baseUrl:"https://app.chatwoot.com"});
  };})(document,"script");
</script>
```

Görsel: Chatwoot widget'ının renk/konumunu inbox ayarlarından `--sea` (#0E5F68) tonuna ayarla; prototipteki baloncuk hissine yaklaşır.

---

## 5. Test (Etap 1 bitti sayılır)

- [ ] Sitedeki widget'tan "merhaba" → bot Volkan sesiyle, ihtiyaç sorarak cevaplıyor.
- [ ] Fiyat sorusu → Supabase'deki **canlı** rakamı söylüyor (site ile aynı).
- [ ] Dil testi: EN / BG / RO mesaj → aynı dilde cevap.
- [ ] "Rezervasyon yapmak istiyorum" → bot sıcak kapanış + konuşma Volkan'a devrediliyor.
- [ ] Prompt caching çalışıyor (ikinci mesajda input maliyeti düşük).

---

## 6. Etap 2 bağlantısı (şimdi yapma, ama bil)

WhatsApp geldiğinde: Chatwoot'ta embedded signup ile **WhatsApp inbox** ekle → **aynı Agent Bot'u** o inbox'a da bağla. **Bu endpoint'te tek satır kod değişmez.** Beyin, persona, Supabase bilgisi, devir mantığı — hepsi ortak. Tek fark mesajın WhatsApp'tan girmesi.

Aynı şekilde Instagram/Messenger de (Faz 5) bu bota bağlanır.

---

## 7. Kapsam dışı (Etap 1)

- WhatsApp / Instagram / Messenger inbox bağlama (Etap 2+)
- Sesli not transkripsiyonu, medya işleme (sonra)
- Rezervasyon/ödeme otomasyonu (bot şimdilik Volkan'a devrediyor)
- Volkan'ın gerçek yazışmalarından few-shot persona ince ayarı → chat'ler gelince `SYSTEM_STATIC` güncellenecek (kod değişmez)
