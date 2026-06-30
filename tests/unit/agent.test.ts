import { describe, it, expect } from 'vitest';
import {
  normalizeForClaude,
  buildClaudeMessages,
  type StoredMessage,
} from '@/lib/agent-history';
import { parseHandoff, buildWhatsappCta, WHATSAPP_NUMBER } from '@/lib/handoff';

// ─── [[HANDOFF]] parsing ───────────────────────────────────────────────────────

describe('[[HANDOFF]] ayrıştırma', () => {
  it('etiket yoksa handoff false', () => {
    const { reply, handoff } = parseHandoff('Merhaba, sana yardımcı olabilirim.');
    expect(handoff).toBe(false);
    expect(reply).toBe('Merhaba, sana yardımcı olabilirim.');
  });

  it('etiket varsa handoff true ve metinden çıkarılır', () => {
    const { reply, handoff } = parseHandoff('Hemen Volkan ile bağlantı kuruyorum. 🤙\n[[HANDOFF]]');
    expect(handoff).toBe(true);
    expect(reply).toBe('Hemen Volkan ile bağlantı kuruyorum. 🤙');
    expect(reply).not.toContain('[[HANDOFF]]');
  });

  it('sadece etiket varsa reply boş kalır', () => {
    const { reply, handoff } = parseHandoff('[[HANDOFF]]');
    expect(handoff).toBe(true);
    expect(reply).toBe('');
  });

  it('etiket ortada bile doğru çalışır', () => {
    const { reply, handoff } = parseHandoff('Teşekkürler [[HANDOFF]] görüşelim.');
    expect(handoff).toBe(true);
    expect(reply).toBe('Teşekkürler görüşelim.');
  });
});

// ─── WhatsApp CTA (handoff) ─────────────────────────────────────────────────────

describe('WhatsApp CTA', () => {
  it('doğru numara + ön-dolu mesajla wa.me linki üretir', () => {
    const cta = buildWhatsappCta('Volkan’a yaz', 'Merhaba! Ön kayıt hakkında.');
    expect(cta.label).toBe('Volkan’a yaz');
    expect(cta.url).toContain(`https://wa.me/${WHATSAPP_NUMBER}?text=`);
    expect(WHATSAPP_NUMBER).toBe('905332411015');
    expect(decodeURIComponent(cta.url.split('text=')[1])).toBe('Merhaba! Ön kayıt hakkında.');
  });
});

// ─── Widget isteği doğrulama (/api/agent) ──────────────────────────────────────

describe('Widget isteği doğrulama', () => {
  // /api/agent gövde doğrulamasını yansıtır: conversation_id + content zorunlu.
  const valid = (b: { conversation_id?: unknown; content?: unknown }) =>
    typeof b.conversation_id === 'string' &&
    b.conversation_id.trim().length > 0 &&
    b.conversation_id.length <= 100 &&
    typeof b.content === 'string' &&
    b.content.trim().length > 0;

  it('conversation_id + content varsa geçerli', () => {
    expect(valid({ conversation_id: 'abc-123', content: 'Merhaba' })).toBe(true);
  });

  it('boş content reddedilir', () => {
    expect(valid({ conversation_id: 'abc-123', content: '   ' })).toBe(false);
  });

  it('conversation_id yoksa reddedilir', () => {
    expect(valid({ content: 'Merhaba' })).toBe(false);
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
