import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'kitchen_page' });
  return {
    title: t('h1'),
    description: t('subtitle'),
  };
}

export default async function MutfakPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'kitchen_page' });

  const menuItems = t.raw('menu_items') as string[];
  const teamMembers = t.raw('team') as string[];

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
          <div style={{ color: '#ff6a3d', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
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

      {/* Description */}
      <section style={{ background: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ fontSize: '18px', lineHeight: 1.75, color: '#3a5563' }}>
            {t('desc')}
          </p>
        </div>
      </section>

      {/* Menu highlights */}
      <section style={{ background: '#062131', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ color: '#ff6a3d', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '28px' }}>
            {t('menu_title')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '16px' }}>
            {menuItems.map((item) => (
              <div
                key={item}
                style={{ background: '#0c3346', border: '1px solid rgba(255,255,255,.08)', borderRadius: '14px', padding: '24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px', textAlign: 'center', fontWeight: 700, fontSize: '15px', color: '#fbf6ec' }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special events */}
      <section style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(36px,5vw,64px)' }}>
          <div>
            <div style={{ color: '#ff6a3d', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              {t('events_title')}
            </div>
            <p style={{ color: '#bcd4de', fontSize: '16px', lineHeight: 1.75 }}>
              {t('events_desc')}
            </p>
            <Link
              href="/#rezervasyon"
              style={{ display: 'inline-flex', marginTop: '24px', alignItems: 'center', gap: '10px', background: '#ff6a3d', color: '#fff', fontWeight: 800, padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontSize: '16px' }}
            >
              {t('read_more')}
            </Link>
          </div>

          {/* Team */}
          <div>
            <div style={{ color: '#ff6a3d', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              {t('team_title')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {teamMembers.map((member) => (
                <div
                  key={member}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', background: 'rgba(12,51,70,.5)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '12px' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#16384a,#0c3346)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: '15px', color: '#fbf6ec' }}>{member}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
