import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

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

// ─── Programlar (fiyatlar yeni sitedeki gibi; içerik Volkan'ın resmi müfredatı) ──
type Lesson = { no: string; baslik: string; sure: string; icerik: string };
type Program = {
  id: string;
  tag: string;
  accent: string; // hex
  title: string;
  dur: string;
  price: string | null;
  priceNote: string;
  image: string;
  desc: string;
  goal?: string;
  lessons: Lesson[];
  cta: string;
};

const PROGRAMS: Program[] = [
  {
    id: 'baslangic',
    tag: 'Başlangıç',
    accent: '#14b8cf',
    title: 'Başlangıç Programı',
    dur: '10 saat · 5 ders',
    price: '700€',
    priceNote: '2 kişilik grup: kişi başı 600€ · ek ders 80€/saat',
    image: '/images/egitim-kurs-1.jpg',
    desc: 'Hiç kitesurf deneyimi olmayanlar için tasarlanan kapsamlı program. 2\'şer saatlik 5 derste teoriden başlayıp güvenli ve bağımsız bir kiteboardcu seviyesine ulaşırsın. Günde 4 saatle çoğu kişi 2-3 günde board üstünde kaymaya başlar. Tüm ekipman, kask ve telsiz dahil.',
    goal: 'Hedef: bağımsız kiteboardcu seviyesi',
    lessons: [
      { no: '1', baslik: 'Teori & Küçük Kite', sure: '50+50 dk', icerik: 'Kite tanımı, emniyet bilgisi, rüzgâr ve rüzgâr penceresi, küçük kite ile karada pratik, dört ipli kite kurulumu.' },
      { no: '2', baslik: 'Kara–Deniz Geçişi', sure: '50+50 dk', icerik: 'Trapezle orta kite kontrolü, kite indirip-kaldırma, suya giriş, kite ile su üstünde kalkış, rüzgârla body drag, board ile ilk tanışma.' },
      { no: '3', baslik: 'Deniz Eğitimine Devam', sure: '50+50 dk', icerik: 'Büyük kite kontrolü, board ile suda tanışma, pozisyon dengeleme, ilk waterstart denemeleri ve kısa sürüşler.' },
      { no: '4', baslik: 'Board Eğitimine Devam', sure: '50+50 dk', icerik: 'Yalnız suya giriş, waterstart kalkışları, sürüşte pozisyon düzeltme, kontrollü sürüş ve duruşlar.' },
      { no: '5', baslik: 'Kontrollü Sürüş', sure: '50+50 dk', icerik: 'İki yöne kontrollü sürüş, kontrollü duruşlar, dönüşler, vücut pozisyonu — bağımsız kiteboardcu seviyesi.' },
    ],
    cta: 'Kayıt Yaptır',
  },
  {
    id: 'kesif',
    tag: 'Keşif & Devam',
    accent: '#ff6a3d',
    title: 'Keşif & Devam Programı',
    dur: '4 saat · 2 ders',
    price: null,
    priceNote: 'Fiyat için bize sorun',
    image: '/images/egitim-kurs-3.jpg',
    desc: 'Rüzgârlı bir günde tamamlanabilen program. Vakti kısıtlı olanlar ya da başka yerde yarım kalan eğitimine kaldığı yerden devam etmek isteyenler için. Mevcut seviyeni değerlendirip en çok gelişim gereken alanlara odaklanıyoruz.',
    lessons: [
      { no: '1', baslik: 'Teori Eğitimi', sure: '50+50 dk', icerik: 'Kite tanımı, emniyet bilgisi, rüzgâr ve rüzgâr penceresi, küçük kite ile karada eğitim, dört ipli büyük kite kurulumu.' },
      { no: '2', baslik: 'Kara–Deniz Eğitimine Geçiş', sure: '50+50 dk', icerik: 'Trapezle kite kontrolü, kite indirip-kaldırma, suya giriş, kite ile su üstünde kalkış, rüzgâr yönleriyle body drag.' },
    ],
    cta: 'Fiyat Al',
  },
  {
    id: 'ileri',
    tag: 'İleri Seviye',
    accent: '#3ee07a',
    title: 'İleri Seviye Programı',
    dur: 'saatlik',
    price: '80€',
    priceNote: 'saat başına · 2 kişilik grupta kişi başı için bize sorun',
    image: '/images/egitim-kurs-5.jpg',
    desc: 'Bağımsız sürüş yapabilen, atlama ve trick öğrenmek isteyen sporcular için. Freeride, oldschool ve newschool freestyle ile gelişimin devam eder. BB Talkin telsizle eğitmenle kesintisiz iletişim. Program kişisel hedeflerine göre özelleştirilir.',
    lessons: [
      { no: '1', baslik: 'Rüzgârüstü Sürüşler', sure: '50+50 dk', icerik: 'Stil geliştirme, doğru pozisyon, yön için kenar (edge) kontrolü, rüzgârüstü tırmanma, suya inmeden dönüşler.' },
      { no: '2', baslik: 'İleri Sürüş', sure: '50 dk', icerik: 'İleri sürüş teknikleri ve ilk atlamalar (jumps).' },
      { no: '3', baslik: 'Seçime Göre Eğitim', sure: '50 dk', icerik: 'Stil hareketleri, oturmadan waterstart, trick yön değiştirmeleri, freestyle hareketleri ve dalga sürüş teknikleri (opsiyonel).' },
    ],
    cta: 'İletişime Geç',
  },
];

const ADVANTAGES = [
  { img: '/images/egitim-kurs-3.jpg', title: 'Tecrübeli Eğitmen Kadrosu', desc: 'TYF (Yelken Federasyonu) en üst seviye KB5/KB4 belgeli, deneyimli eğitmenler.' },
  { img: '/images/egitim-kurs-2.jpg', title: 'Telsiz Kask ile Konfor', desc: 'BB Talkin telsiz kask — sürerken eğitmenle çift yönlü, kesintisiz iletişim.' },
  { img: '/images/spot-plaj.jpg', title: 'İdeal Rüzgâr', desc: 'Onshore (karaya esen) rüzgâr — kite düşse bile açığa sürüklenmezsin, güvendesin.' },
  { img: '/images/spot-egitim-alani.jpg', title: 'Trafikten İzole Alan', desc: '4 km trafiksiz koy, 600 m şamandıralı özel eğitim alanı, sığ ve güvenli su.' },
];

export default async function EgitimlerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'lessons_page' });

  return (
    <>
      <Nav />
      <main style={{ fontFamily: 'Manrope, sans-serif', color: '#07283b' }}>
        {/* Hero */}
        <section style={{ position: 'relative', color: '#fbf6ec', padding: 'clamp(110px,13vw,150px) clamp(20px,5vw,72px) clamp(60px,8vw,110px)', overflow: 'hidden' }}>
          <Image
            src="/images/egitim-hero.jpg"
            alt="Gökçeada Kefaloz kitesurf — Volkite"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center 42%', filter: 'saturate(1.22) contrast(1.1) brightness(1.06)' }}
            priority
            sizes="100vw"
          />
          {/* Sol taraf metin okunurluğu için scrim; sağ/orta fotoğraf canlı kalır */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(6,33,49,.82) 0%,rgba(6,33,49,.45) 42%,rgba(6,33,49,.05) 72%,rgba(6,33,49,0) 100%)' }} />
          {/* Altta ince koyulaşma — üst kısım açık */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(6,33,49,.28) 0%,rgba(6,33,49,0) 30%,rgba(6,33,49,0) 60%,rgba(6,33,49,.55) 100%)' }} />
          <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              {t('kicker')}
            </div>
            <h1 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(42px,7vw,96px)', lineHeight: 0.92, marginBottom: '22px', textShadow: '0 4px 30px rgba(0,0,0,.4)' }}>
              {t('h1')}
            </h1>
            <p style={{ color: '#dceaf0', fontSize: 'clamp(16px,1.9vw,20px)', lineHeight: 1.6, maxWidth: '620px', marginBottom: '30px' }}>
              {t('subtitle')}
            </p>
            {/* Quick price pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {[
                ['Başlangıç 10 saat', '700€'],
                ['2 kişilik grup / kişi', '600€'],
                ['İleri / saat', '80€'],
              ].map(([label, price]) => (
                <div key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', borderRadius: '999px', padding: '8px 16px', backdropFilter: 'blur(6px)' }}>
                  <span style={{ fontSize: '13px', color: '#dceaf0' }}>{label}</span>
                  <span style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '16px', color: '#14b8cf' }}>{price}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Intro */}
        <section style={{ background: '#fbf6ec', padding: 'clamp(56px,7vw,90px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '20px' }}>
              Daha Fazla Ertelemeden
            </div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(28px,4vw,48px)', lineHeight: 1, color: '#07283b', marginBottom: '22px' }}>
              HAYATINA YENİ BİR PENCERE AÇ
            </h2>
            <p style={{ fontSize: '18px', lineHeight: 1.8, color: '#3a5563' }}>
              Volkite olarak kitesurf öğrenmeyi hem güvenli hem de çok eğlenceli hale getirmek için buradayız. Her seviyeye uygun programlarımızla, sıfır deneyimden profesyonel sürüşe uzanan yolculuğun her adımında yanındayız. Küçük gruplar, birebir dikkat ve gerçek bir sporcu deneyimi — bunlar Volkite farkı.
            </p>
          </div>
        </section>

        {/* Advantages — icon cards */}
        <section style={{ background: '#062131', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px', textAlign: 'center' }}>
              Eğitim Avantajları
            </div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(26px,3.5vw,46px)', lineHeight: 1, marginBottom: '48px', textAlign: 'center' }}>
              NEDEN VOLKITE?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: '20px' }}>
              {ADVANTAGES.map((adv) => (
                <div
                  key={adv.title}
                  style={{ background: '#0c3346', border: '1px solid rgba(255,255,255,.08)', borderRadius: '18px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ position: 'relative', aspectRatio: '4/3' }}>
                    <Image src={adv.img} alt={adv.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 50vw, 300px" />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(12,51,70,0) 55%,rgba(12,51,70,.55) 100%)' }} />
                  </div>
                  <div style={{ padding: '22px 24px 26px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '10px', color: '#fbf6ec' }}>{adv.title}</h3>
                    <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#9fc0cf', margin: 0 }}>{adv.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Programs — visual cards with stepper */}
        <section style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px', textAlign: 'center' }}>
              Programlar
            </div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(30px,4vw,54px)', lineHeight: 0.98, marginBottom: '56px', textAlign: 'center' }}>
              SANA UYGUN PROGRAMI SEÇ
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {PROGRAMS.map((p) => (
                <div
                  key={p.id}
                  id={p.id}
                  style={{ background: '#0c3346', border: '1px solid rgba(255,255,255,.08)', borderRadius: '22px', overflow: 'hidden', scrollMarginTop: '80px' }}
                >
                  {/* Image banner */}
                  <div style={{ position: 'relative', height: 'clamp(160px,22vw,240px)' }}>
                    <Image src={p.image} alt={p.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:1100px) 100vw, 1050px" />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(12,51,70,.25) 0%,rgba(12,51,70,.92) 100%)' }} />
                    <div style={{ position: 'absolute', left: 'clamp(24px,4vw,44px)', bottom: '22px', right: 'clamp(24px,4vw,44px)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#062131', background: p.accent, padding: '5px 14px', borderRadius: '999px', display: 'inline-block', marginBottom: '12px' }}>
                          {p.tag}
                        </span>
                        <h3 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(26px,3.6vw,44px)', margin: 0, lineHeight: 1, textShadow: '0 2px 16px rgba(0,0,0,.5)' }}>
                          {p.title}
                        </h3>
                        <div style={{ fontSize: '13px', color: '#dceaf0', marginTop: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>{p.dur}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {p.price ? (
                          <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(30px,4vw,44px)', color: '#fff', lineHeight: 1 }}>{p.price}</div>
                        ) : (
                          <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '20px', color: '#fff', lineHeight: 1.1 }}>Fiyat için<br />sorun</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: 'clamp(26px,4vw,44px)' }}>
                    <p style={{ color: '#bcd4de', fontSize: '16px', lineHeight: 1.75, marginBottom: '10px', maxWidth: '760px' }}>{p.desc}</p>
                    <p style={{ color: '#9fc0cf', fontSize: '13px', marginBottom: '32px' }}>{p.priceNote}</p>

                    {/* Lesson stepper */}
                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {p.lessons.map((ders, i) => (
                        <div key={ders.no} style={{ display: 'flex', gap: '18px', paddingBottom: i < p.lessons.length - 1 ? '24px' : 0, position: 'relative' }}>
                          {/* connector line */}
                          {i < p.lessons.length - 1 && (
                            <span style={{ position: 'absolute', left: '19px', top: '40px', bottom: 0, width: '2px', background: 'rgba(255,255,255,.1)' }} />
                          )}
                          {/* number */}
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(20,184,207,.14)', border: `2px solid ${p.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Anton, Impact, sans-serif', fontSize: '18px', color: p.accent, zIndex: 1 }}>
                            {ders.no}
                          </div>
                          <div style={{ flex: 1, paddingTop: '2px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                              <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#fbf6ec', margin: 0 }}>{ders.baslik}</h4>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#9fc0cf', background: 'rgba(255,255,255,.06)', padding: '3px 9px', borderRadius: '999px', letterSpacing: '.04em' }}>{ders.sure}</span>
                            </div>
                            <p style={{ fontSize: '14.5px', lineHeight: 1.65, color: '#bcd4de', margin: 0 }}>{ders.icerik}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {p.goal && (
                      <div style={{ marginTop: '28px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(20,184,207,.1)', border: '1px solid rgba(20,184,207,.3)', borderRadius: '10px', padding: '10px 16px', fontSize: '14px', fontWeight: 700, color: '#14b8cf' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        {p.goal}
                      </div>
                    )}

                    <div style={{ marginTop: '28px' }}>
                      <Link
                        href="/#iletisim"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: p.id === 'baslangic' ? '#ff6a3d' : 'rgba(255,255,255,.07)', border: p.id === 'baslangic' ? 'none' : '1px solid rgba(255,255,255,.18)', color: '#fff', fontWeight: 800, padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontSize: '15px' }}
                      >
                        {p.cta} →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Included / notes strip */}
        <section style={{ background: '#fbf6ec', padding: 'clamp(48px,6vw,80px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px' }}>
              {[
                { img: '/images/hizmet-slingshot2.jpg', title: 'Ekipman Dahil', desc: 'Tüm eğitimlerde Slingshot kite, board, trapez, kask ve telsiz dahil. Sadece kişisel eşya + güneş gözlüğü getir.' },
                { img: '/images/egitim-kurs-1.jpg', title: 'Grup Modeli', desc: 'Arkadaşınla birlikte başlayabilirsin; seviyen açıldıkça ayrı ders almanı öneririz — herkesin gelişimi için en verimlisi.' },
                { img: '/images/hizmet-tyf.jpg', title: 'TYF Standardı', desc: 'Eğitimlerimiz TYF (Türkiye Yelken Federasyonu) Usta Öğretici belgeli eğitmenlerle, federasyon standartlarında verilir.' },
              ].map((n) => (
                <div key={n.title} style={{ background: '#fff', border: '1px solid #ece1cc', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', aspectRatio: '16/10' }}>
                    <Image src={n.img} alt={n.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 320px" />
                  </div>
                  <div style={{ padding: '22px 24px 26px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#07283b', marginBottom: '8px' }}>{n.title}</h3>
                    <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#3a5563', margin: 0 }}>{n.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ background: '#062131', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)', textAlign: 'center' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(30px,4vw,54px)', lineHeight: 1, marginBottom: '18px' }}>
              RÜZGÂR SENİ BEKLİYOR
            </h2>
            <p style={{ color: '#9fc0cf', fontSize: '17px', lineHeight: 1.6, marginBottom: '32px' }}>
              Hangi programın sana uygun olduğundan emin değil misin? Asistanımıza yaz ya da bizi ara — rüzgâra göre en iyi tarihleri birlikte belirleyelim.
            </p>
            <Link
              href="/#iletisim"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#ff6a3d', color: '#fff', fontWeight: 800, padding: '16px 34px', borderRadius: '12px', textDecoration: 'none', fontSize: '17px', boxShadow: '0 14px 34px -10px rgba(255,106,61,.7)' }}
            >
              {t('cta')} →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
