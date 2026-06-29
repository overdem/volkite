import { useTranslations } from 'next-intl';

interface ReviewItem { name: string; place: string; text: string }

export default function Reviews() {
  const t = useTranslations('reviews');
  const items = t.raw('items') as ReviewItem[];

  if (!items || items.length === 0) return null;

  return (
    <section id="yorumlar" style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(64px,8vw,120px) clamp(20px,5vw,72px)' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', marginBottom: '44px' }}>
          <div>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', marginBottom: '16px', textTransform: 'uppercase' }}>
              {t('kicker')}
            </div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(34px,4.5vw,60px)', lineHeight: .98 }}>
              {t('title')}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '54px', color: '#14b8cf', lineHeight: 1 }}>
              {t('rating')}
            </div>
            <div>
              <div style={{ color: '#ffcf4d', fontSize: '18px', letterSpacing: '2px' }} aria-hidden="true">★★★★★</div>
              <div style={{ fontSize: '13px', color: '#9fc0cf', marginTop: '2px' }}>{t('count')}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
          {items.map((item) => (
            <div key={item.name} style={{ background: '#0c3346', border: '1px solid rgba(255,255,255,.08)', borderRadius: '18px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ color: '#ffcf4d', fontSize: '16px', letterSpacing: '2px' }} aria-hidden="true">★★★★★</div>
              <p style={{ color: '#dceaf0', fontSize: '16px', lineHeight: 1.65, flex: 1 }}>{item.text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(20,184,207,.18)', display: 'grid', placeItems: 'center', color: '#14b8cf', fontWeight: 800, flexShrink: 0 }}>
                  {item.name.charAt(0)}
                </span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '15px' }}>{item.name}</div>
                  <div style={{ fontSize: '13px', color: '#9fc0cf' }}>{item.place}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
