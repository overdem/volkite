import type { Metadata } from 'next';
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

        {/* Gallery grid placeholder */}
        <section style={{ background: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  style={{ aspectRatio: '4/3', background: '#e4e9ee', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8497a1', fontSize: '13px', fontWeight: 600 }}
                >
                  Fotoğraf yakında
                </div>
              ))}
            </div>
            <p style={{ textAlign: 'center', color: '#8497a1', marginTop: '40px', fontSize: '15px' }}>
              Galeri yakında tamamlanacak.{' '}
              <a href="https://www.instagram.com/volkite/" target="_blank" rel="noopener noreferrer" style={{ color: '#14b8cf', fontWeight: 700, textDecoration: 'none' }}>Instagram &apos;da @volkite</a>
              {' '}takip edin!
            </p>
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link href="/" style={{ color: '#07283b', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>← Ana Sayfa</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
