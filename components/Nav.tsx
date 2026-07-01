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
  const [scrolled, setScrolled] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function switchLocale(code: string) {
    router.replace(pathname, { locale: code });
    setLangOpen(false);
  }

  const isActive = (href: string) => pathname === href;

  const NAV_LINKS = [
    { href: '/hakkimizda', label: t('about') },
    { href: '/egitimler', label: t('lessons') },
  ];
  const NAV_LINKS_2 = [
    { href: '/spot-ruzgar', label: t('spot') },
    { href: '/mutfak', label: t('kitchen') },
    { href: '/galeri', label: t('gallery') },
    { href: '/blog', label: t('blog') },
    { href: '/sss', label: t('faq') },
  ];

  return (
    <nav className={`vk-nav ${scrolled ? 'vk-nav--scrolled' : ''}`}>
      {/* Logo */}
      <Link href="/" aria-label="Volkite Kiteboard Okulu" className="vk-logo">
        <Image src="/images/volkite-logo-white.svg" alt="Volkite" height={44} width={210} className="vk-logo-img" priority />
      </Link>

      {/* Desktop nav */}
      <div className="navlinks">
        {NAV_LINKS.map((item) => (
          <Link key={item.href} href={item.href} className={`vk-link ${isActive(item.href) ? 'vk-link--active' : ''}`}>
            {item.label}
          </Link>
        ))}

        {/* Hizmetler dropdown */}
        <div ref={servicesRef} className="vk-dd-wrap">
          <button
            onClick={() => setServicesOpen((v) => !v)}
            className={`vk-link vk-dd-trigger ${pathname === '/hizmetler' ? 'vk-link--active' : ''}`}
            aria-expanded={servicesOpen}
          >
            {t('services')}
            <span className={`vk-chevron ${servicesOpen ? 'vk-chevron--open' : ''}`} aria-hidden="true">▾</span>
          </button>
          {servicesOpen && (
            <div className="vk-dropdown">
              {HIZMETLER_ITEMS.map((item) => (
                <Link
                  key={item.anchor}
                  href={`/hizmetler#${item.anchor}`}
                  onClick={() => setServicesOpen(false)}
                  className="vk-dditem"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {NAV_LINKS_2.map((item) => (
          <Link key={item.href} href={item.href} className={`vk-link ${isActive(item.href) ? 'vk-link--active' : ''}`}>
            {item.label}
          </Link>
        ))}

        {/* Anlık Rüzgar — external */}
        <a href="https://kiting.live/spots/gokceada/" target="_blank" rel="noopener noreferrer" className="vk-link vk-link--live">
          <span className="vk-live-dot" aria-hidden="true" />
          {t('live_wind')}
        </a>

        {/* İletişim */}
        <Link href="/#iletisim" className="vk-link">{t('contact')}</Link>
      </div>

      <div className="vk-right">
        {/* Locale switcher */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setLangOpen(!langOpen)} className="vk-lang" aria-label="Dil seçimi">
            {locale.toUpperCase()}
            <span className={`vk-chevron ${langOpen ? 'vk-chevron--open' : ''}`} aria-hidden="true">▾</span>
          </button>
          {langOpen && (
            <div className="vk-dropdown vk-dropdown--right">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => switchLocale(l.code)}
                  className={`vk-dditem ${l.code === locale ? 'vk-dditem--active' : ''}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Rezervasyon CTA */}
        <button onClick={openChat} className="vk-cta">{t('cta')}</button>

        {/* Hamburger */}
        <button
          className="hamburger vk-burger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menüyü aç"
          aria-expanded={menuOpen}
        >
          <span className={menuOpen ? 'vk-burger-x1' : ''} />
          <span className={menuOpen ? 'vk-burger-x2' : ''} />
          <span className={menuOpen ? 'vk-burger-x3' : ''} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="vk-mobile">
          {[...NAV_LINKS, ...NAV_LINKS_2].map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="vk-mlink">
              {item.label}
            </Link>
          ))}

          <a href="https://kiting.live/spots/gokceada/" target="_blank" rel="noopener noreferrer" className="vk-mlink vk-mlink--live">
            <span className="vk-live-dot" aria-hidden="true" /> {t('live_wind')}
          </a>

          <Link href="/#iletisim" onClick={() => setMenuOpen(false)} className="vk-mlink">{t('contact')}</Link>

          {/* Hizmetler accordion */}
          <button onClick={() => setMobileServicesOpen((v) => !v)} className="vk-mlink vk-macc">
            {t('services')} <span className={`vk-chevron ${mobileServicesOpen ? 'vk-chevron--open' : ''}`}>▾</span>
          </button>
          {mobileServicesOpen && (
            <div className="vk-msub">
              {HIZMETLER_ITEMS.map((item) => (
                <Link key={item.anchor} href={`/hizmetler#${item.anchor}`} onClick={() => setMenuOpen(false)} className="vk-msublink">
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          <button onClick={() => { openChat(); setMenuOpen(false); }} className="vk-cta vk-cta--mobile">{t('cta')}</button>
        </div>
      )}

      <style>{`
        .vk-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px;
          padding: 16px clamp(16px,4vw,56px);
          background: rgba(6,33,49,.34);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(255,255,255,.08);
          transition: padding .28s ease, background .28s ease, box-shadow .28s ease, border-color .28s ease;
        }
        .vk-nav--scrolled {
          padding-top: 9px; padding-bottom: 9px;
          background: rgba(6,33,49,.9);
          box-shadow: 0 10px 30px -12px rgba(0,0,0,.5);
          border-bottom-color: rgba(255,255,255,.12);
        }
        .vk-logo { display: flex; align-items: center; text-decoration: none; flex-shrink: 0; transition: transform .25s ease; }
        .vk-logo:hover { transform: scale(1.04); }
        .vk-logo-img { height: 44px; width: auto; transition: height .28s ease; }
        .vk-nav--scrolled .vk-logo-img { height: 36px; }

        .navlinks { display: none; gap: 2px; align-items: center; flex: 1; justify-content: center; flex-wrap: wrap; }

        .vk-link {
          position: relative;
          font-family: Manrope, system-ui, sans-serif;
          font-size: 13.5px; font-weight: 600; letter-spacing: .01em;
          color: #dceaf0; text-decoration: none; white-space: nowrap;
          padding: 8px 10px; background: transparent; border: none; cursor: pointer;
          display: inline-flex; align-items: center; gap: 5px;
          transition: color .2s ease;
        }
        .vk-link::after {
          content: ''; position: absolute; left: 10px; right: 10px; bottom: 3px;
          height: 2px; border-radius: 2px; background: #14b8cf;
          transform: scaleX(0); transform-origin: center;
          transition: transform .26s cubic-bezier(.4,0,.2,1);
        }
        .vk-link:hover { color: #14b8cf; }
        .vk-link:hover::after { transform: scaleX(1); }
        .vk-link--active { color: #fff; }
        .vk-link--active::after { transform: scaleX(1); background: #14b8cf; }

        .vk-link--live { color: #3ee07a; }
        .vk-link--live:hover { color: #6ff0a0; }
        .vk-link--live::after { background: #3ee07a; }
        .vk-live-dot { width: 7px; height: 7px; border-radius: 50%; background: #3ee07a; box-shadow: 0 0 0 0 rgba(62,224,122,.6); animation: vkPulse 2s infinite; flex-shrink: 0; }
        @keyframes vkPulse { 0% { box-shadow: 0 0 0 0 rgba(62,224,122,.55); } 70% { box-shadow: 0 0 0 6px rgba(62,224,122,0); } 100% { box-shadow: 0 0 0 0 rgba(62,224,122,0); } }

        .vk-dd-wrap { position: relative; }
        .vk-chevron { font-size: 10px; opacity: .7; transition: transform .26s ease; display: inline-block; }
        .vk-chevron--open { transform: rotate(180deg); }

        .vk-dropdown {
          position: absolute; top: calc(100% + 10px); left: 50%; transform: translateX(-50%);
          background: rgba(9,42,60,.98); backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,.12); border-radius: 14px;
          padding: 6px; min-width: 214px;
          box-shadow: 0 24px 50px -16px rgba(0,0,0,.7);
          z-index: 60; overflow: hidden;
          animation: vkDrop .2s cubic-bezier(.4,0,.2,1);
        }
        .vk-dropdown--right { left: auto; right: 0; transform: none; min-width: 150px; transform-origin: top right; }
        @keyframes vkDrop { from { opacity: 0; transform: translateX(-50%) translateY(-8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        .vk-dropdown--right { animation: vkDropR .2s cubic-bezier(.4,0,.2,1); }
        @keyframes vkDropR { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

        .vk-dditem {
          display: block; width: 100%; text-align: left;
          padding: 10px 14px; border-radius: 9px;
          color: #dceaf0; font-family: Manrope, system-ui, sans-serif;
          font-size: 13.5px; font-weight: 600; text-decoration: none;
          background: transparent; border: none; cursor: pointer;
          position: relative; transition: background .18s ease, color .18s ease, padding-left .18s ease;
        }
        .vk-dditem:hover { background: rgba(20,184,207,.14); color: #14b8cf; padding-left: 20px; }
        .vk-dditem--active { background: rgba(20,184,207,.18); color: #14b8cf; }

        .vk-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .vk-lang {
          cursor: pointer; border: 1px solid rgba(255,255,255,.32); background: transparent;
          color: #fbf6ec; font-family: Manrope, system-ui, sans-serif; font-weight: 700;
          font-size: 12px; letter-spacing: .06em; padding: 7px 11px; border-radius: 9px;
          display: flex; align-items: center; gap: 5px; transition: border-color .2s, background .2s;
        }
        .vk-lang:hover { border-color: #14b8cf; background: rgba(20,184,207,.1); }

        .vk-cta {
          background: linear-gradient(135deg, #ff7f57, #ff6a3d);
          color: #fff; font-family: Manrope, system-ui, sans-serif; font-weight: 800;
          font-size: 13.5px; letter-spacing: .02em; padding: 10px 20px; border-radius: 11px;
          box-shadow: 0 8px 22px -8px rgba(255,106,61,.8); border: none; cursor: pointer;
          white-space: nowrap; transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
        }
        .vk-cta:hover { transform: translateY(-2px); box-shadow: 0 14px 30px -8px rgba(255,106,61,.95); filter: brightness(1.05); }
        .vk-cta:active { transform: translateY(0); }

        .vk-burger { display: flex; flex-direction: column; gap: 5px; background: transparent; border: none; cursor: pointer; padding: 6px; }
        .vk-burger span { display: block; width: 22px; height: 2px; background: #fbf6ec; border-radius: 2px; transition: transform .28s ease, opacity .2s ease; }
        .vk-burger-x1 { transform: translateY(7px) rotate(45deg); }
        .vk-burger-x2 { opacity: 0; }
        .vk-burger-x3 { transform: translateY(-7px) rotate(-45deg); }

        .vk-mobile {
          position: absolute; top: 100%; left: 0; right: 0;
          background: rgba(6,33,49,.98); backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,.1);
          padding: 16px clamp(16px,4vw,56px) 24px;
          display: flex; flex-direction: column; gap: 2px;
          max-height: 82vh; overflow-y: auto;
          animation: vkSlide .24s ease;
        }
        @keyframes vkSlide { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .vk-mlink {
          font-family: Manrope, system-ui, sans-serif; font-size: 16px; font-weight: 700;
          color: #dceaf0; padding: 12px 4px; text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,.06); display: flex; align-items: center; gap: 8px;
          background: transparent; border-left: none; border-right: none; border-top: none; cursor: pointer;
          width: 100%; text-align: left; transition: color .18s, padding-left .18s;
        }
        .vk-mlink:hover, .vk-mlink:active { color: #14b8cf; padding-left: 10px; }
        .vk-mlink--live { color: #3ee07a; }
        .vk-macc { justify-content: flex-start; }
        .vk-msub { padding-left: 16px; border-bottom: 1px solid rgba(255,255,255,.06); }
        .vk-msublink {
          display: block; font-family: Manrope, system-ui, sans-serif; font-size: 14px; font-weight: 600;
          color: #9fc0cf; padding: 9px 0; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,.04);
          transition: color .18s, padding-left .18s;
        }
        .vk-msublink:hover { color: #14b8cf; padding-left: 8px; }
        .vk-cta--mobile { margin-top: 16px; width: 100%; padding: 14px; font-size: 16px; border-radius: 12px; }

        @media (min-width: 1024px) {
          .navlinks { display: flex !important; }
          .hamburger { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
