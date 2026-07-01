'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const GALLERY_IMAGES = [
  { src: '/images/hero-beach.jpg',      alt: 'Kefaloz Koyundan drone görüntüsü' },
  { src: '/images/egitim-kurs-1.jpg',   alt: 'Kitesurf dersi — Gökçeada' },
  { src: '/images/egitim-kurs-3.jpg',   alt: 'Gökçeada kitesurf' },
  { src: '/images/galeri-1.jpg',        alt: 'Volkite okul hayatı' },
  { src: '/images/galeri-2.jpg',        alt: 'Volkite okul hayatı 2' },
  { src: '/images/spot-egitim-alani.jpg', alt: 'Volkite eğitim alanı' },
  { src: '/images/egitim-kurs-4.jpg',   alt: 'Kiteboard okulu Gökçeada' },
  { src: '/images/galeri-okul.jpg',     alt: 'Volkite kiteboard okulu' },
];

export default function Gallery() {
  const t = useTranslations('gallery');

  return (
    <section id="galeri" style={{ background: '#fbf6ec', padding: 'clamp(64px,8vw,120px) clamp(20px,5vw,72px)' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '18px', marginBottom: '40px' }}>
          <div>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', marginBottom: '16px', textTransform: 'uppercase' }}>
              {t('kicker')}
            </div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(34px,4.5vw,60px)', lineHeight: .98, color: '#07283b' }}>
              {t('title')}
            </h2>
          </div>
          <p style={{ maxWidth: '340px', color: '#5a7079', fontSize: '16px', lineHeight: 1.6 }}>{t('sub')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: '14px' }}>
          {GALLERY_IMAGES.map((img) => (
            <div
              key={img.src}
              style={{ position: 'relative', aspectRatio: '1', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer' }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                style={{ objectFit: 'cover', transition: 'transform .35s ease' }}
                sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 190px"
                onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.07)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
              />
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link href="/galeri" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(20,184,207,.14)', border: '1px solid rgba(20,184,207,.5)', color: '#14b8cf', fontWeight: 800, padding: '13px 24px', borderRadius: '11px', textDecoration: 'none', fontSize: '15px' }}>
            Tüm Galeri →
          </Link>
        </div>
      </div>
    </section>
  );
}
