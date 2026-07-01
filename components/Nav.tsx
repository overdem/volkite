'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname, Link } from '@/i18n/navigation';

const LOCALES = [
  { code: 'tr', label: 'Türkçe' },
  { code: 'en', label: 'English' },
  { code: 'bg', label: 'Български' },
  { code: 'ro', label: 'Română' },
] as const;

// Hizmetler dropdown - anchor IDs correspond to sections in /hizmetler page
const HIZMETLER_ITEMS = [
  { label: 'Ekipman Satış', anchor: 'satis' },
  { label: 'Ekipman Kiralama', anchor: 'kiralama' },
  { label: 'Malzeme Depolama', anchor: 'depolama' },
  { label: 'Kite Tamiri', anchor: 'tamir' },
  { label: 'Kitesurf Safari', anchor: 'safari' },
  { label: 'Wakeboard', anchor: 'wakeboard' },
  { label: 'Masaj Terapi', anchor: 'masaj' },
  { label: 'Konaklama', anchor: 'konaklama' },
];

function openChat() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('volkite:open-chat'));
  }
}

export default function Nav() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function switchLocale(code: string) {
    router.replace(pathname, { locale: code });
    setLangOpen(false);
  }

  const linkStyle = {
    fontSize: '13px',
    fontWeight: 600,
    color: '#dceaf0',
    opacity: 0.85,
    letterSpacing: '.01em',
    textDecoration: 'none',
    transition: 'opacity .2s, color .2s',
    whiteSpace: 'nowrap' as const,
    fontFamily: 'Manrope, system-ui, sans-serif',
  };

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
        gap: '16px',
        padding: '14px clamp(16px,4vw,56px)',
        backdropFilter: 'blur(14px)',
        background: 'rgba(6,33,49,.42)',
        borderBottom: '1px solid rgba(255,255,255,.1)',
      }}
    >
      {/* Logo */}
      <Link href="/" aria-label="Volkite Kiteboard Okulu" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
        <Image src="/images/volkite-logo-white.svg" alt="Volkite" height={44} width={210} style={{ height: '44px', width: 'auto' }} priority />
      </Link>

      {/* Desktop nav */}
      <div className="navlinks" style={{ display: 'none', gap: '2px', alignItems: 'center', flex: 1, justifyContent: 'center', flexWrap: 'wrap' }}>

        {/* Biz Kimiz */}
        <Link href="/hakkimizda" style={linkStyle} onMouseEnter={e => { (e.target as HTMLAnchorElement).style.opacity='1'; (e.target as HTMLAnchorElement).style.color='#14b8cf'; }} onMouseLeave={e => { (e.target as HTMLAnchorElement).style.opacity='0.85'; (e.target as HTMLAnchorElement).style.color='#dceaf0'; }}>
          <span style={{ padding: '6px 8px', display: 'block' }}>{t('about')}</span>
        </Link>

        {/* Eğitimler */}
        <Link href="/egitimler" style={linkStyle} onMouseEnter={e => { (e.target as HTMLAnchorElement).style.opacity='1'; (e.target as HTMLAnchorElement).style.color='#14b8cf'; }} onMouseLeave={e => { (e.target as HTMLAnchorElement).style.opacity='0.85'; (e.target as HTMLAnchorElement).style.color='#dceaf0'; }}>
          <span style={{ padding: '6px 8px', display: 'block' }}>{t('lessons')}</span>
        </Link>

        {/* Hizmetler dropdown */}
        <div ref={servicesRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setServicesOpen(v => !v)}
            style={{ ...linkStyle, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 8px' }}
          >
            {t('services')}
            <span style={{ fontSize: '9px', opacity: 0.7 }}>▼</span>
          </button>
          {servicesOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: '#0c3346', border: '1px solid rgba(255,255,255,.12)', borderRadius: '12px', overflow: 'hidden', minWidth: '200px', boxShadow: '0 16px 40px -12px rgba(0,0,0,.7)', zIndex: 60 }}>
              {HIZMETLER_ITEMS.map(item => (
                <Link
                  key={item.anchor}
                  href={`/hizmetler#${item.anchor}`}
                  onClick={() => setServicesOpen(false)}
                  style={{ display: 'block', padding: '10px 18px', color: '#dceaf0', fontSize: '13px', fontWeight: 600, fontFamily: 'Manrope, system-ui, sans-serif', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,.05)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(20,184,207,.12)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Spot & Rüzgar */}
        <Link href="/spot-ruzgar" style={linkStyle} onMouseEnter={e => { (e.target as HTMLAnchorElement).style.opacity='1'; (e.target as HTMLAnchorElement).style.color='#14b8cf'; }} onMouseLeave={e => { (e.target as HTMLAnchorElement).style.opacity='0.85'; (e.target as HTMLAnchorElement).style.color='#dceaf0'; }}>
          <span style={{ padding: '6px 8px', display: 'block' }}>{t('spot')}</span>
        </Link>

        {/* Anlık Rüzgar — external */}
        <a href="https://kiting.live/spots/gokceada/" target="_blank" rel="noopener noreferrer" style={{ ...linkStyle, padding: '6px 8px', color: '#3ee07a', opacity: 1 }} onMouseEnter={e => { (e.currentTarget.style.opacity='0.75'); }} onMouseLeave={e => { (e.currentTarget.style.opacity='1'); }}>
          ⟳ {t('live_wind')}
        </a>

        {/* Mutfak */}
        <Link href="/mutfak" style={linkStyle} onMouseEnter={e => { (e.target as HTMLAnchorElement).style.opacity='1'; (e.target as HTMLAnchorElement).style.color='#14b8cf'; }} onMouseLeave={e => { (e.target as HTMLAnchorElement).style.opacity='0.85'; (e.target as HTMLAnchorElement).style.color='#dceaf0'; }}>
          <span style={{ padding: '6px 8px', display: 'block' }}>{t('kitchen')}</span>
        </Link>

        {/* Galeri */}
        <Link href="/galeri" style={linkStyle} onMouseEnter={e => { (e.target as HTMLAnchorElement).style.opacity='1'; (e.target as HTMLAnchorElement).style.color='#14b8cf'; }} onMouseLeave={e => { (e.target as HTMLAnchorElement).style.opacity='0.85'; (e.target as HTMLAnchorElement).style.color='#dceaf0'; }}>
          <span style={{ padding: '6px 8px', display: 'block' }}>{t('gallery')}</span>
        </Link>

        {/* Blog */}
        <Link href="/blog" style={linkStyle} onMouseEnter={e => { (e.target as HTMLAnchorElement).style.opacity='1'; (e.target as HTMLAnchorElement).style.color='#14b8cf'; }} onMouseLeave={e => { (e.target as HTMLAnchorElement).style.opacity='0.85'; (e.target as HTMLAnchorElement).style.color='#dceaf0'; }}>
          <span style={{ padding: '6px 8px', display: 'block' }}>{t('blog')}</span>
        </Link>

        {/* SSS */}
        <Link href="/sss" style={linkStyle} onMouseEnter={e => { (e.target as HTMLAnchorElement).style.opacity='1'; (e.target as HTMLAnchorElement).style.color='#14b8cf'; }} onMouseLeave={e => { (e.target as HTMLAnchorElement).style.opacity='0.85'; (e.target as HTMLAnchorElement).style.color='#dceaf0'; }}>
          <span style={{ padding: '6px 8px', display: 'block' }}>{t('faq')}</span>
        </Link>

        {/* İletişim */}
        <Link href="/#iletisim" style={{ ...linkStyle, padding: '6px 8px' }} onMouseEnter={e => { (e.currentTarget.style.opacity='1'); (e.currentTarget.style.color='#14b8cf'); }} onMouseLeave={e => { (e.currentTarget.style.opacity='0.85'); (e.currentTarget.style.color='#dceaf0'); }}>
          {t('contact')}
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {/* Locale switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            style={{ cursor: 'pointer', border: '1px solid rgba(255,255,255,.35)', background: 'transparent', color: '#fbf6ec', fontFamily: 'Manrope, system-ui, sans-serif', fontWeight: 700, fontSize: '12px', letterSpacing: '.06em', padding: '7px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}
            aria-label="Language selector"
          >
            {locale.toUpperCase()}
            <span style={{ fontSize: '8px', opacity: 0.7 }}>▼</span>
          </button>
          {langOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#0c3346', border: '1px solid rgba(255,255,255,.15)', borderRadius: '10px', overflow: 'hidden', minWidth: '140px', boxShadow: '0 16px 40px -12px rgba(0,0,0,.6)' }}>
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => switchLocale(l.code)}
                  style={{ width: '100%', textAlign: 'left', background: l.code === locale ? 'rgba(20,184,207,.18)' : 'transparent', border: 'none', color: l.code === locale ? '#14b8cf' : '#dceaf0', fontFamily: 'Manrope, system-ui, sans-serif', fontWeight: 600, fontSize: '13px', padding: '10px 14px', cursor: 'pointer' }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Rezervasyon CTA — opens chat widget */}
        <button
          onClick={openChat}
          style={{ background: '#ff6a3d', color: '#fff', fontFamily: 'Manrope, system-ui, sans-serif', fontWeight: 800, fontSize: '13px', letterSpacing: '.02em', padding: '10px 18px', borderRadius: '10px', boxShadow: '0 8px 22px -8px rgba(255,106,61,.8)', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          {t('cta')}
        </button>

        {/* Hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'flex', flexDirection: 'column', gap: '5px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
          aria-label="Menüyü aç"
          aria-expanded={menuOpen}
        >
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ display: 'block', width: '22px', height: '2px', background: '#fbf6ec', borderRadius: '2px' }} />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(6,33,49,.97)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,.1)', padding: '20px clamp(16px,4vw,56px)', display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '80vh', overflowY: 'auto' }}
        >
          {[
            { href: '/hakkimizda', label: t('about') },
            { href: '/egitimler', label: t('lessons') },
            { href: '/spot-ruzgar', label: t('spot') },
            { href: '/mutfak', label: t('kitchen') },
            { href: '/galeri', label: t('gallery') },
            { href: '/blog', label: t('blog') },
            { href: '/sss', label: t('faq') },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{ fontSize: '16px', fontWeight: 700, color: '#dceaf0', padding: '10px 0', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,.06)', fontFamily: 'Manrope, system-ui, sans-serif', display: 'block' }}
            >
              {item.label}
            </Link>
          ))}

          {/* Anlık Rüzgar (external) */}
          <a href="https://kiting.live/spots/gokceada/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '16px', fontWeight: 700, color: '#3ee07a', padding: '10px 0', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,.06)', fontFamily: 'Manrope, system-ui, sans-serif', display: 'block' }}>
            ⟳ {t('live_wind')}
          </a>

          {/* İletişim */}
          <Link href="/#iletisim" onClick={() => setMenuOpen(false)} style={{ fontSize: '16px', fontWeight: 700, color: '#dceaf0', padding: '10px 0', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,.06)', fontFamily: 'Manrope, system-ui, sans-serif', display: 'block' }}>
            {t('contact')}
          </Link>

          {/* Hizmetler accordion */}
          <div>
            <button
              onClick={() => setMobileServicesOpen(v => !v)}
              style={{ fontSize: '16px', fontWeight: 700, color: '#dceaf0', padding: '10px 0', borderBottom: mobileServicesOpen ? 'none' : '1px solid rgba(255,255,255,.06)', fontFamily: 'Manrope, system-ui, sans-serif', display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
            >
              {t('services')} <span style={{ fontSize: '10px' }}>{mobileServicesOpen ? '▲' : '▼'}</span>
            </button>
            {mobileServicesOpen && (
              <div style={{ paddingLeft: '16px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                {HIZMETLER_ITEMS.map(item => (
                  <Link
                    key={item.anchor}
                    href={`/hizmetler#${item.anchor}`}
                    onClick={() => setMenuOpen(false)}
                    style={{ fontSize: '14px', fontWeight: 600, color: '#9fc0cf', padding: '8px 0', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,.04)', fontFamily: 'Manrope, system-ui, sans-serif', display: 'block' }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Rezervasyon CTA */}
          <button
            onClick={() => { openChat(); setMenuOpen(false); }}
            style={{ marginTop: '16px', background: '#ff6a3d', color: '#fff', border: 'none', fontFamily: 'Manrope, system-ui, sans-serif', fontWeight: 800, fontSize: '16px', padding: '14px', borderRadius: '12px', cursor: 'pointer' }}
          >
            {t('cta')}
          </button>
        </div>
      )}

      <style>{`
        @media (min-width: 1024px) {
          .navlinks { display: flex !important; }
          .hamburger { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
