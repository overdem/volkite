'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { FaqRow } from '@/lib/queries';

interface Props {
  faq?: FaqRow[] | null;
}

export default function Faq({ faq }: Props) {
  const t = useTranslations('faq');

  type FaqItem = { q: string; a: string };
  const items: FaqItem[] = faq ?? (t.raw('items') as FaqItem[]);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="sss" style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(64px,8vw,120px) clamp(20px,5vw,72px)' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', marginBottom: '16px', textTransform: 'uppercase' }}>
          {t('kicker')}
        </div>
        <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(34px,4.5vw,56px)', marginBottom: '40px' }}>
          {t('title')}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item, i) => (
            <div key={i} style={{ background: '#0c3346', border: '1px solid rgba(255,255,255,.08)', borderRadius: '14px', overflow: 'hidden' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', background: 'transparent', border: 'none', color: '#fbf6ec', fontFamily: 'Manrope, system-ui, sans-serif', fontSize: '17px', fontWeight: 700, textAlign: 'left', padding: '20px 22px', cursor: 'pointer' }}
                aria-expanded={open === i}
              >
                <span>{item.q}</span>
                <span style={{ color: '#14b8cf', fontSize: '24px', fontWeight: 400, flexShrink: 0, lineHeight: 1 }}>
                  {open === i ? '−' : '+'}
                </span>
              </button>
              <div
                style={{
                  overflow: 'hidden',
                  maxHeight: open === i ? '280px' : '0',
                  opacity: open === i ? 1 : 0,
                  transition: 'max-height .3s ease, opacity .25s ease',
                }}
              >
                <p style={{ color: '#bcd4de', fontSize: '15px', lineHeight: 1.65, padding: '0 22px 20px' }}>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
