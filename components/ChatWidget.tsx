'use client';

import { useEffect } from 'react';

const CHATWOOT_TOKEN = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN;
const CHATWOOT_BASE = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL ?? 'https://app.chatwoot.com';

// Chatwoot global types
declare global {
  interface Window {
    chatwootSDK?: { run: (opts: { websiteToken: string; baseUrl: string }) => void };
    chatwootSettings?: Record<string, unknown>;
  }
}

export default function ChatWidget() {
  useEffect(() => {
    if (!CHATWOOT_TOKEN) return;

    // Inject Chatwoot SDK
    const d = document;
    const s = d.createElement('script');
    s.src = `${CHATWOOT_BASE}/packs/js/sdk.js`;
    s.async = true;
    s.onload = () => {
      window.chatwootSettings = {
        hideMessageBubble: false,
        position: 'right',
        locale: document.documentElement.lang ?? 'tr',
        type: 'standard',
      };
      window.chatwootSDK?.run({ websiteToken: CHATWOOT_TOKEN!, baseUrl: CHATWOOT_BASE });
    };
    document.head.appendChild(s);
    return () => { d.head.removeChild(s); };
  }, []);

  // When Chatwoot is configured, it renders its own bubble — render nothing
  if (CHATWOOT_TOKEN) return null;

  // TODO (Faz 3): replace stub with Chatwoot widget after Chatwoot Cloud setup
  return <StubWidget />;
}

function StubWidget() {
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
      <a
        href="https://wa.me/905326101011"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp ile ulaş"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
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
          textDecoration: 'none',
          transition: 'transform .15s, box-shadow .15s',
        }}
      >
        🤙 WhatsApp
      </a>
    </div>
  );
}
