import { useTranslations } from 'next-intl';

export default function Gallery() {
  const t = useTranslations('gallery');
  const items = t.raw('items') as string[];

  return (
    <section id="galeri" style={{ background: '#fbf6ec', padding: 'clamp(64px,8vw,120px) clamp(20px,5vw,72px)' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '18px', marginBottom: '40px' }}>
          <div>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', marginBottom: '16px', textTransform: 'uppercase' }}>
              {t('kicker')}
            </div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(34px,4.5vw,60px)', lineHeight: .98, color: '#07283b' }}>
              {t('title')}
            </h2>
          </div>
          <p style={{ maxWidth: '340px', color: '#5a7079', fontSize: '16px', lineHeight: 1.6 }}>{t('sub')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '14px' }}>
          {items.map((label) => (
            <div
              key={label}
              style={{ position: 'relative', aspectRatio: '1', borderRadius: '14px', overflow: 'hidden', background: 'repeating-linear-gradient(135deg,#cfdde2 0 15px,#c4d4da 15px 30px)', cursor: 'pointer' }}
            >
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '.12em', color: '#5a7079', textTransform: 'uppercase', textAlign: 'center', padding: '8px' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
