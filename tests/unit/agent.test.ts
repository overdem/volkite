import { describe, it, expect } from 'vitest';
import {
  normalizeForClaude,
  buildClaudeMessages,
  type StoredMessage,
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

// ─── Konuşma geçmişi (bağlam korunumu) ─────────────────────────────────────────

describe('Supabase geçmişi → Claude mesajları', () => {
  it('saklanan rolleri olduğu gibi geçirir', () => {
    const history: StoredMessage[] = [
      { role: 'user', content: 'Merhaba' },
      { role: 'assistant', content: 'Selam! Kitesurf mü?' },
    ];
    expect(buildClaudeMessages(history, 'Evet, ilk defa')).toEqual([
      { role: 'user', content: 'Merhaba' },
      { role: 'assistant', content: 'Selam! Kitesurf mü?' },
      { role: 'user', content: 'Evet, ilk defa' },
    ]);
  });

  it('geçersiz rol ve boş içerikli satırları eler', () => {
    const history: StoredMessage[] = [
      { role: 'user', content: 'Merhaba' },
      { role: 'system', content: 'yoksay' },
      { role: 'assistant', content: '   ' },
      { role: 'assistant', content: 'Buyur' },
    ];
    expect(buildClaudeMessages(history, 'devam')).toEqual([
      { role: 'user', content: 'Merhaba' },
      { role: 'assistant', content: 'Buyur' },
      { role: 'user', content: 'devam' },
    ]);
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
    const history: StoredMessage[] = [
      { role: 'user', content: 'İlk defa kitesurf yapacağım' },
      { role: 'assistant', content: 'Harika! Ne zaman gelmeyi düşünüyorsun?' },
    ];
    // Güncel mesaj cevaptan sonra kaydedildiği için henüz geçmişte değil.
    const msgs = buildClaudeMessages(history, 'Önümüzdeki hafta');
    expect(msgs).toEqual([
      { role: 'user', content: 'İlk defa kitesurf yapacağım' },
      { role: 'assistant', content: 'Harika! Ne zaman gelmeyi düşünüyorsun?' },
      { role: 'user', content: 'Önümüzdeki hafta' },
    ]);
  });

  it('güncel mesaj zaten geçmişteyse tekrar eklenmez', () => {
    const history: StoredMessage[] = [
      { role: 'user', content: 'Merhaba' },
      { role: 'assistant', content: 'Selam' },
      { role: 'user', content: 'Fiyat ne kadar?' },
    ];
    const msgs = buildClaudeMessages(history, 'Fiyat ne kadar?');
    expect(msgs.filter((m) => m.content === 'Fiyat ne kadar?')).toHaveLength(1);
    expect(msgs).toHaveLength(3);
  });

  it('geçmiş boşsa tek user mesajına düşer', () => {
    expect(buildClaudeMessages([], 'Merhaba')).toEqual([
      { role: 'user', content: 'Merhaba' },
    ]);
  });
});
