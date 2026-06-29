import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about_page' });
  return {
    title: t('h1'),
    description: t('slogan'),
  };
}

export default async function HakkimizdaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about_page' });

  type HistoryItem = { year: string; text: string };
  type TeamMember = { name: string; role: string; langs: string };

  const history = t.raw('history') as HistoryItem[];
  const team = t.raw('team') as TeamMember[];

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
          <p style={{ color: '#9fc0cf', fontSize: 'clamp(16px,2vw,22px)', lineHeight: 1.5, fontStyle: 'italic' }}>
            {t('slogan')}
          </p>
        </div>
      </section>

      {/* Story */}
      <section style={{ background: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
            {t('story_title')}
          </div>
          <p style={{ fontSize: '17px', lineHeight: 1.75, color: '#3a5563' }}>
            {t('story')}
          </p>
        </div>
      </section>

      {/* History timeline */}
      <section style={{ background: '#062131', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '32px' }}>
            {t('history_title')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {history.map((item, i) => (
              <div
                key={item.year}
                style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '24px', padding: '20px 0', borderBottom: i < history.length - 1 ? '1px solid rgba(255,255,255,.07)' : 'none', alignItems: 'flex-start' }}
              >
                <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '22px', color: '#14b8cf', lineHeight: 1 }}>{item.year}</div>
                <div style={{ fontSize: '15px', color: '#bcd4de', lineHeight: 1.6 }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(36px,5vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '22px' }}>
              {t('team_title')}
            </div>
            <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '34px', marginBottom: '6px' }}>{t('founder_name')}</div>
            <div style={{ color: '#14b8cf', fontWeight: 700, fontSize: '14px', marginBottom: '18px' }}>{t('founder_role')}</div>
            <p style={{ color: '#bcd4de', fontSize: '15px', lineHeight: 1.75 }}>{t('founder_desc')}</p>
          </div>
          <div style={{ position: 'relative', aspectRatio: '1', maxWidth: '340px', borderRadius: '18px', overflow: 'hidden', background: 'linear-gradient(135deg,#16384a 0%,#0c3346 100%)' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'monospace', fontSize: '12px', letterSpacing: '.1em', color: 'rgba(255,255,255,.3)', textTransform: 'uppercase' }}>
              VOLKAN GÜNEL
            </div>
          </div>
        </div>
      </section>

      {/* Team grid */}
      <section style={{ background: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '18px' }}>
            {team.map((member) => (
              <div
                key={member.name}
                style={{ background: '#fff', border: '1px solid #ece1cc', borderRadius: '16px', padding: '26px 22px', display: 'flex', flexDirection: 'column', gap: '6px' }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#cfdde2,#9fc0cf)', marginBottom: '6px' }} />
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#07283b' }}>{member.name}</div>
                <div style={{ color: '#14b8cf', fontWeight: 700, fontSize: '13px' }}>{member.role}</div>
                {member.langs ? (
                  <div style={{ color: '#3a5563', fontSize: '12px', marginTop: '4px' }}>{member.langs}</div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section style={{ background: '#062131', color: '#fbf6ec', padding: 'clamp(40px,5vw,72px) clamp(20px,5vw,72px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
          <p style={{ color: '#bcd4de', fontSize: '15px', lineHeight: 1.65, maxWidth: '600px', margin: 0 }}>
            {t('certifications')}
          </p>
          <Link
            href="/#rezervasyon"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#ff6a3d', color: '#fff', fontWeight: 800, padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontSize: '16px', whiteSpace: 'nowrap' }}
          >
            {t('read_more')}
          </Link>
        </div>
      </section>
    </main>
  );
}
