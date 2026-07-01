import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Link } from '@/i18n/navigation';

export const metadata: Metadata = {
  title: 'Blog | Volkite Kitesurf Okulu',
  description: 'Kitesurf tüyoları, Gökçeada haberleri ve rüzgar rehberleri.',
};

export default function BlogPage() {
  return (
    <>
      <Nav />
      <main style={{ fontFamily: 'Manrope, sans-serif', color: '#07283b', minHeight: '80vh' }}>
        {/* Hero */}
        <section style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(100px,12vw,140px) clamp(20px,5vw,72px) clamp(56px,8vw,112px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              BLOG
            </div>
            <h1 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(40px,6vw,84px)', lineHeight: 0.95, marginBottom: '22px' }}>
              RÜZGAR & KİTE HABERLERİ
            </h1>
            <p style={{ color: '#9fc0cf', fontSize: 'clamp(15px,1.8vw,18px)', lineHeight: 1.6, maxWidth: '600px' }}>
              Kitesurf tüyoları, Gökçeada haberleri, sezon yorumları ve daha fazlası.
            </p>
          </div>
        </section>

        {/* Coming soon */}
        <section style={{ background: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🤙</div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(26px,3.5vw,44px)', color: '#07283b', marginBottom: '16px' }}>
              YAKINDA!
            </h2>
            <p style={{ fontSize: '17px', lineHeight: 1.7, color: '#3a5563', marginBottom: '32px' }}>
              Blog içeriklerimiz hazırlanıyor — kitesurf rehberleri, Gökçeada gezi ipuçları ve sezon yorumları çok yakında burada.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="https://www.instagram.com/volkite/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: '#ff6a3d', color: '#fff', fontWeight: 800, padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontSize: '15px', fontFamily: 'Manrope, system-ui, sans-serif' }}
              >
                Instagram&apos;da Takip Et
              </a>
              <Link
                href="/"
                style={{ background: '#07283b', color: '#fbf6ec', fontWeight: 800, padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontSize: '15px', fontFamily: 'Manrope, system-ui, sans-serif' }}
              >
                ← Ana Sayfa
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
