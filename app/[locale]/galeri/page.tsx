import type { Metadata } from 'next';
import Image from 'next/image';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Link } from '@/i18n/navigation';

export const metadata: Metadata = {
  title: 'Galeri | Volkite Kitesurf Okulu',
  description: 'Gökçeada Kefaloz Koyundan eğitim, sürüş ve okul hayatından fotoğraflar.',
};

export default function GaleriPage() {
  return (
    <>
      <Nav />
      <main style={{ fontFamily: 'Manrope, sans-serif', color: '#07283b', minHeight: '80vh' }}>
        {/* Hero */}
        <section style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(100px,12vw,140px) clamp(20px,5vw,72px) clamp(56px,8vw,112px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              GALERİ
            </div>
            <h1 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(40px,6vw,84px)', lineHeight: 0.95, marginBottom: '22px' }}>
              SUDAN KARELER
            </h1>
            <p style={{ color: '#9fc0cf', fontSize: 'clamp(15px,1.8vw,18px)', lineHeight: 1.6, maxWidth: '600px' }}>
              Eğitimlerden, spottan ve Volkite hayatından anlar. Gökçeada Kefaloz Koyunun en güzel kareleri.
            </p>
          </div>
        </section>

        {/* Gallery grid */}
        <section style={{ background: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '1340px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '14px', marginBottom: '40px' }}>
              <style>{`.vk-gitem:hover img { transform: scale(1.06); }`}</style>
              {[
                ['/images/hero-beach.jpg',       'Kefaloz Koyundan drone'],
                ['/images/egitim-kurs-1.jpg',    'Kitesurf dersi'],
                ['/images/egitim-kurs-3.jpg',    'Gökçeada kitesurf'],
                ['/images/egitim-kurs-4.jpg',    'Kiteboard okulu'],
                ['/images/egitim-kurs-5.jpg',    'Volkite okul'],
                ['/images/egitim-kurs-6.jpg',    'Volkite kiteboard school'],
                ['/images/spot-kefaloz.jpg',     'Kefaloz koyu'],
                ['/images/spot-egitim-alani.jpg','Eğitim alanı'],
                ['/images/spot-plaj.jpg',        'Kitesurf plajı'],
                ['/images/spot-aydincik.jpg',    'Aydıncık'],
                ['/images/hizmet-wakeboard.jpg', 'Wakeboard'],
                ['/images/hizmet-wakeboard2.jpg','Wakeboard 2'],
                ['/images/hizmet-rescue.jpg',    'Kurtarma botu'],
                ['/images/galeri-1.jpg',         'Volkite anı'],
                ['/images/galeri-2.jpg',         'Volkite anı 2'],
                ['/images/galeri-okul.jpg',      'Volkite okul hayatı'],
              ].map(([src, alt]) => (
                <div key={src} className="vk-gitem" style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '12px', overflow: 'hidden' }}>
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    style={{ objectFit: 'cover', transition: 'transform .35s ease' }}
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 300px"
                  />
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#8497a1', marginBottom: '20px', fontSize: '15px' }}>
                Daha fazlası için{' '}
                <a href="https://www.instagram.com/volkite/" target="_blank" rel="noopener noreferrer" style={{ color: '#14b8cf', fontWeight: 700, textDecoration: 'none' }}>@volkite</a>
                &apos;yi takip edin!
              </p>
              <Link href="/" style={{ color: '#07283b', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>← Ana Sayfa</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
