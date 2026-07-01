import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getServices } from '@/lib/queries';
import type { Locale } from '@/lib/queries';
import Nav from '@/components/Nav';

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

const massageTable = [
  { name: 'Klasik Masaj', dur1: '1 saat', price1: '40€', dur2: '30 dk', price2: '25€' },
  { name: 'Spor Masajı', dur1: '1 saat', price1: '40€', dur2: '30 dk', price2: '25€' },
  { name: 'İç Organ Masajı', dur1: '45 dk', price1: '65€', dur2: null, price2: null },
  { name: 'Duygu Boşaltım Masajı', dur1: '1 saat', price1: '70€', dur2: null, price2: null },
  { name: 'Thai Masajı', dur1: '1 saat', price1: '50€', dur2: null, price2: null },
  { name: 'Face Lifting Masajı', dur1: '20 dk', price1: '25€', dur2: null, price2: null },
  { name: 'Ayak Masajı', dur1: '30 dk', price1: '30€', dur2: null, price2: null },
];

const serviceDescriptions: Record<string, string> = {
  '01': 'Eğitim biterken kendinize yeni ya da kullanılmış Slingshot ekipmanlardan almayı unutmayın. Yetkili Slingshot bayi olarak size en uygun ekipmanı seçmenizde yardımcı oluyoruz.',
  '02': 'Tam donanımlı profesyonel kitesurf ekipmanı kiralamak isteyenler için tüm malzeme yanınızda — kite, board ve harness dahil. Günlük 80€. Ekipman seçiminde eğitmenlerimiz yardımcı olur.',
  '03': 'Kendi ekipmanınızı Gökçeada\'ya taşımak zorunda değilsiniz. Güvenli, kilitli depolarımızda ekipmanınızı sezonu boyunca veya günlük olarak saklayabilirsiniz. Depolama ücreti günlük 5€.',
  '04': 'Uçurtmanızı veya tahtanızı onarmak mı gerekiyor? Sahada küçük onarımlardan büyük trampolin yamalarına kadar profesyonel tamir hizmeti sunuyoruz. Fiyat için malzemeyi yerinde değerlendiriyoruz.',
  '05': '2 saatlik downwinder maceraya hazır olun! Eğitmenlerimiz eşliğinde Gökçeada\'nın farklı koylarına kite ile yolculuk. Fiyatlar güzergah ve grup büyüklüğüne göre değişir.',
  '06': 'Sporcu yorgunluğunu gidermek, sakatlıkları önlemek ve performansı artırmak için uzman masör ekibimizden profesyonel masaj. Klasik, spor, Thai, iç organ ve daha birçok seçenek.',
  '07': 'Rüzgar yoksa da suya gir! Tekne arkasında wakeboard ile hem eğlenceli hem de güvenli bir su sporu deneyimi yaşayın.',
};

// Service no -> anchor ID mapping
const serviceAnchors: Record<string, string> = {
  '01': 'satis',
  '02': 'kiralama',
  '03': 'depolama',
  '04': 'tamir',
  '05': 'safari',
  '06': 'masaj',
  '07': 'wakeboard',
};

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

  return (
    <>
      <Nav />
      <main style={{ fontFamily: 'Manrope, sans-serif', color: '#07283b' }}>
        {/* Hero */}
        <section style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(100px,12vw,140px) clamp(20px,5vw,72px) clamp(56px,8vw,112px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
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

        {/* Services grid — full descriptions */}
        <section style={{ background: '#062131', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Tüm Hizmetler
            </div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(28px,3.5vw,48px)', lineHeight: 0.98, marginBottom: '44px' }}>
              Volkite Hizmet Yelpazesi
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '24px' }}>
              {items.map((item) => (
                <div
                  key={item.no}
                  id={serviceAnchors[item.no] ?? undefined}
                  style={{ background: '#0c3346', border: '1px solid rgba(255,255,255,.08)', borderRadius: '18px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '14px', scrollMarginTop: '80px' }}
                >
                  <span style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '20px', color: '#14b8cf' }}>{item.no}</span>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>{item.name}</h3>
                  <p style={{ color: '#bcd4de', fontSize: '15px', lineHeight: 1.65, margin: 0 }}>
                    {serviceDescriptions[item.no] ?? item.desc}
                  </p>
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
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(26px,3.5vw,44px)', lineHeight: 0.98, color: '#07283b', marginBottom: '36px' }}>
              Kiralama ve Depolama Fiyatları
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '18px', marginBottom: '24px' }}>
              {rentalItems.map((item) => (
                <div
                  key={item.name}
                  style={{ background: '#fff', border: '1px solid #ece1cc', borderRadius: '16px', padding: '26px', display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '22px', color: '#07283b' }}>{item.name}</div>
                  <div style={{ color: '#3a5563', fontSize: '14px', lineHeight: 1.5 }}>{item.desc}</div>
                  <div style={{ fontWeight: 800, fontSize: '20px', color: '#ff6a3d', marginTop: '4px' }}>{item.price}</div>
                </div>
              ))}
            </div>
            <p style={{ color: '#3a5563', fontSize: '13px' }}>{t('rental_note')}</p>
          </div>
        </section>

        {/* Massage table */}
        <section style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              {t('massage_title')}
            </div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(26px,3.5vw,44px)', lineHeight: 0.98, marginBottom: '16px' }}>
              Masaj & Wellness Fiyat Listesi
            </h2>
            <p style={{ color: '#9fc0cf', fontSize: '15px', lineHeight: 1.7, maxWidth: '680px', marginBottom: '40px' }}>
              Kitesurfun ardından kas yorgunluğunu gidermek, kasılmaları çözmek ve bir sonraki güne hazırlanmak için profesyonel masaj hizmetlerimizden yararlanabilirsiniz. Rezervasyon için kafede veya ofiste bilgi alın.
            </p>
            <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid rgba(255,255,255,.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
                <thead>
                  <tr style={{ background: '#0c3346' }}>
                    <th style={{ textAlign: 'left', padding: '16px 20px', color: '#14b8cf', fontWeight: 800, fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase' }}>Masaj Türü</th>
                    <th style={{ textAlign: 'center', padding: '16px 20px', color: '#14b8cf', fontWeight: 800, fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Süre 1</th>
                    <th style={{ textAlign: 'right', padding: '16px 20px', color: '#14b8cf', fontWeight: 800, fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Fiyat</th>
                    <th style={{ textAlign: 'center', padding: '16px 20px', color: '#14b8cf', fontWeight: 800, fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Süre 2</th>
                    <th style={{ textAlign: 'right', padding: '16px 20px', color: '#14b8cf', fontWeight: 800, fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Fiyat</th>
                  </tr>
                </thead>
                <tbody>
                  {massageTable.map((row, i) => (
                    <tr
                      key={row.name}
                      style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(12,51,70,.4)', borderBottom: i < massageTable.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none' }}
                    >
                      <td style={{ padding: '16px 20px', color: '#fbf6ec', fontWeight: 700 }}>{row.name}</td>
                      <td style={{ padding: '16px 20px', color: '#9fc0cf', textAlign: 'center' }}>{row.dur1}</td>
                      <td style={{ padding: '16px 20px', color: '#fbf6ec', fontWeight: 800, textAlign: 'right' }}>{row.price1}</td>
                      <td style={{ padding: '16px 20px', color: '#9fc0cf', textAlign: 'center' }}>{row.dur2 ?? '—'}</td>
                      <td style={{ padding: '16px 20px', color: '#fbf6ec', fontWeight: 800, textAlign: 'right' }}>{row.price2 ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '40px' }}>
              <Link
                href="/#iletisim"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#ff6a3d', color: '#fff', fontWeight: 800, padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontSize: '16px' }}
              >
                {t('cta')}
              </Link>
            </div>
          </div>
        </section>

        {/* Konaklama */}
        <section id="konaklama" style={{ background: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)', scrollMarginTop: '80px' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              08 — Konaklama
            </div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(26px,3.5vw,44px)', lineHeight: 0.98, color: '#07283b', marginBottom: '16px' }}>
              Nerede Kalınır?
            </h2>
            <p style={{ fontSize: '17px', lineHeight: 1.7, color: '#3a5563', maxWidth: '680px', marginBottom: '40px' }}>
              Okul yanımızdaki kamp alanında ya da adanın anlaşmalı pansiyon ve otelllerinde konaklamak mümkün. Rezervasyonda en uygun seçeneği birlikte belirleriz.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '20px', marginBottom: '32px' }}>
              {/* Kamp */}
              <div style={{ background: '#fff', border: '1px solid #ece1cc', borderRadius: '18px', padding: '28px' }}>
                <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '20px', color: '#07283b', marginBottom: '10px' }}>Kamp Alanı</div>
                <p style={{ color: '#3a5563', fontSize: '14px', lineHeight: 1.65, marginBottom: '16px' }}>Okulun hemen yanında, koya sıfır. Çadır ve karavan alanı. Sabah kahvaltısı dahil ya da hariç seçenek.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#5a7079' }}>Kahvaltılı</span>
                    <span style={{ fontWeight: 800, fontSize: '18px', color: '#ff6a3d' }}>25€/gece</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#5a7079' }}>Kahvaltısız</span>
                    <span style={{ fontWeight: 800, fontSize: '18px', color: '#ff6a3d' }}>15€/gece</span>
                  </div>
                  <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(20,184,207,.08)', borderRadius: '8px', fontSize: '13px', color: '#14b8cf', fontWeight: 700 }}>
                    Öğrencilik günlerinde %50 indirim
                  </div>
                </div>
              </div>
              {/* Anlaşmalı */}
              <div style={{ background: '#fff', border: '1px solid #ece1cc', borderRadius: '18px', padding: '28px' }}>
                <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '20px', color: '#07283b', marginBottom: '10px' }}>Anlaşmalı Konaklama</div>
                <p style={{ color: '#3a5563', fontSize: '14px', lineHeight: 1.65, marginBottom: '16px' }}>Ada genelinde anlaşmalı pansiyon ve otellerimizden yararlanabilirsiniz. Liste ve fiyatlar için bize ulaşın — sizi en uygun seçeneğe yönlendirelim.</p>
                <p style={{ color: '#8497a1', fontSize: '13px', fontStyle: 'italic' }}>Liste yakında güncelleniyor — şimdilik bize sorun.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
