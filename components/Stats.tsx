import { useTranslations } from 'next-intl';

interface StatItem { num: string; label: string }

export default function Stats() {
  const t = useTranslations();
  const stats = t.raw('stats') as StatItem[];

  return (
    <section style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(40px,5vw,64px) clamp(20px,5vw,72px)' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '24px' }}>
        {stats.map((item) => (
          <div key={item.label} style={{ borderLeft: '2px solid rgba(20,184,207,.5)', paddingLeft: '18px' }}>
            <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(38px,5vw,56px)', color: '#14b8cf', lineHeight: 1 }}>
              {item.num}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#9fc0cf', marginTop: '6px' }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
