import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function Kitchen() {
  const t = useTranslations('kitchen');
  const items = t.raw('items') as string[];

  return (
    <section id="mutfak" style={{ background: '#fbf6ec', padding: 'clamp(64px,8vw,120px) clamp(20px,5vw,72px)' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(32px,5vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#ff6a3d', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', marginBottom: '16px', textTransform: 'uppercase' }}>
              {t('kicker')}
            </div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(34px,4.5vw,56px)', lineHeight: .98, color: '#07283b', marginBottom: '22px' }}>
              {t('title')}
            </h2>
            <p style={{ fontSize: '17px', lineHeight: 1.65, color: '#3a5563', marginBottom: '30px' }}>{t('body')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <a href="#rezervasyon" style={{ display: 'inline-flex', fontWeight: 800, color: '#07283b', borderBottom: '3px solid #ff6a3d', paddingBottom: '4px', textDecoration: 'none' }}>
                {t('link')} →
              </a>
              <Link
                href="/mutfak"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(20,184,207,.14)', border: '1px solid rgba(20,184,207,.5)', color: '#14b8cf', fontWeight: 800, padding: '13px 24px', borderRadius: '11px', textDecoration: 'none', fontSize: '15px' }}
              >
                {t('read_more')} →
              </Link>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {items.map((label) => (
              <div key={label} style={{ position: 'relative', aspectRatio: '1', borderRadius: '14px', overflow: 'hidden', background: 'repeating-linear-gradient(135deg,#cfdde2 0 14px,#c4d4da 14px 28px)' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '.12em', color: '#5a7079', textTransform: 'uppercase', textAlign: 'center', padding: '8px' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
