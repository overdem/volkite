import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPackages } from '@/lib/queries';
import type { Locale } from '@/lib/queries';
import Nav from '@/components/Nav';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'lessons_page' });
  return {
    title: t('h1'),
    description: t('subtitle'),
  };
}

const baslagiclDersler = [
  {
    no: 'Ders 1',
    baslik: 'Teori ve Güvenlik',
    sure: '~2 saat',
    icerik:
      'Kite teorisi, rüzgar pencereleri, güvenlik sistemleri, ekipman tanıtımı, deniz ve hava koşullarını okuma, acil durum prosedürleri. Kara üzerinde uçurtma kontrolü.',
  },
  {
    no: 'Ders 2',
    baslik: 'Kite Kontrolü (Kara)',
    sure: '~2 saat',
    icerik:
      'Bar ve güvenlik sistemleri kullanımı, güç üretme ve azaltma egzersizleri, tek elle kontrol, büyük uçurtma ile kara egzersizleri.',
  },
  {
    no: 'Ders 3',
    baslik: 'Body Dragging',
    sure: '~2 saat',
    icerik:
      'Suda kite kontrolü, body dragging tekniği (kolsuz ve kollu), rüzgar penceresinde konumlanma, düşüş ve kurtarma teknikleri.',
  },
  {
    no: 'Ders 4',
    baslik: 'Tahta ile İlk Denemeler',
    sure: '~2 saat',
    icerik:
      'Tahtayı suda tutma, water start denemeleri, kısa mesafe sürüş, dönüş teknikleri, düşme ve kalkış pratikleri.',
  },
  {
    no: 'Ders 5',
    baslik: 'Bağımsız Sürüş',
    sure: '~2 saat',
    icerik:
      'Upwind sürüş, rüzgara karşı gitme teknikleri, dönüş ve yön değiştirme, bağımsız çıkış ve iniş, IKO sertifika değerlendirmesi.',
  },
];

const kesifDersler = [
  {
    no: 'Ders 1',
    baslik: 'Tekrar & Güçlendirme',
    sure: '~2 saat',
    icerik:
      'Mevcut seviye değerlendirmesi, temel becerilerin pekiştirilmesi, body dragging ve water start tekrarı, kite kontrol hassasiyeti.',
  },
  {
    no: 'Ders 2',
    baslik: 'Serbest Sürüş & Yönlendirme',
    sure: '~2 saat',
    icerik:
      'Upwind sürüş geliştirme, crosswind yolculuk, çeşitli koşullarda sürüş pratiği, kişisel gelişim hedefleri belirleme.',
  },
];

const ileriDersler = [
  {
    no: 'Ders 1',
    baslik: 'Jumping Temelleri',
    sure: '~2 saat',
    icerik:
      'Atlama teorisi ve rüzgar penceresi, küçük hava alma pratikleri, güvenli iniş teknikleri, kite döngüleri.',
  },
  {
    no: 'Ders 2',
    baslik: 'Tricks & Maneuvers',
    sure: '~2 saat',
    icerik:
      'Body drag tricks, board-off manevralar, railey & backroll giriş teknikleri, kişisel trick geliştirme.',
  },
  {
    no: 'Ders 3',
    baslik: 'Serbest Programlama',
    sure: '~2 saat',
    icerik:
      'Öğrenci isteğine göre: downwinder, wave riding temelleri veya freestyle trick geliştirme. Kişisel videolu analiz.',
  },
];

export default async function EgitimlerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'lessons_page' });
  const tLessons = await getTranslations({ locale, namespace: 'lessons' });

  const packages = await getPackages(locale as Locale);

  type Level = { tag: string; dur: string; title: string; desc: string; rows: { label: string; price: string }[]; cta: string };
  const levels: Level[] = packages ?? (tLessons.raw('levels') as Level[]);

  const advantages = t.raw('advantages') as string[];

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

        {/* Opening text */}
        <section style={{ background: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '24px' }}>
              Neden Volkite?
            </div>
            <p style={{ fontSize: '18px', lineHeight: 1.8, color: '#3a5563', marginBottom: '20px' }}>
              Daha fazla ertelemeden, hayatına yeni bir pencere aç! Volkite olarak kitesurf öğrenmeyi hem güvenli hem de çok eğlenceli hale getirmek için buradayız. IKO sertifikalı eğitmenlerimiz ve Gökçeada’nın eşsiz doğasıyla seni bekliyoruz.
            </p>
            <p style={{ fontSize: '17px', lineHeight: 1.75, color: '#3a5563' }}>
              Her seviyeye uygun programlarımızla, sıfır deneyimden profesyonel sürüşe uzanan yolculuğun her adımında yanındayız. Küçük gruplar, birebir dikkat ve gerçek bir sporcu deneyimi — bunlar Volkite farkı.
            </p>
          </div>
        </section>

        {/* Advantages */}
        <section style={{ background: '#062131', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              {t('advantages_title')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '18px' }}>
              {advantages.map((adv, i) => (
                <div
                  key={i}
                  style={{ background: '#0c3346', border: '1px solid rgba(255,255,255,.08)', borderRadius: '16px', padding: '26px 24px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}
                >
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(20,184,207,.12)', border: '2px solid #14b8cf', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5l3.5 3.5L11 1" stroke="#14b8cf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p style={{ fontSize: '15px', lineHeight: 1.55, color: '#fbf6ec', fontWeight: 600, margin: 0 }}>{adv}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Programs with lesson tables */}
        <section style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Programlar
            </div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(30px,4vw,52px)', lineHeight: 0.98, marginBottom: '56px' }}>
              Tüm Eğitim Paketleri
            </h2>

            {/* Başlangıç Paketi */}
            <div style={{ background: '#0c3346', border: '1px solid rgba(255,255,255,.08)', borderRadius: '18px', padding: 'clamp(28px,4vw,48px)', marginBottom: '32px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '28px' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#14b8cf', background: 'rgba(20,184,207,.12)', padding: '6px 14px', borderRadius: '999px', display: 'inline-block', marginBottom: '16px' }}>
                    Başlangıç
                  </span>
                  <h3 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(26px,3.5vw,42px)', margin: 0 }}>
                    Başlangıç Paketi — 10 Saat
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '36px', color: '#14b8cf' }}>700€</div>
                  <div style={{ color: '#9fc0cf', fontSize: '13px' }}>veya 80€/saat · öğrenci 600€</div>
                </div>
              </div>
              <p style={{ color: '#bcd4de', fontSize: '16px', lineHeight: 1.7, marginBottom: '32px', maxWidth: '700px' }}>
                Hiç kitesurf deneyimi olmayan kişiler için tasarlanan kapsamlı başlangıç programı. 5 derste güvenli ve bağımsız bir kiter olarak suya çıkacaksın. IKO Level 1 sertifikasına uygun müfredat.
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,.15)' }}>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#14b8cf', fontWeight: 800, fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Ders</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#14b8cf', fontWeight: 800, fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase' }}>Başlık</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#14b8cf', fontWeight: 800, fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Süre</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#14b8cf', fontWeight: 800, fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase' }}>İçerik</th>
                    </tr>
                  </thead>
                  <tbody>
                    {baslagiclDersler.map((ders, i) => (
                      <tr key={ders.no} style={{ borderBottom: i < baslagiclDersler.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
                        <td style={{ padding: '16px', color: '#14b8cf', fontFamily: 'Anton, Impact, sans-serif', fontSize: '16px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{ders.no}</td>
                        <td style={{ padding: '16px', color: '#fbf6ec', fontWeight: 700, verticalAlign: 'top', whiteSpace: 'nowrap' }}>{ders.baslik}</td>
                        <td style={{ padding: '16px', color: '#9fc0cf', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{ders.sure}</td>
                        <td style={{ padding: '16px', color: '#bcd4de', lineHeight: 1.6, verticalAlign: 'top' }}>{ders.icerik}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '24px' }}>
                <Link
                  href="/#rezervasyon"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ff6a3d', color: '#fff', fontWeight: 800, padding: '13px 24px', borderRadius: '11px', textDecoration: 'none', fontSize: '15px' }}
                >
                  Kayıt Yaptır →
                </Link>
              </div>
            </div>

            {/* Keşif & Devam */}
            <div style={{ background: '#0c3346', border: '1px solid rgba(255,255,255,.08)', borderRadius: '18px', padding: 'clamp(28px,4vw,48px)', marginBottom: '32px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '28px' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#ff6a3d', background: 'rgba(255,106,61,.12)', padding: '6px 14px', borderRadius: '999px', display: 'inline-block', marginBottom: '16px' }}>
                    Orta Seviye
                  </span>
                  <h3 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(26px,3.5vw,42px)', margin: 0 }}>
                    Keşif & Devam — 4 Saat
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#9fc0cf', fontSize: '15px', fontWeight: 600 }}>Fiyat için bize sorun</div>
                </div>
              </div>
              <p style={{ color: '#bcd4de', fontSize: '16px', lineHeight: 1.7, marginBottom: '32px', maxWidth: '700px' }}>
                Temel becerileri öğrenmiş, ancak bazı konularda daha fazla pratik yapmak isteyen kiterlar için. Mevcut seviyeni değerlendirip, en çok gelişim ihtiyacın olan alanlara odaklanıyoruz.
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,.15)' }}>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#14b8cf', fontWeight: 800, fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Ders</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#14b8cf', fontWeight: 800, fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase' }}>Başlık</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#14b8cf', fontWeight: 800, fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Süre</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#14b8cf', fontWeight: 800, fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase' }}>İçerik</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kesifDersler.map((ders, i) => (
                      <tr key={ders.no} style={{ borderBottom: i < kesifDersler.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
                        <td style={{ padding: '16px', color: '#14b8cf', fontFamily: 'Anton, Impact, sans-serif', fontSize: '16px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{ders.no}</td>
                        <td style={{ padding: '16px', color: '#fbf6ec', fontWeight: 700, verticalAlign: 'top', whiteSpace: 'nowrap' }}>{ders.baslik}</td>
                        <td style={{ padding: '16px', color: '#9fc0cf', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{ders.sure}</td>
                        <td style={{ padding: '16px', color: '#bcd4de', lineHeight: 1.6, verticalAlign: 'top' }}>{ders.icerik}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '24px' }}>
                <Link
                  href="/#rezervasyon"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,106,61,.14)', border: '1px solid rgba(255,106,61,.5)', color: '#ff8a64', fontWeight: 800, padding: '13px 24px', borderRadius: '11px', textDecoration: 'none', fontSize: '15px' }}
                >
                  Fiyat Al →
                </Link>
              </div>
            </div>

            {/* İleri Seviye */}
            <div style={{ background: '#0c3346', border: '1px solid rgba(255,255,255,.08)', borderRadius: '18px', padding: 'clamp(28px,4vw,48px)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '28px' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9fc0cf', background: 'rgba(159,192,207,.12)', padding: '6px 14px', borderRadius: '999px', display: 'inline-block', marginBottom: '16px' }}>
                    İleri Seviye
                  </span>
                  <h3 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(26px,3.5vw,42px)', margin: 0 }}>
                    İleri Seviye Eğitim
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '36px', color: '#14b8cf' }}>80€</div>
                  <div style={{ color: '#9fc0cf', fontSize: '13px' }}>saat başına</div>
                </div>
              </div>
              <p style={{ color: '#bcd4de', fontSize: '16px', lineHeight: 1.7, marginBottom: '32px', maxWidth: '700px' }}>
                Bağımsız kitesurf yapabilen, atlama ve trick öğrenmek isteyen sporcular için. Kişisel hedeflerine göre özelleştirilen program. Freestyle, wave riding veya downwinder — seçim senin.
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,.15)' }}>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#14b8cf', fontWeight: 800, fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Ders</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#14b8cf', fontWeight: 800, fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase' }}>Başlık</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#14b8cf', fontWeight: 800, fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Süre</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#14b8cf', fontWeight: 800, fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase' }}>İçerik</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ileriDersler.map((ders, i) => (
                      <tr key={ders.no} style={{ borderBottom: i < ileriDersler.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
                        <td style={{ padding: '16px', color: '#14b8cf', fontFamily: 'Anton, Impact, sans-serif', fontSize: '16px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{ders.no}</td>
                        <td style={{ padding: '16px', color: '#fbf6ec', fontWeight: 700, verticalAlign: 'top', whiteSpace: 'nowrap' }}>{ders.baslik}</td>
                        <td style={{ padding: '16px', color: '#9fc0cf', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{ders.sure}</td>
                        <td style={{ padding: '16px', color: '#bcd4de', lineHeight: 1.6, verticalAlign: 'top' }}>{ders.icerik}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '24px' }}>
                <Link
                  href="/#rezervasyon"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(20,184,207,.14)', border: '1px solid rgba(20,184,207,.5)', color: '#14b8cf', fontWeight: 800, padding: '13px 24px', borderRadius: '11px', textDecoration: 'none', fontSize: '15px' }}
                >
                  İletişime Geç →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Package cards from messages/Supabase */}
        <section style={{ background: '#062131', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Hızlı Karşılaştırma
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '28px' }}>
              {levels.map((item) => (
                <div
                  key={item.tag}
                  style={{ background: '#0c3346', border: '1px solid rgba(255,255,255,.08)', borderRadius: '18px', padding: '34px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#14b8cf', background: 'rgba(20,184,207,.12)', padding: '6px 14px', borderRadius: '999px' }}>
                      {item.tag}
                    </span>
                    <span style={{ fontSize: '13px', color: '#9fc0cf', fontWeight: 700 }}>{item.dur}</span>
                  </div>
                  <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '30px', letterSpacing: '.01em', margin: 0 }}>
                    {item.title}
                  </h2>
                  <p style={{ color: '#bcd4de', fontSize: '15px', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,.08)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                    {item.rows.map((r) => (
                      <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '14px' }}>
                        <span style={{ color: '#9fc0cf' }}>{r.label}</span>
                        <span style={{ fontWeight: 800, color: '#fbf6ec' }}>{r.price}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/#rezervasyon"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#ff8a64', textDecoration: 'none', fontSize: '15px' }}
                  >
                    {item.cta} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Notes + CTA */}
        <section style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(48px,6vw,80px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '4px' }}>
              Grup Modeli
            </div>
            <p style={{ color: '#9fc0cf', fontSize: '15px', lineHeight: 1.7, maxWidth: '680px', margin: 0 }}>
              {t('price_note')}
            </p>
            <p style={{ color: '#9fc0cf', fontSize: '15px', lineHeight: 1.7, maxWidth: '680px', margin: 0 }}>
              {t('group_note')}
            </p>
            <p style={{ color: '#bcd4de', fontSize: '15px', lineHeight: 1.7, maxWidth: '680px', margin: 0 }}>
              Tüm eğitimlerimiz IKO (International Kiteboarding Organization) müfredatına uygundur. Programı tamamlayan öğrencilere uluslararası geçerlilikte IKO sertifikası verilmektedir.
            </p>
            <Link
              href="/#rezervasyon"
              style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#ff6a3d', color: '#fff', fontWeight: 800, padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontSize: '16px' }}
            >
              {t('cta')}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
