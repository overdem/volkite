'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ChatWidget() {
  const t = useTranslations('chat');
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
      {open && (
        <div
          style={{
            width: '320px',
            background: '#07283b',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 16px 64px rgba(7,40,59,.4)',
            animation: 'rise .25s ease',
          }}
        >
          <div style={{ background: '#0c3346', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#14b8cf', display: 'grid', placeItems: 'center', fontSize: '18px', flexShrink: 0 }}>🪁</div>
            <div>
              <div style={{ fontWeight: 800, color: '#fbf6ec', fontSize: '15px' }}>{t('title')}</div>
              <div style={{ fontSize: '12px', color: '#14b8cf' }}>● {t('status')}</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Kapat"
              style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#9fc0cf', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}
            >
              ×
            </button>
          </div>
          <div style={{ padding: '20px 18px' }}>
            <p style={{ color: '#bcd4de', fontSize: '14px', lineHeight: 1.65, margin: 0 }}>{t('soon')}</p>
            <a
              href="https://wa.me/905326101011"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '16px', background: '#25d366', color: '#fff', fontWeight: 800, fontSize: '14px', padding: '10px 18px', borderRadius: '10px', textDecoration: 'none' }}
            >
              WhatsApp →
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        aria-label={t('launcher')}
        style={{
          background: '#ff6a3d',
          color: '#fff',
          border: 'none',
          borderRadius: '999px',
          padding: '14px 22px',
          fontFamily: 'Manrope, system-ui, sans-serif',
          fontWeight: 800,
          fontSize: '15px',
          cursor: 'pointer',
          boxShadow: '0 6px 28px rgba(255,106,61,.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'transform .15s, box-shadow .15s',
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(255,106,61,.55)'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(255,106,61,.45)'; }}
      >
        <span>🪁</span> {t('launcher')}
      </button>
    </div>
  );
}
