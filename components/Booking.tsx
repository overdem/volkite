'use client';

import { useTranslations } from 'next-intl';

function openChat() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('volkite:open-chat'));
  }
}

export default function Booking() {
  const t = useTranslations('booking');

  return (
    <section id="iletisim" style={{ background: '#fbf6ec', padding: 'clamp(64px,8vw,120px) clamp(20px,5vw,72px)' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(40px,6vw,80px)', alignItems: 'start' }}>

        {/* Left: heading + contacts */}
        <div>
          <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', marginBottom: '16px', textTransform: 'uppercase' }}>
            {t('kicker')}
          </div>
          <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(34px,4.5vw,56px)', lineHeight: .98, color: '#07283b', marginBottom: '18px' }}>
            {t('title')}
          </h2>
          <p style={{ fontSize: '17px', lineHeight: 1.65, color: '#3a5563', marginBottom: '36px' }}>
            {t('sub')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.18em', color: '#14b8cf', textTransform: 'uppercase', marginBottom: '6px' }}>{t('phone')}</div>
              <a href="tel:+905332411015" style={{ fontSize: '20px', fontWeight: 800, color: '#07283b', textDecoration: 'none' }}>+90 533 241 10 15</a>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.18em', color: '#14b8cf', textTransform: 'uppercase', marginBottom: '6px' }}>E-POSTA</div>
              <a href="mailto:volkite@volkite.com" style={{ fontSize: '16px', fontWeight: 600, color: '#3a5563', textDecoration: 'none' }}>volkite@volkite.com</a>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.18em', color: '#14b8cf', textTransform: 'uppercase', marginBottom: '6px' }}>{t('address')}</div>
              <p style={{ fontSize: '15px', color: '#3a5563', lineHeight: 1.5, margin: 0 }}>
                Eşelek Köyü, Köy Sokağı 104/1<br />Gökçeada, Çanakkale
              </p>
            </div>
            <div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Volkite+Kiteboard+Okulu+Gökçeada"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#14b8cf', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Haritada Gör →
              </a>
            </div>
          </div>
        </div>

        {/* Right: action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: 'clamp(28px,4vw,44px)', boxShadow: '0 4px 40px rgba(7,40,59,.08)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '24px', color: '#07283b', marginBottom: '10px', lineHeight: 1.1 }}>
                Rezervasyon & Bilgi
              </h3>
              <p style={{ fontSize: '15px', color: '#5a7079', lineHeight: 1.6, margin: 0 }}>
                Tarih, program ve fiyat için asistanımıza yazın ya da direkt WhatsApp&apos;tan ulaşın.
              </p>
            </div>

            {/* Chat widget opener */}
            <button
              onClick={openChat}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#ff6a3d', color: '#fff', border: 'none', borderRadius: '14px', padding: '16px 24px', fontSize: '16px', fontWeight: 800, fontFamily: 'Manrope, system-ui, sans-serif', cursor: 'pointer', boxShadow: '0 10px 28px -8px rgba(255,106,61,.6)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5a8.38 8.38 0 0 1-.9-4 8.5 8.5 0 0 1 17 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {t('chat_cta')}
            </button>

            {/* WhatsApp */}
            <a
              href="https://wa.me/905332411015?text=Merhaba!%20Volkite%20kitesurf%20okulu%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#25D366', color: '#fff', borderRadius: '14px', padding: '14px 24px', fontSize: '15px', fontWeight: 800, fontFamily: 'Manrope, system-ui, sans-serif', textDecoration: 'none' }}
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp · +90 533 241 10 15
            </a>

            {/* Phone */}
            <a
              href="tel:+905332411015"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#062131', color: '#fbf6ec', borderRadius: '14px', padding: '14px 24px', fontSize: '15px', fontWeight: 700, fontFamily: 'Manrope, system-ui, sans-serif', textDecoration: 'none' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.47 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.58a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.72 16z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              +90 533 241 10 15
            </a>

            {/* Social */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', paddingTop: '8px', borderTop: '1px solid #ece1cc' }}>
              <a href="https://www.instagram.com/volkite/" target="_blank" rel="noopener noreferrer" style={{ color: '#5a7079', fontSize: '13px', fontWeight: 700, textDecoration: 'none', fontFamily: 'Manrope, system-ui, sans-serif' }}>Instagram</a>
              <span style={{ color: '#ece1cc' }}>·</span>
              <a href="https://www.facebook.com/volkite" target="_blank" rel="noopener noreferrer" style={{ color: '#5a7079', fontSize: '13px', fontWeight: 700, textDecoration: 'none', fontFamily: 'Manrope, system-ui, sans-serif' }}>Facebook</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
