import { useTranslations } from 'next-intl';
import type { ServiceRow } from '@/lib/queries';

interface Props {
  services?: ServiceRow[] | null;
}

export default function Services({ services }: Props) {
  const t = useTranslations('services');

  type ServiceItem = { no: string; name: string; desc: string };
  const items: ServiceItem[] = services ?? (t.raw('items') as ServiceItem[]);

  return (
    <section id="hizmetler" style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(64px,8vw,120px) clamp(20px,5vw,72px)' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', marginBottom: '16px', textTransform: 'uppercase' }}>
          {t('kicker')}
        </div>
        <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(34px,4.5vw,60px)', marginBottom: '44px' }}>
          {t('title')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '18px' }}>
          {items.map((item) => (
            <div
              key={item.no}
              className="service-card"
              style={{ background: '#0c3346', border: '1px solid rgba(255,255,255,.08)', borderRadius: '16px', padding: '26px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '160px', transition: 'background .25s' }}
            >
              <span style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '18px', color: '#14b8cf' }}>{item.no}</span>
              <h3 style={{ fontSize: '19px', fontWeight: 800 }}>{item.name}</h3>
              <p style={{ color: '#9fc0cf', fontSize: '14px', lineHeight: 1.55 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
