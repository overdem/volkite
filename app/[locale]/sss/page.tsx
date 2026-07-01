import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Faq from '@/components/Faq';
import { getFaq } from '@/lib/queries';
import type { Locale } from '@/lib/queries';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });
  return {
    title: `${t('title')} | Volkite Kitesurf Okulu`,
    description: 'Kitesurf öğrenme, sezon, ekipman ve rezervasyon hakkında sık sorulan sorular.',
  };
}

export default async function SssPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const faq = await getFaq(locale as Locale);

  return (
    <>
      <Nav />
      <main style={{ fontFamily: 'Manrope, sans-serif', color: '#07283b' }}>
        {/* Hero */}
        <section style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(100px,12vw,140px) clamp(20px,5vw,72px) clamp(56px,8vw,112px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              SSS
            </div>
            <h1 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(40px,6vw,84px)', lineHeight: 0.95, marginBottom: '22px' }}>
              SIK SORULAN SORULAR
            </h1>
            <p style={{ color: '#9fc0cf', fontSize: 'clamp(15px,1.8vw,18px)', lineHeight: 1.6, maxWidth: '600px' }}>
              Kitesurf öğrenme süreci, sezon, ekipman ve rezervasyon hakkında merak edilenler.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <Faq faq={faq} />
      </main>
      <Footer />
    </>
  );
}
