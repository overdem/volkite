import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function About() {
  const t = useTranslations('about');

  return (
    <section style={{ background: '#fbf6ec', padding: 'clamp(64px,8vw,120px) clamp(20px,5vw,72px)' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(32px,5vw,72px)', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', marginBottom: '18px', textTransform: 'uppercase' }}>
            {t('kicker')}
          </div>
          <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(34px,4.5vw,60px)', lineHeight: .98, color: '#07283b', marginBottom: '24px' }}>
            {t('title')}
          </h2>
          <p style={{ fontSize: '17px', lineHeight: 1.65, color: '#3a5563', marginBottom: '18px' }}>{t('body1')}</p>
          <p style={{ fontSize: '17px', lineHeight: 1.65, color: '#3a5563', marginBottom: '30px' }}>{t('body2')}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
            <a href="#rezervasyon" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 800, color: '#07283b', borderBottom: '3px solid #ff6a3d', paddingBottom: '4px', textDecoration: 'none' }}>
              {t('link')} →
            </a>
            <Link
              href="/hakkimizda"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(20,184,207,.14)', border: '1px solid rgba(20,184,207,.5)', color: '#14b8cf', fontWeight: 800, padding: '13px 24px', borderRadius: '11px', textDecoration: 'none', fontSize: '15px' }}
            >
              {t('read_more')} →
            </Link>
          </div>
        </div>

        {/* Photo placeholder */}
        <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: '18px', overflow: 'hidden', background: 'linear-gradient(135deg,#cfdde2 0%,#9fc0cf 100%)', boxShadow: '0 30px 60px -28px rgba(7,40,59,.45)' }}>
          <div style={{ position: 'absolute', left: '18px', bottom: '18px', right: '18px', background: 'rgba(6,33,49,.78)', backdropFilter: 'blur(6px)', color: '#fbf6ec', borderRadius: '12px', padding: '16px 18px' }}>
            <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '22px', color: '#14b8cf' }}>
              21 {t('years')}
            </div>
            <div style={{ fontSize: '13px', color: '#cfe1e8', marginTop: '2px' }}>{t('badge')}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
