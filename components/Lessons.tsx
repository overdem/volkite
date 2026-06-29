import { useTranslations } from 'next-intl';

interface Row { label: string; price: string }
interface Level { tag: string; dur: string; title: string; desc: string; rows: Row[]; cta: string }

export default function Lessons() {
  const t = useTranslations('lessons');
  const levels = t.raw('levels') as Level[];

  return (
    <section id="egitimler" style={{ background: '#062131', color: '#fbf6ec', padding: 'clamp(64px,8vw,120px) clamp(20px,5vw,72px)' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', marginBottom: '48px' }}>
          <div>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', marginBottom: '16px', textTransform: 'uppercase' }}>
              {t('kicker')}
            </div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(34px,4.5vw,60px)', lineHeight: .98 }}>
              {t('title')}
            </h2>
          </div>
          <p style={{ maxWidth: '380px', color: '#9fc0cf', fontSize: '16px', lineHeight: 1.6 }}>{t('sub')}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '22px' }}>
          {levels.map((item) => (
            <div
              key={item.tag}
              className="lesson-card"
              style={{ background: '#0c3346', border: '1px solid rgba(255,255,255,.08)', borderRadius: '18px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'transform .25s, border-color .25s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#14b8cf', background: 'rgba(20,184,207,.12)', padding: '6px 12px', borderRadius: '999px' }}>
                  {item.tag}
                </span>
                <span style={{ fontSize: '13px', color: '#9fc0cf', fontWeight: 700 }}>{item.dur}</span>
              </div>
              <h3 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '28px', letterSpacing: '.01em' }}>{item.title}</h3>
              <p style={{ color: '#bcd4de', fontSize: '15px', lineHeight: 1.6, flex: 1 }}>{item.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', padding: '14px 0', borderTop: '1px solid rgba(255,255,255,.08)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                {item.rows.map((r) => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '14px' }}>
                    <span style={{ color: '#9fc0cf' }}>{r.label}</span>
                    <span style={{ fontWeight: 800, color: '#fbf6ec' }}>{r.price}</span>
                  </div>
                ))}
              </div>
              <a href="#rezervasyon" style={{ marginTop: '6px', fontWeight: 800, color: '#ff8a64', textDecoration: 'none', fontSize: '15px' }}>
                {item.cta} →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
