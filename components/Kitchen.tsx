'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const CAFE_IMAGES = [
  { src: '/images/cafe-burger1.jpg',  alt: 'Volkite burger' },
  { src: '/images/cafe-pizza1.jpg',   alt: 'Volkite pizza' },
  { src: '/images/cafe-trilece.jpg',  alt: 'Trileçe — Cafe On Shore' },
  { src: '/images/cafe-tatli-wp.jpg', alt: 'Cafe On Shore tatlılar' },
];

export default function Kitchen() {
  const t = useTranslations('kitchen');

  return (
    <section id="mutfak" style={{ background: '#fbf6ec', padding: 'clamp(64px,8vw,120px) clamp(20px,5vw,72px)' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(32px,5vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#ff6a3d', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', marginBottom: '16px', textTransform: 'uppercase' }}>
              {t('kicker')}
            </div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(34px,4.5vw,56px)', lineHeight: .98, color: '#07283b', marginBottom: '22px' }}>
              {t('title')}
            </h2>
            <p style={{ fontSize: '17px', lineHeight: 1.65, color: '#3a5563', marginBottom: '30px' }}>{t('body')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <a href="#iletisim" style={{ display: 'inline-flex', fontWeight: 800, color: '#07283b', borderBottom: '3px solid #ff6a3d', paddingBottom: '4px', textDecoration: 'none' }}>
                {t('link')} →
              </a>
              <Link
                href="/mutfak"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(20,184,207,.14)', border: '1px solid rgba(20,184,207,.5)', color: '#14b8cf', fontWeight: 800, padding: '13px 24px', borderRadius: '11px', textDecoration: 'none', fontSize: '15px' }}
              >
                {t('read_more')} →
              </Link>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {CAFE_IMAGES.map((img) => (
              <div key={img.src} style={{ position: 'relative', aspectRatio: '1', borderRadius: '14px', overflow: 'hidden' }}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  style={{ objectFit: 'cover', transition: 'transform .3s ease' }}
                  sizes="(max-width:768px) 50vw, 200px"
                  onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.07)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
