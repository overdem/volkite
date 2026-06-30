'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

type WhatsappCta = { url: string; label: string };
type Msg = { role: 'user' | 'assistant'; content: string; whatsapp?: WhatsappCta };

const CONV_KEY = 'volkite_conv_id';
const MSG_KEY = 'volkite_chat_msgs';

function newConversationId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `c_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export default function ChatWidget() {
  const t = useTranslations('chat');
  const locale = useLocale();

  const [open, setOpen] = useState(false);
  // Lazy, SSR-safe reads from localStorage (no setState-in-effect).
  const [convId, setConvId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem(CONV_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(MSG_KEY);
      return saved ? (JSON.parse(saved) as Msg[]) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Persist thread
  useEffect(() => {
    if (messages.length === 0) return;
    try {
      localStorage.setItem(MSG_KEY, JSON.stringify(messages));
    } catch {
      /* ignore quota */
    }
  }, [messages]);

  // Autoscroll on new messages / typing
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending, open]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    // Ensure a conversation id exists (generated on first message).
    let id = convId;
    if (!id) {
      id = newConversationId();
      setConvId(id);
      try {
        localStorage.setItem(CONV_KEY, id);
      } catch {
        /* ignore */
      }
    }

    setInput('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setSending(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: id, content: text, locale }),
      });
      const data = (await res.json()) as { reply?: string; whatsapp?: WhatsappCta };
      const reply = (data.reply ?? '').trim();
      if (reply) {
        setMessages((m) => [...m, { role: 'assistant', content: reply, whatsapp: data.whatsapp }]);
      } else {
        setMessages((m) => [...m, { role: 'assistant', content: t('error') }]);
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: t('error') }]);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={t('launcher')}
          style={{
            position: 'fixed',
            right: 'clamp(16px,4vw,28px)',
            bottom: 'clamp(16px,4vw,28px)',
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#14b8cf',
            color: '#062131',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Manrope, system-ui, sans-serif',
            fontWeight: 800,
            fontSize: '15px',
            padding: '14px 20px',
            borderRadius: '999px',
            boxShadow: '0 14px 36px -10px rgba(20,184,207,.7)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5a8.38 8.38 0 0 1-.9-4 8.5 8.5 0 0 1 17 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('launcher')}
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label={t('title')}
          style={{
            position: 'fixed',
            right: 'clamp(12px,4vw,28px)',
            bottom: 'clamp(12px,4vw,28px)',
            zIndex: 60,
            width: 'min(380px, calc(100vw - 24px))',
            height: 'min(560px, calc(100vh - 24px))',
            display: 'flex',
            flexDirection: 'column',
            background: '#fbf6ec',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 24px 60px -16px rgba(6,33,49,.55)',
            border: '1px solid rgba(6,33,49,.12)',
          }}
        >
          {/* Header */}
          <div style={{ background: '#062131', color: '#fbf6ec', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#3ee07a', animation: 'pulse-dot 2s infinite', flexShrink: 0 }} aria-hidden="true" />
              <div>
                <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '18px', letterSpacing: '.02em', lineHeight: 1 }}>{t('title')}</div>
                <div style={{ fontSize: '11px', color: '#9fc0cf', marginTop: '3px' }}>{t('status')}</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Kapat"
              style={{ background: 'transparent', border: 'none', color: '#9fc0cf', cursor: 'pointer', fontSize: '22px', lineHeight: 1, padding: '2px 6px' }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Greeting (UI-only, not stored) */}
            <Bubble role="assistant">{t('greeting')}</Bubble>

            {messages.map((m, i) => (
              <Bubble key={i} role={m.role}>
                {m.content}
                {m.whatsapp && (
                  <a
                    href={m.whatsapp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '10px',
                      background: '#25D366',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '13px',
                      padding: '9px 14px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                    }}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    {m.whatsapp.label}
                  </a>
                )}
              </Bubble>
            ))}

            {sending && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '4px', padding: '12px 14px', background: '#fff', border: '1px solid #ece1cc', borderRadius: '14px 14px 14px 4px' }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8497a1', animation: `pulse-dot 1.2s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ borderTop: '1px solid #ece1cc', padding: '12px', display: 'flex', gap: '8px', alignItems: 'flex-end', flexShrink: 0, background: '#fbf6ec' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t('placeholder')}
              rows={1}
              style={{
                flex: 1,
                resize: 'none',
                maxHeight: '96px',
                border: '1px solid #ece1cc',
                borderRadius: '12px',
                padding: '11px 13px',
                fontFamily: 'Manrope, system-ui, sans-serif',
                fontSize: '14px',
                color: '#07283b',
                background: '#fff',
                outline: 'none',
              }}
            />
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              aria-label={t('send')}
              style={{
                flexShrink: 0,
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                border: 'none',
                background: input.trim() ? '#ff6a3d' : '#d8cdb8',
                color: '#fff',
                cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({ role, children }: { role: 'user' | 'assistant'; children: React.ReactNode }) {
  const isUser = role === 'user';
  return (
    <div
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        background: isUser ? '#14b8cf' : '#fff',
        color: isUser ? '#062131' : '#07283b',
        border: isUser ? 'none' : '1px solid #ece1cc',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        padding: '11px 14px',
        fontSize: '14px',
        lineHeight: 1.5,
        fontFamily: 'Manrope, system-ui, sans-serif',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {children}
    </div>
  );
}
