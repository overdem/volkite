import { useTranslations } from 'next-intl';

interface TrustItem { brand: string; title: string; desc: string }

export default function Trust() {
  const t = useTranslations('trust');
  const items = t.raw('items') as TrustItem[];

  return (
    <section style={{ background: '#fbf6ec', padding: 'clamp(56px,7vw,100px) clamp(20px,5vw,72px)' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(28px,3.5vw,46px)', textAlign: 'center', color: '#07283b', marginBottom: '14px' }}>
          {t('title')}
        </h2>
        <p style={{ textAlign: 'center', color: '#5a7079', maxWidth: '560px', margin: '0 auto 48px', fontSize: '16px', lineHeight: 1.6 }}>
          {t('sub')}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px' }}>
          {items.map((item) => (
            <div key={item.brand} style={{ background: '#fff', border: '1px solid #ece1cc', borderRadius: '16px', padding: '28px' }}>
              <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '20px', color: '#14b8cf', letterSpacing: '.04em', marginBottom: '10px' }}>
                {item.brand}
              </div>
              <div style={{ fontWeight: 800, color: '#07283b', marginBottom: '8px', fontSize: '15px' }}>{item.title}</div>
              <p style={{ color: '#5a7079', fontSize: '14px', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
