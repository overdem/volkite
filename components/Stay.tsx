import { useTranslations } from 'next-intl';

interface StayItem { tag: string; title: string; desc: string }

export default function Stay() {
  const t = useTranslations('stay');
  const items = t.raw('items') as StayItem[];

  return (
    <section id="konaklama" style={{ background: '#062131', color: '#fbf6ec', padding: 'clamp(64px,8vw,120px) clamp(20px,5vw,72px)' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', marginBottom: '16px', textTransform: 'uppercase' }}>
          {t('kicker')}
        </div>
        <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(34px,4.5vw,56px)', marginBottom: '44px' }}>
          {t('title')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '20px' }}>
          {items.map((item) => (
            <div key={item.tag} style={{ background: '#0c3346', border: '1px solid rgba(255,255,255,.08)', borderRadius: '18px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#14b8cf', background: 'rgba(20,184,207,.12)', padding: '6px 12px', borderRadius: '999px', alignSelf: 'flex-start' }}>
                {item.tag}
              </span>
              <h3 style={{ fontSize: '21px', fontWeight: 800 }}>{item.title}</h3>
              <p style={{ color: '#9fc0cf', fontSize: '15px', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
