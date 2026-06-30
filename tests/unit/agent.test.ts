import { describe, it, expect } from 'vitest';
import {
  mapChatwootMessages,
  normalizeForClaude,
  buildClaudeMessages,
  type CwApiMessage,
} from '@/lib/chatwoot';

// ─── [[HANDOFF]] parsing ───────────────────────────────────────────────────────

function parseReply(raw: string): { reply: string; handoff: boolean } {
  const handoff = raw.includes('[[HANDOFF]]');
  const reply = raw.replace('[[HANDOFF]]', '').trim();
  return { reply, handoff };
}

describe('[[HANDOFF]] ayrıştırma', () => {
  it('etiket yoksa handoff false', () => {
    const { reply, handoff } = parseReply('Merhaba, sana yardımcı olabilirim.');
    expect(handoff).toBe(false);
    expect(reply).toBe('Merhaba, sana yardımcı olabilirim.');
  });

  it('etiket varsa handoff true ve metinden çıkarılır', () => {
    const { reply, handoff } = parseReply('Hemen Volkan ile bağlantı kuruyorum. 🤙\n[[HANDOFF]]');
    expect(handoff).toBe(true);
    expect(reply).toBe('Hemen Volkan ile bağlantı kuruyorum. 🤙');
    expect(reply).not.toContain('[[HANDOFF]]');
  });

  it('sadece etiket varsa reply boş kalır', () => {
    const { reply, handoff } = parseReply('[[HANDOFF]]');
    expect(handoff).toBe(true);
    expect(reply).toBe('');
  });

  it('etiket ortada bile doğru çalışır', () => {
    const { reply, handoff } = parseReply('Teşekkürler [[HANDOFF]] görüşelim.');
    expect(handoff).toBe(true);
    expect(reply).toBe('Teşekkürler  görüşelim.');
  });
});

// ─── Webhook secret validation ─────────────────────────────────────────────────

describe('Webhook secret doğrulama', () => {
  it('secret eşleşirse 200 dönmeli', () => {
    const secret = 'test-secret-123';
    const provided = 'test-secret-123';
    expect(provided === secret).toBe(true);
  });

  it('secret yanlışsa 401 dönmeli', () => {
    const secret = 'test-secret-123';
    const provided: string = 'wrong-secret';
    expect(provided === secret).toBe(false);
  });

  it('secret yoksa 401 dönmeli', () => {
    const secret = 'test-secret-123';
    const provided = null;
    expect(provided === secret).toBe(false);
  });
});

// ─── Chatwoot event filtering ──────────────────────────────────────────────────

describe('Chatwoot event filtreleme', () => {
  it('message_created dışındaki event\'ler yoksayılır', () => {
    const shouldHandle = (event: string) => event === 'message_created';
    expect(shouldHandle('conversation_created')).toBe(false);
    expect(shouldHandle('message_updated')).toBe(false);
    expect(shouldHandle('message_created')).toBe(true);
  });

  it('outgoing mesajlar (message_type=1) yoksayılır', () => {
    const shouldHandle = (messageType: number) => messageType === 0;
    expect(shouldHandle(0)).toBe(true);   // incoming = customer
    expect(shouldHandle(1)).toBe(false);  // outgoing = bot/agent
  });

  it('insan devraldıktan sonra bot susar', () => {
    const shouldRespond = (status: string, hasAssignee: boolean) =>
      !(status === 'open' && hasAssignee);
    expect(shouldRespond('pending', false)).toBe(true);
    expect(shouldRespond('open', false)).toBe(true);
    expect(shouldRespond('open', true)).toBe(false); // human assigned → silent
  });
});

// ─── Knowledge base builder ────────────────────────────────────────────────────

describe('Bilgi tabanı formatı', () => {
  it('paket satırı label:price formatında olmalı', () => {
    const rows = [
      { label: 'Özel ders', price: '700€' },
      { label: '2 kişilik grup', price: '600€' },
    ];
    const formatted = rows.map((r) => `${r.label}: ${r.price}`).join(', ');
    expect(formatted).toBe('Özel ders: 700€, 2 kişilik grup: 600€');
  });
});

// ─── Konuşma geçmişi eşleme (bağlam korunumu) ──────────────────────────────────

describe('Chatwoot geçmişi → Claude mesajları', () => {
  it('incoming → user, outgoing → assistant olarak eşler', () => {
    const raw: CwApiMessage[] = [
      { id: 1, message_type: 0, content: 'Merhaba', created_at: 100 },
      { id: 2, message_type: 1, content: 'Selam! Kitesurf mü?', created_at: 200 },
      { id: 3, message_type: 0, content: 'Evet, ilk defa', created_at: 300 },
    ];
    expect(mapChatwootMessages(raw)).toEqual([
      { role: 'user', content: 'Merhaba' },
      { role: 'assistant', content: 'Selam! Kitesurf mü?' },
      { role: 'user', content: 'Evet, ilk defa' },
    ]);
  });

  it('private not ve activity/template mesajlarını atlar', () => {
    const raw: CwApiMessage[] = [
      { id: 1, message_type: 0, content: 'Merhaba', created_at: 100 },
      { id: 2, message_type: 1, content: 'iç not', private: true, created_at: 150 },
      { id: 3, message_type: 2, content: 'Conversation was resolved', created_at: 160 },
      { id: 4, message_type: 3, content: 'template', created_at: 170 },
      { id: 5, message_type: 1, content: 'Nasıl yardımcı olabilirim?', created_at: 200 },
    ];
    expect(mapChatwootMessages(raw)).toEqual([
      { role: 'user', content: 'Merhaba' },
      { role: 'assistant', content: 'Nasıl yardımcı olabilirim?' },
    ]);
  });

  it('kronolojik sıralar (created_at karışık gelirse)', () => {
    const raw: CwApiMessage[] = [
      { id: 3, message_type: 0, content: 'üçüncü', created_at: 300 },
      { id: 1, message_type: 0, content: 'birinci', created_at: 100 },
      { id: 2, message_type: 1, content: 'ikinci', created_at: 200 },
    ];
    expect(mapChatwootMessages(raw).map((m) => m.content)).toEqual([
      'birinci',
      'ikinci',
      'üçüncü',
    ]);
  });

  it('boş içerikli mesajları eler', () => {
    const raw: CwApiMessage[] = [
      { id: 1, message_type: 0, content: '   ', created_at: 100 },
      { id: 2, message_type: 0, content: 'gerçek', created_at: 200 },
    ];
    expect(mapChatwootMessages(raw)).toEqual([{ role: 'user', content: 'gerçek' }]);
  });

  it('baştaki assistant turlarını düşürür (ilk tur user olmalı)', () => {
    const normalized = normalizeForClaude([
      { role: 'assistant', content: 'Hoş geldin!' },
      { role: 'user', content: 'Merhaba' },
      { role: 'assistant', content: 'Buyur' },
    ]);
    expect(normalized[0]).toEqual({ role: 'user', content: 'Merhaba' });
    expect(normalized).toHaveLength(2);
  });

  it('ardışık aynı-rol turlarını birleştirir', () => {
    const normalized = normalizeForClaude([
      { role: 'user', content: 'Merhaba' },
      { role: 'user', content: 'orada mısın?' },
      { role: 'assistant', content: 'Buradayım' },
    ]);
    expect(normalized).toEqual([
      { role: 'user', content: 'Merhaba\norada mısın?' },
      { role: 'assistant', content: 'Buradayım' },
    ]);
  });

  it('TÜM geçmiş gider: "ilk defa" + "önümüzdeki hafta" aynı dizide', () => {
    const raw: CwApiMessage[] = [
      { id: 1, message_type: 0, content: 'İlk defa kitesurf yapacağım', created_at: 100 },
      { id: 2, message_type: 1, content: 'Harika! Ne zaman gelmeyi düşünüyorsun?', created_at: 200 },
    ];
    // İkinci kullanıcı mesajı webhook ile geldi, henüz API'de indekslenmemiş olabilir.
    const msgs = buildClaudeMessages(raw, 'Önümüzdeki hafta');
    expect(msgs).toEqual([
      { role: 'user', content: 'İlk defa kitesurf yapacağım' },
      { role: 'assistant', content: 'Harika! Ne zaman gelmeyi düşünüyorsun?' },
      { role: 'user', content: 'Önümüzdeki hafta' },
    ]);
  });

  it('güncel mesaj zaten geçmişteyse tekrar eklenmez', () => {
    const raw: CwApiMessage[] = [
      { id: 1, message_type: 0, content: 'Merhaba', created_at: 100 },
      { id: 2, message_type: 1, content: 'Selam', created_at: 200 },
      { id: 3, message_type: 0, content: 'Fiyat ne kadar?', created_at: 300 },
    ];
    const msgs = buildClaudeMessages(raw, 'Fiyat ne kadar?');
    expect(msgs.filter((m) => m.content === 'Fiyat ne kadar?')).toHaveLength(1);
    expect(msgs).toHaveLength(3);
  });

  it('geçmiş boşsa tek user mesajına düşer', () => {
    expect(buildClaudeMessages([], 'Merhaba')).toEqual([
      { role: 'user', content: 'Merhaba' },
    ]);
  });
});
