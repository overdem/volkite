import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'spot_page' });
  return {
    title: t('h1'),
    description: t('subtitle'),
  };
}

export default async function SpotRuzgarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'spot_page' });

  type WindPattern = { time: string; desc: string };
  const windPattern = t.raw('wind_pattern') as WindPattern[];
  const spotFeatures = t.raw('spot_features') as string[];

  return (
    <main style={{ fontFamily: 'Manrope, sans-serif', color: '#07283b' }}>
      {/* Hero */}
      <section style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(48px,7vw,100px) clamp(20px,5vw,72px) clamp(56px,8vw,112px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <Link
            href="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#9fc0cf', textDecoration: 'none', fontSize: '14px', fontWeight: 700, marginBottom: '40px' }}
          >
            {t('back')}
          </Link>
          <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
            {t('kicker')}
          </div>
          <h1 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(40px,6vw,84px)', lineHeight: 0.95, marginBottom: '22px' }}>
            {t('h1')}
          </h1>
          <p style={{ color: '#9fc0cf', fontSize: 'clamp(15px,1.8vw,18px)', lineHeight: 1.6, maxWidth: '620px' }}>
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Wind section */}
      <section style={{ background: '#062131', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 'clamp(36px,5vw,64px)' }}>
          {/* Wind info */}
          <div>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '22px' }}>
              {t('wind_title')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: t('wind_direction') },
                { label: t('wind_type') },
                { label: t('wind_season') },
                { label: t('wind_high') },
                { label: t('wind_avg') },
                { label: t('wind_strong') },
              ].map((row, i) => (
                <div
                  key={i}
                  style={{ padding: '14px 18px', background: 'rgba(12,51,70,.6)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '12px', fontSize: '15px', color: '#bcd4de', lineHeight: 1.5 }}
                >
                  {row.label}
                </div>
              ))}
            </div>
          </div>

          {/* Daily pattern */}
          <div>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '22px' }}>
              {t('wind_pattern_title')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {windPattern.map((row, i) => (
                <div
                  key={i}
                  style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', padding: '16px 0', borderBottom: i < windPattern.length - 1 ? '1px solid rgba(255,255,255,.07)' : 'none', alignItems: 'center' }}
                >
                  <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '18px', color: '#14b8cf' }}>{row.time}</div>
                  <div style={{ fontSize: '15px', color: '#bcd4de' }}>{row.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Training area */}
      <section style={{ background: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '22px' }}>
            {t('spot_title')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px' }}>
            {spotFeatures.map((feat, i) => (
              <div
                key={i}
                style={{ background: '#fff', border: '1px solid #ece1cc', borderRadius: '14px', padding: '22px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#14b8cf', flexShrink: 0, marginTop: '7px' }} />
                <span style={{ fontSize: '15px', color: '#07283b', lineHeight: 1.55, fontWeight: 600 }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Island section */}
      <section style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 'clamp(36px,5vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              {t('island_title')}
            </div>
            <p style={{ color: '#bcd4de', fontSize: '16px', lineHeight: 1.75, marginBottom: '32px' }}>
              {t('island_desc')}
            </p>
            <a
              href="https://kiting.live/kitesurf-spot/wave-gokceada-turkey"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(20,184,207,.14)', border: '1px solid rgba(20,184,207,.5)', color: '#14b8cf', fontWeight: 800, padding: '13px 22px', borderRadius: '11px', textDecoration: 'none', fontSize: '15px' }}
            >
              {t('live_wind_cta')}
            </a>
          </div>
          <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '18px', overflow: 'hidden', background: 'linear-gradient(135deg,#16384a 0%,#0c3346 100%)' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'monospace', fontSize: '13px', letterSpacing: '.1em', color: 'rgba(255,255,255,.3)', textTransform: 'uppercase' }}>
              GÖKÇEADA
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
