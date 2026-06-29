import { useTranslations } from 'next-intl';

export default function Instagram() {
  const t = useTranslations('instagram');
  const items = t.raw('items') as string[];

  return (
    <section id="instagram" style={{ background: '#fbf6ec', padding: 'clamp(56px,7vw,100px) clamp(20px,5vw,72px)' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '34px' }}>
          <div>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', marginBottom: '14px', textTransform: 'uppercase' }}>
              {t('kicker')}
            </div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(28px,3.5vw,46px)', color: '#07283b' }}>
              {t('title')}
            </h2>
          </div>
          <a
            href="https://www.instagram.com/volkite/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#07283b', color: '#fbf6ec', fontFamily: 'Manrope, system-ui, sans-serif', fontWeight: 800, padding: '13px 22px', borderRadius: '11px', textDecoration: 'none', fontSize: '15px' }}
          >
            {t('handle')} · {t('cta')} →
          </a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px' }}>
          {items.map((label) => (
            <a
              key={label}
              href="https://www.instagram.com/volkite/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ position: 'relative', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', background: 'repeating-linear-gradient(135deg,#cfdde2 0 14px,#c4d4da 14px 28px)', display: 'block' }}
            >
              <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '.12em', color: '#5a7079', textTransform: 'uppercase' }}>
                {label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
