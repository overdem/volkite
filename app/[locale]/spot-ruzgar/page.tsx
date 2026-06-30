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
  const t = await getTranslations({ locale, namespace: 'spot_page' });
  return {
    title: t('h1'),
    description: t('subtitle'),
  };
}

const spotStats = [
  { num: '50m', label: 'Sığlık — Güvenli Öğrenme Alanı', desc: '50 metre boyunca sığ su. Düşme korkusu olmadan, sadece ayağa kalkıp tekrar dene.' },
  { num: '100m', label: 'Kumsal Uzunluğu', desc: 'Geniş kıyı şeridi; kite lansmanı ve inişi için yeterli alan, diğer plajcılardan uzak.' },
  { num: '4km', label: 'Trafiksiz Koy', desc: 'Kefaloz Koyu 4 km boyunca uzanır. Hiçbir tekne trafiği, sadece rüzgar ve kiter\'lar.' },
  { num: '600m', label: 'Özel Eğitim Alanı', desc: 'Okulun tahsis edilmiş 600 metre eğitim koridoru. Yeni başlayanlar için izole ve güvenli.' },
];

const dailyPattern = [
  {
    zaman: '08:00 – 11:00',
    hiz: '8–14 kn',
    durum: 'Sabah sakin',
    detay: 'Rüzgar hafif başlar. Deneyimli kiterlar için sakin sürüş; yeni başlayanlar için teori ve kara egzersizleri.',
    color: '#9fc0cf',
  },
  {
    zaman: '11:00 – 13:00',
    hiz: '18–22 kn',
    durum: 'Ana rüzgar saati',
    detay: 'Poyrazın en verimli dilimi. Yeni başlayanlar ve orta seviyeler için ideal. IKO eğitimlerinin büyük bölümü bu saatlerde.',
    color: '#14b8cf',
  },
  {
    zaman: '13:00 – 15:00',
    hiz: '~10 kn',
    durum: 'Öğle sakinliği',
    detay: 'Rüzgar geçici olarak düşer. Cafe On Shore\'da öğle molası, masaj veya dinlenme için mükemmel zaman.',
    color: '#9fc0cf',
  },
  {
    zaman: '15:00 – 19:00',
    hiz: '15–22 kn',
    durum: 'Öğleden sonra güçleniyor',
    detay: 'Rüzgar yeniden artışa geçer ve akşama kadar sürer. İleri seviye ve freestyle session\'lar için en iyi dilim.',
    color: '#14b8cf',
  },
  {
    zaman: '19:00+',
    hiz: '20+ kn',
    durum: 'Gün batımı rüzgarı',
    detay: 'Güneş inerken rüzgar en güçlü halinde. Deneyimli kiterlar için ikonik Gökçeada gün batımı session\'ı.',
    color: '#ff6a3d',
  },
];

export default async function SpotRuzgarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'spot_page' });

  type WindPattern = { time: string; desc: string };
  const windPattern = t.raw('wind_pattern') as WindPattern[];
  const spotFeatures = t.raw('spot_features') as string[];

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
            <p style={{ color: '#9fc0cf', fontSize: 'clamp(15px,1.8vw,18px)', lineHeight: 1.6, maxWidth: '620px' }}>
              {t('subtitle')}
            </p>
          </div>
        </section>

        {/* Poetic opening */}
        <section style={{ background: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '24px' }}>
              Gökçeada’yı Keşfet
            </div>
            <p style={{ fontSize: '20px', lineHeight: 1.8, color: '#3a5563', marginBottom: '24px', fontStyle: 'italic' }}>
              Evden çıkıp maceraya atılmak istiyorsan, Gökçeada tam sana göre. Türkiye’nin en büyük adası, en az kalabalık köyü, en güçlü poyrazı.
            </p>
            <p style={{ fontSize: '17px', lineHeight: 1.75, color: '#3a5563', marginBottom: '20px' }}>
              Kefaloz Koyu’na ayak bastığında, rüzgarın seni nasıl karşıladığını hissedersin. Poyraz her sabah aynı sadakatle eser — güneş doğduğunda başlar, gün batar bitmez güçlenir. Bu güvenilir döngü, kitesurf öğrenmek için dünyanın en iyi koşullarından birini yaratır.
            </p>
            <p style={{ fontSize: '17px', lineHeight: 1.75, color: '#3a5563', marginBottom: '20px' }}>
              Onshore rüzgar demek, suyun içinde kaybolsan bile kıyıya döneceğin anlamına gelir. 50 metre boyunca sığ su demek, ilk düşüşlerinde ayağa kolayca kalkabileceğin anlamına gelir. 4 km trafiksiz koy demek, sadece gökyüzüne ve ufka odaklanabileceğin anlamına gelir.
            </p>
            <p style={{ fontSize: '17px', lineHeight: 1.75, color: '#3a5563' }}>
              Sezon Nisan’dan Kasım’a kadar sürer. Temmuz-Ekim yüksek sezondur: en güçlü ve en istikrarlı rüzgarlar, en uzun günler, en canlı ada hayatı.
            </p>
          </div>
        </section>

        {/* Spot stat cards */}
        <section style={{ background: '#062131', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Spot Özellikleri
            </div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(28px,3.5vw,48px)', lineHeight: 0.98, marginBottom: '44px' }}>
              Kefaloz Koyu Neden Bu Kadar İyi?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px', marginBottom: '56px' }}>
              {spotStats.map((stat) => (
                <div
                  key={stat.num}
                  style={{ background: '#0c3346', border: '1px solid rgba(255,255,255,.08)', borderRadius: '18px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}
                >
                  <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '44px', color: '#14b8cf', lineHeight: 1 }}>{stat.num}</div>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#fbf6ec' }}>{stat.label}</div>
                  <p style={{ color: '#9fc0cf', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{stat.desc}</p>
                </div>
              ))}
            </div>

            {/* Wind info from messages */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 'clamp(36px,5vw,64px)' }}>
              <div>
                <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '22px' }}>
                  {t('wind_title')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { label: t('wind_direction') },
                    { label: t('wind_type') },
                    { label: t('wind_season') },
                    { label: t('wind_high') },
                    { label: t('wind_avg') },
                    { label: t('wind_strong') },
                  ].map((row, i) => (
                    <div
                      key={i}
                      style={{ padding: '14px 18px', background: 'rgba(12,51,70,.6)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '12px', fontSize: '15px', color: '#bcd4de', lineHeight: 1.5 }}
                    >
                      {row.label}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '22px' }}>
                  {t('wind_pattern_title')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {windPattern.map((row, i) => (
                    <div
                      key={i}
                      style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', padding: '16px 0', borderBottom: i < windPattern.length - 1 ? '1px solid rgba(255,255,255,.07)' : 'none', alignItems: 'center' }}
                    >
                      <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '18px', color: '#14b8cf' }}>{row.time}</div>
                      <div style={{ fontSize: '15px', color: '#bcd4de' }}>{row.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed daily wind pattern */}
        <section style={{ background: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Günlük Rüzgar Döngüsü
            </div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(26px,3.5vw,44px)', lineHeight: 0.98, color: '#07283b', marginBottom: '40px' }}>
              Gökçeada’da Bir Kite Günü Nasıl Geçer?
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {dailyPattern.map((slot, i) => (
                <div
                  key={slot.zaman}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'clamp(120px,18vw,200px) clamp(60px,9vw,100px) 1fr',
                    gap: '20px',
                    padding: '24px 0',
                    borderBottom: i < dailyPattern.length - 1 ? '1px solid #ece1cc' : 'none',
                    alignItems: 'start',
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '15px', color: '#07283b', lineHeight: 1.2 }}>{slot.zaman}</div>
                    <div style={{ fontSize: '13px', color: '#3a5563', marginTop: '4px' }}>{slot.durum}</div>
                  </div>
                  <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '22px', color: slot.color, lineHeight: 1 }}>{slot.hiz}</div>
                  <div style={{ fontSize: '15px', color: '#3a5563', lineHeight: 1.65 }}>{slot.detay}</div>
                </div>
              ))}
            </div>

            {/* Spot features from messages */}
            <div style={{ marginTop: '48px' }}>
              <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '22px' }}>
                {t('spot_title')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px' }}>
                {spotFeatures.map((feat, i) => (
                  <div
                    key={i}
                    style={{ background: '#fff', border: '1px solid #ece1cc', borderRadius: '14px', padding: '22px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#14b8cf', flexShrink: 0, marginTop: '7px' }} />
                    <span style={{ fontSize: '15px', color: '#07283b', lineHeight: 1.55, fontWeight: 600 }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Island section */}
        <section style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 'clamp(36px,5vw,64px)', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
                {t('island_title')}
              </div>
              <p style={{ color: '#bcd4de', fontSize: '16px', lineHeight: 1.75, marginBottom: '32px' }}>
                {t('island_desc')}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <a
                  href="https://kiting.live/kitesurf-spot/wave-gokceada-turkey"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(20,184,207,.14)', border: '1px solid rgba(20,184,207,.5)', color: '#14b8cf', fontWeight: 800, padding: '13px 22px', borderRadius: '11px', textDecoration: 'none', fontSize: '15px' }}
                >
                  {t('live_wind_cta')}
                </a>
                <Link
                  href="/#rezervasyon"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#ff6a3d', color: '#fff', fontWeight: 800, padding: '13px 22px', borderRadius: '11px', textDecoration: 'none', fontSize: '15px' }}
                >
                  Kayıt Yaptır →
                </Link>
              </div>
            </div>
            <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '18px', overflow: 'hidden', background: 'linear-gradient(135deg,#16384a 0%,#0c3346 100%)' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'monospace', fontSize: '13px', letterSpacing: '.1em', color: 'rgba(255,255,255,.3)', textTransform: 'uppercase' }}>
                GÖKÇEADA
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
