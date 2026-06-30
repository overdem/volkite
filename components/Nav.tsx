'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

const LOCALES = [
  { code: 'tr', label: 'Türkçe' },
  { code: 'en', label: 'English' },
  { code: 'bg', label: 'Български' },
  { code: 'ro', label: 'Română' },
] as const;

export default function Nav() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  // On the landing page use in-page anchors; from detail pages prefix with /
  const isLanding = pathname === '/';
  const a = (hash: string) => (isLanding ? hash : `/${hash}`);

  const navItems = [
    { label: t('lessons'), href: a('#egitimler') },
    { label: t('services'), href: a('#hizmetler') },
    { label: t('spot'), href: a('#spot') },
    { label: t('gallery'), href: a('#galeri') },
    { label: t('kitchen'), href: a('#mutfak') },
    { label: t('faq'), href: a('#sss') },
    { label: t('contact'), href: a('#rezervasyon') },
  ];

  function switchLocale(code: string) {
    router.replace(pathname, { locale: code });
    setLangOpen(false);
  }

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        padding: '16px clamp(20px,5vw,72px)',
        backdropFilter: 'blur(14px)',
        background: 'rgba(6,33,49,.42)',
        borderBottom: '1px solid rgba(255,255,255,.1)',
      }}
    >
      {/* Logo */}
      <a href={isLanding ? '#top' : '/'} aria-label="Volkite Kiteboard Okulu" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
        <Image src="/images/volkite-logo-white.svg" alt="Volkite" height={28} width={112} style={{ height: '28px', width: 'auto' }} priority />
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Desktop nav links */}
        <div
          className="navlinks"
          style={{ display: 'none', gap: '22px', alignItems: 'center' }}
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#dceaf0',
                opacity: 0.85,
                letterSpacing: '.01em',
                textDecoration: 'none',
                transition: 'opacity .2s, color .2s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLAnchorElement).style.opacity = '1';
                (e.target as HTMLAnchorElement).style.color = '#14b8cf';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLAnchorElement).style.opacity = '0.85';
                (e.target as HTMLAnchorElement).style.color = '#dceaf0';
              }}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Locale switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            style={{
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,.35)',
              background: 'transparent',
              color: '#fbf6ec',
              fontFamily: 'Manrope, system-ui, sans-serif',
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '.06em',
              padding: '8px 12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
            }}
            aria-label="Language selector"
          >
            {locale.toUpperCase()}
            <span style={{ fontSize: '8px', opacity: 0.7 }}>▼</span>
          </button>
          {langOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: '#0c3346',
                border: '1px solid rgba(255,255,255,.15)',
                borderRadius: '10px',
                overflow: 'hidden',
                minWidth: '148px',
                boxShadow: '0 16px 40px -12px rgba(0,0,0,.6)',
              }}
            >
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => switchLocale(l.code)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: l.code === locale ? 'rgba(20,184,207,.18)' : 'transparent',
                    border: 'none',
                    color: l.code === locale ? '#14b8cf' : '#dceaf0',
                    fontFamily: 'Manrope, system-ui, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    padding: '11px 16px',
                    cursor: 'pointer',
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <a
          href="#rezervasyon"
          style={{
            background: '#ff6a3d',
            color: '#fff',
            fontFamily: 'Manrope, system-ui, sans-serif',
            fontWeight: 800,
            fontSize: '14px',
            letterSpacing: '.02em',
            padding: '11px 20px',
            borderRadius: '10px',
            boxShadow: '0 8px 22px -8px rgba(255,106,61,.8)',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {t('cta')}
        </a>

        {/* Hamburger (mobile) */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
          }}
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: 'block',
                width: '22px',
                height: '2px',
                background: '#fbf6ec',
                borderRadius: '2px',
              }}
            />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(6,33,49,.96)',
            backdropFilter: 'blur(14px)',
            borderBottom: '1px solid rgba(255,255,255,.1)',
            padding: '20px clamp(20px,5vw,72px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#dceaf0',
                padding: '10px 0',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,.06)',
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .navlinks { display: flex !important; }
          .hamburger { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
