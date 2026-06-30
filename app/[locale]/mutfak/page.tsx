import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Nav from '@/components/Nav';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'kitchen_page' });
  return {
    title: t('h1'),
    description: t('subtitle'),
  };
}

const menuCategories = [
  {
    id: 'ana',
    label: 'Ana Yemek',
    color: '#ff6a3d',
    items: [
      { name: 'Beğendili Antrikot', desc: 'Közlenmiş patlıcan beğendi üzerinde ızgara antrikot, yanında taze roka ve domates salatası.' },
      { name: 'Cordon Bleu', desc: 'Dana göğsünde jambon ve eritilmiş kaşar dolması, çıtır un kaplama. Ev yapımı soslarla servis.' },
      { name: 'Viyana Usulü Dana Şinitzel', desc: 'İnce dövenmiş dana şinitzel, geleneksel Viyana tarifiyle pişirilmiş, limon ve kapariyle servis.' },
    ],
  },
  {
    id: 'burger',
    label: 'Burger',
    color: '#ff6a3d',
    items: [
      { name: 'Kiteloop Burger', desc: 'Özel Volkite burger eti, çok katlı cheddar, jambon, kornişon ve özel burger sosu. Sporseverlerin favorisi.' },
      { name: 'Volkite Burger', desc: 'Ev yapımı burger eti, karamelize soğan, roka ve taze domates. Sade ama mükemmel.' },
      { name: 'Cheeseburger', desc: 'Klasik cheeseburger — çift cheddar, özel sos, freze marul. Her zaman geçerli.' },
    ],
  },
  {
    id: 'pizza',
    label: 'Pizza',
    color: '#ff6a3d',
    items: [
      { name: 'Volkite Pizza', desc: 'Domates sos, mozarella, sucuk, biber, mantar ve kalamata zeytin. Adanın en dolu pizzası.' },
      { name: 'Vejeteryan Pizza', desc: 'Taze mevsim sebzeleri, roka, cherry domates, parmesan ve zeytinyağı. Hafif ve besleyici.' },
      { name: 'Smoke Pizza', desc: 'Tütsülenmiş et, közlenmiş biber, BBQ sos ve mozarella. Deniz kıyısında bir BBQ deneyimi.' },
    ],
  },
  {
    id: 'makarna',
    label: 'Makarna',
    color: '#ff6a3d',
    items: [
      { name: 'Penne Arabiata', desc: 'Acılı domates sosu, sarımsak ve taze fesleğen. Enerji yüklemek için mükemmel ders öncesi öğün.' },
      { name: 'Etli Penne Alfredo', desc: 'Krema bazlı alfredo sos, tavuk veya dana eti, parmesan. Yoğun antrenman sonrası protein deposu.' },
      { name: 'Penne Vejeteryan', desc: 'Mevsim sebzeleri, zeytinyağı ve sarımsak sosu. Hafif ama doyurucu.' },
    ],
  },
  {
    id: 'tatli',
    label: 'Tatlı',
    color: '#ff6a3d',
    items: [
      { name: 'Trileçe', desc: 'Arnavutluk mutfağından üç sütlü ıslak kek. Kremsi dokusuyla en çok sevilen tatlımız.' },
      { name: 'Cheesecake', desc: 'Günlük taze yapılan cheesecake, mevsim meyveli sos ile. Tükenmeden sorun!' },
      { name: 'Çikolata Şelale', desc: 'Sıcak çikolata fondü şelalesi, meyve ve bisküvi dip. Gruplara özel sipariş edilebilir.' },
    ],
  },
];

const specialEvents = [
  { title: 'BBQ Geceleri', desc: 'Haftalık açık hava barbekü gecesi. Yerel et ürünleri, közde sebze ve canlı müzik.' },
  { title: 'Doğum Günü Partileri', desc: 'Deniz kenarında unutulmaz bir kutlama. Özel menü, pasta ve dekorasyon için önceden bilgi alın.' },
  { title: 'Sinema Gecesi', desc: 'Açık hava ekranında kitesurf videoları ve klasik film geceleri. Yıldızlar altında, deniz esintisiyle.' },
  { title: 'Mangal Keyfi', desc: 'Kendi mangalınızı yakın, bizden malzeme ve doğa ikilisi. Öğrenci grupları için özel alan.' },
  { title: 'Kuzu Çevirme', desc: 'Özel etkinlikler için rezervasyonla. Geleneksel kuzu çevirme şöleni, Gökçeada\'nın en unutulmaz deneyimlerinden biri.' },
];

export default async function MutfakPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'kitchen_page' });

  const teamMembers = t.raw('team') as string[];

  return (
    <>
      <Nav />
      <main style={{ fontFamily: 'Manrope, sans-serif', color: '#07283b' }}>
        {/* Hero */}
        <section style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(100px,12vw,140px) clamp(20px,5vw,72px) clamp(56px,8vw,112px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ color: '#ff6a3d', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
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

        {/* Opening — full description */}
        <section style={{ background: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ color: '#ff6a3d', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '24px' }}>
              Kiteboard Öncesi ve Sonrası Enerji Depolama Yeri
            </div>
            <p style={{ fontSize: '18px', lineHeight: 1.8, color: '#3a5563', marginBottom: '20px' }}>
              {t('desc')}
            </p>
            <p style={{ fontSize: '17px', lineHeight: 1.75, color: '#3a5563', marginBottom: '20px' }}>
              Cafe On Shore, Kefaloz Koyu’na sıfır konumda, kitesurf okulunun hemen yanı başında yer alıyor. Sabah kahvaltısından gece birlikte biten günlere kadar her saatte açık — ders aralarında, akşam sohbetlerinde, doğum günlerinde.
            </p>
            <p style={{ fontSize: '17px', lineHeight: 1.75, color: '#3a5563' }}>
              Mutfağımızı Big Mama Deniz Gönül yönetiyor. Şeflerimiz Sezen ve Zeynep, mevsimsel malzemelerle her gün taze pişiriyor. Menü sabit değil — hava nasılsa, rüzgar ne diyorsa, bugünün özel yemeği de ona göre şekilleniyor.
            </p>
          </div>
        </section>

        {/* Menu categories */}
        {menuCategories.map((cat, catIdx) => (
          <section
            key={cat.id}
            style={{
              background: catIdx % 2 === 0 ? '#062131' : '#07283b',
              color: '#fbf6ec',
              padding: 'clamp(48px,6vw,80px) clamp(20px,5vw,72px)',
            }}
          >
            <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
              <div style={{ color: '#ff6a3d', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
                {cat.label}
              </div>
              <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(26px,3.5vw,44px)', lineHeight: 0.98, marginBottom: '36px' }}>
                Geçen Yılın En Sevilenleri — {cat.label}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '20px' }}>
                {cat.items.map((item) => (
                  <div
                    key={item.name}
                    style={{ background: '#0c3346', border: '1px solid rgba(255,255,255,.08)', borderRadius: '18px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                  >
                    <h3 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '22px', margin: 0, color: '#fbf6ec' }}>{item.name}</h3>
                    <p style={{ color: '#bcd4de', fontSize: '14px', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Special events */}
        <section style={{ background: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ color: '#ff6a3d', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              {t('events_title')}
            </div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(26px,3.5vw,44px)', lineHeight: 0.98, color: '#07283b', marginBottom: '40px' }}>
              Özel Etkinlikler
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '20px', marginBottom: '48px' }}>
              {specialEvents.map((ev) => (
                <div
                  key={ev.title}
                  style={{ background: '#fff', border: '1px solid #ece1cc', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}
                >
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#07283b', margin: 0 }}>{ev.title}</h3>
                  <p style={{ color: '#3a5563', fontSize: '14px', lineHeight: 1.65, margin: 0 }}>{ev.desc}</p>
                </div>
              ))}
            </div>
            <Link
              href="/#rezervasyon"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#ff6a3d', color: '#fff', fontWeight: 800, padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontSize: '16px' }}
            >
              {t('read_more')}
            </Link>
          </div>
        </section>

        {/* Team & Contact */}
        <section style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(36px,5vw,64px)' }}>
            <div>
              <div style={{ color: '#ff6a3d', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
                {t('team_title')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {teamMembers.map((member) => (
                  <div
                    key={member}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', background: 'rgba(12,51,70,.5)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '12px' }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#ffe0d4,#ffb89a)', flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: '15px', color: '#fbf6ec' }}>{member}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ color: '#ff6a3d', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
                İletişim
              </div>
              <h3 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '28px', marginBottom: '24px' }}>
                Rezervasyon & Bilgi
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <a
                  href="https://instagram.com/cafe_onshore"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', background: 'rgba(12,51,70,.5)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '12px', textDecoration: 'none', color: '#fbf6ec' }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px' }}>@cafe_onshore</div>
                    <div style={{ color: '#9fc0cf', fontSize: '13px' }}>Instagram</div>
                  </div>
                </a>
                <a
                  href="tel:+905076157915"
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', background: 'rgba(12,51,70,.5)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '12px', textDecoration: 'none', color: '#fbf6ec' }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(20,184,207,.2)', border: '1px solid rgba(20,184,207,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8cf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px' }}>+90 507 615 79 15</div>
                    <div style={{ color: '#9fc0cf', fontSize: '13px' }}>Cafe On Shore</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
