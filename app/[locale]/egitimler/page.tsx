import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPackages } from '@/lib/queries';
import type { Locale } from '@/lib/queries';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'lessons_page' });
  return {
    title: t('h1'),
    description: t('subtitle'),
  };
}

export default async function EgitimlerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'lessons_page' });
  const tLessons = await getTranslations({ locale, namespace: 'lessons' });

  const packages = await getPackages(locale as Locale);

  type Level = { tag: string; dur: string; title: string; desc: string; rows: { label: string; price: string }[]; cta: string };
  const levels: Level[] = packages ?? (tLessons.raw('levels') as Level[]);

  const advantages = t.raw('advantages') as string[];

  return (
    <main style={{ fontFamily: 'Manrope, sans-serif', color: '#07283b' }}>
      {/* Back link + Hero */}
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
          <p style={{ color: '#9fc0cf', fontSize: 'clamp(15px,1.8vw,18px)', lineHeight: 1.6, maxWidth: '600px' }}>
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Advantages */}
      <section style={{ background: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
            {t('advantages_title')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '18px' }}>
            {advantages.map((adv, i) => (
              <div
                key={i}
                style={{ background: '#fff', border: '1px solid #ece1cc', borderRadius: '16px', padding: '26px 24px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(20,184,207,.12)', border: '2px solid #14b8cf', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5l3.5 3.5L11 1" stroke="#14b8cf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p style={{ fontSize: '15px', lineHeight: 1.55, color: '#07283b', fontWeight: 600, margin: 0 }}>{adv}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section style={{ background: '#062131', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '28px' }}>
            {levels.map((item) => (
              <div
                key={item.tag}
                style={{ background: '#0c3346', border: '1px solid rgba(255,255,255,.08)', borderRadius: '18px', padding: '34px', display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#14b8cf', background: 'rgba(20,184,207,.12)', padding: '6px 14px', borderRadius: '999px' }}>
                    {item.tag}
                  </span>
                  <span style={{ fontSize: '13px', color: '#9fc0cf', fontWeight: 700 }}>{item.dur}</span>
                </div>
                <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '30px', letterSpacing: '.01em', margin: 0 }}>
                  {item.title}
                </h2>
                <p style={{ color: '#bcd4de', fontSize: '15px', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,.08)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                  {item.rows.map((r) => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '14px' }}>
                      <span style={{ color: '#9fc0cf' }}>{r.label}</span>
                      <span style={{ fontWeight: 800, color: '#fbf6ec' }}>{r.price}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/#rezervasyon"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#ff8a64', textDecoration: 'none', fontSize: '15px' }}
                >
                  {item.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notes + CTA */}
      <section style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(48px,6vw,80px) clamp(20px,5vw,72px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
          <p style={{ color: '#9fc0cf', fontSize: '15px', lineHeight: 1.7, maxWidth: '680px', margin: 0 }}>
            {t('price_note')}
          </p>
          <p style={{ color: '#9fc0cf', fontSize: '15px', lineHeight: 1.7, maxWidth: '680px', margin: 0 }}>
            {t('group_note')}
          </p>
          <Link
            href="/#rezervasyon"
            style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#ff6a3d', color: '#fff', fontWeight: 800, padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontSize: '16px' }}
          >
            {t('cta')}
          </Link>
        </div>
      </section>
    </main>
  );
}
