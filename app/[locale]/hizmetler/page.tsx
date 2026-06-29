import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getServices } from '@/lib/queries';
import type { Locale } from '@/lib/queries';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'services_page' });
  return {
    title: t('h1'),
    description: t('subtitle'),
  };
}

export default async function HizmetlerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'services_page' });
  const tServices = await getTranslations({ locale, namespace: 'services' });

  const services = await getServices(locale as Locale);
  type ServiceItem = { no: string; name: string; desc: string };
  const items: ServiceItem[] = services ?? (tServices.raw('items') as ServiceItem[]);

  type RentalItem = { name: string; desc: string; price: string };
  const rentalItems = t.raw('rental_items') as RentalItem[];

  type PriceEntry = { label: string; price: string };
  type MassageItem = { name: string; prices: PriceEntry[] };
  const massageItems = t.raw('massage_items') as MassageItem[];

  return (
    <main style={{ fontFamily: 'Manrope, sans-serif', color: '#07283b' }}>
      {/* Hero */}
      <section style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(48px,7vw,100px) clamp(20px,5vw,72px) clamp(56px,8vw,112px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <Link
            href="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#9fc0cf', textDecoration: 'none', fontSize: '14px', fontWeight: 700, marginBottom: '40px' }}
          >
            {t('back')}
          </Link>
          <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
            {t('kicker')}
          </div>
          <h1 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(40px,6vw,84px)', lineHeight: 0.95, marginBottom: '22px' }}>
            {t('h1')}
          </h1>
          <p style={{ color: '#9fc0cf', fontSize: 'clamp(15px,1.8vw,18px)', lineHeight: 1.6, maxWidth: '600px' }}>
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Services grid from Supabase */}
      <section style={{ background: '#062131', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px' }}>
            {items.map((item) => (
              <div
                key={item.no}
                style={{ background: '#0c3346', border: '1px solid rgba(255,255,255,.08)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '160px' }}
              >
                <span style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '20px', color: '#14b8cf' }}>{item.no}</span>
                <h3 style={{ fontSize: '19px', fontWeight: 800, margin: 0 }}>{item.name}</h3>
                <p style={{ color: '#9fc0cf', fontSize: '14px', lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rental & Storage */}
      <section style={{ background: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
            {t('rental_title')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '18px', marginBottom: '14px' }}>
            {rentalItems.map((item) => (
              <div
                key={item.name}
                style={{ background: '#fff', border: '1px solid #ece1cc', borderRadius: '16px', padding: '26px', display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '22px', color: '#07283b' }}>{item.name}</div>
                <div style={{ color: '#3a5563', fontSize: '14px', lineHeight: 1.5 }}>{item.desc}</div>
                <div style={{ fontWeight: 800, fontSize: '18px', color: '#ff6a3d', marginTop: '4px' }}>{item.price}</div>
              </div>
            ))}
          </div>
          <p style={{ color: '#3a5563', fontSize: '13px', marginTop: '4px' }}>{t('rental_note')}</p>
        </div>
      </section>

      {/* Massage Therapy */}
      <section style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
            {t('massage_title')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '18px', marginBottom: '36px' }}>
            {massageItems.map((item) => (
              <div
                key={item.name}
                style={{ background: '#0c3346', border: '1px solid rgba(255,255,255,.08)', borderRadius: '16px', padding: '26px', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <h3 style={{ fontWeight: 800, fontSize: '17px', margin: 0 }}>{item.name}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {item.prices.map((p) => (
                    <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '14px' }}>
                      <span style={{ color: '#9fc0cf' }}>{p.label}</span>
                      <span style={{ fontWeight: 800, color: '#fbf6ec' }}>{p.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/#rezervasyon"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#ff6a3d', color: '#fff', fontWeight: 800, padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontSize: '16px' }}
          >
            {t('cta')}
          </Link>
        </div>
      </section>
    </main>
  );
}
