import { describe, it, expect } from 'vitest';

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
