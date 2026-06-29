import { useTranslations } from 'next-intl';

interface Feature { num: string; label: string }

export default function Spot() {
  const t = useTranslations('spot');
  const features = t.raw('features') as Feature[];

  return (
    <section id="spot" style={{ background: '#062131', color: '#fbf6ec', padding: 'clamp(64px,8vw,120px) clamp(20px,5vw,72px)' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(32px,5vw,64px)', alignItems: 'center' }}>
        {/* Photo placeholder */}
        <div style={{ position: 'relative', aspectRatio: '16/12', borderRadius: '18px', overflow: 'hidden', background: 'linear-gradient(135deg,#16384a 0%,#0c3346 100%)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(6,33,49,0) 40%,rgba(6,33,49,.5) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'monospace', fontSize: '13px', letterSpacing: '.1em', color: 'rgba(255,255,255,.3)', textTransform: 'uppercase' }}>
            KEFALOZ BAY
          </div>
        </div>

        <div>
          <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', marginBottom: '16px', textTransform: 'uppercase' }}>
            {t('kicker')}
          </div>
          <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(34px,4.5vw,56px)', lineHeight: .98, marginBottom: '28px' }}>
            {t('title')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px', marginBottom: '30px' }}>
            {features.map((item) => (
              <div key={item.label}>
                <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '30px', color: '#14b8cf' }}>{item.num}</div>
                <div style={{ fontSize: '14px', color: '#bcd4de', marginTop: '4px' }}>{item.label}</div>
              </div>
            ))}
          </div>
          <a
            href="https://kiting.live/kitesurf-spot/wave-gokceada-turkey"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(20,184,207,.14)', border: '1px solid rgba(20,184,207,.5)', color: '#14b8cf', fontWeight: 800, padding: '13px 22px', borderRadius: '11px', textDecoration: 'none', fontSize: '15px' }}
          >
            {t('cta')} →
          </a>
        </div>
      </div>
    </section>
  );
}
