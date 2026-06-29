'use client';

import { useEffect } from 'react';

const CHATWOOT_TOKEN = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN;
const CHATWOOT_BASE = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL ?? 'https://app.chatwoot.com';

declare global {
  interface Window {
    chatwootSDK?: { run: (opts: { websiteToken: string; baseUrl: string }) => void };
    chatwootSettings?: Record<string, unknown>;
  }
}

export default function ChatWidget() {
  useEffect(() => {
    if (!CHATWOOT_TOKEN) return;

    // Inject cyan color override for the launcher bubble (#14b8cf from design tokens)
    const style = document.createElement('style');
    style.id = 'cw-color-override';
    style.textContent = `.woot-widget-bubble,.woot-widget-bubble--unread-count{background-color:#14b8cf!important}`;
    document.head.appendChild(style);

    const s = document.createElement('script');
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

    return () => {
      document.getElementById('cw-color-override')?.remove();
      document.head.removeChild(s);
    };
  }, []);

  return null;
}
