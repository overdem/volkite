import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Nav from '@/components/Nav';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about_page' });
  return {
    title: t('h1'),
    description: t('slogan'),
  };
}

const historyItems = [
  { year: '2000', text: 'Volkite Kiteboard Okulu\'nun temelleri Gökçeada\'da atıldı. İlk uçurtmalar gökyüzüne bırakıldı.' },
  { year: '2005', text: 'Okul, profesyonel eğitim altyapısını güçlendirdi; TYF (Yelken Federasyonu) Usta Öğretici belgeli eğitmen kadrosu oluşturuldu.' },
  { year: '2007–2010', text: 'Uluslararası yarışmalara katılım başladı. Türkiye\'den ilk uluslararası kitesurf milli takım üyeleri yetiştirildi.' },
  { year: '2008', text: 'Kefaloz Koyu\'nda sabit okul alanı kuruldu; kamp ve konaklama hizmetleri başlatıldı.' },
  { year: '2010', text: 'Cafe On Shore açıldı. Sporcular için özel beslenme menüsü hazırlandı.' },
  { year: '2013–2014', text: 'Öğrenci sayısı yılda 200\'ü aştı. Türkiye, Bulgaristan ve Romanya\'dan düzenli gruplar gelmeye başladı.' },
  { year: '2014–2016', text: 'Masaj & wellness hizmetleri eklendi. Spor masajı ve yoğun antrenman sonrası toparlanma programları geliştirildi.' },
  { year: '2013–2015', text: 'Çocuk ve gençlik kitesurf kampları düzenlenmeye başlandı. En genç mezun 9 yaşında.' },
  { year: '2000–2021', text: '21 yılda 2 000\'den fazla öğrenci yetiştirdik. Farklı milliyetlerden, farklı yaşlardan, aynı heyecanla.' },
];

const kiteTeam = [
  { name: 'Volkan Günel', role: 'Kurucu & Baş Eğitmen', cert: 'KB5', langs: 'TR / EN', photo: null },
  { name: 'Burçak Doğan', role: 'Kıdemli Eğitmen', cert: 'KB4', langs: 'TR / FR / EN', photo: '/images/ekip-burcak.jpg' },
  { name: 'Emin Ufuk', role: 'Eğitmen', cert: 'KB4', langs: 'TR / EN', photo: null },
  { name: 'Soydan Cıgsar', role: 'Eğitmen', cert: 'KB4', langs: 'TR / EN', photo: '/images/ekip-soydan.jpg' },
  { name: 'Karapati', role: 'Okul Kedisi', cert: '', langs: 'Kedice', photo: '/images/ekip-karapati.jpg' },
  { name: 'Enes Günel', role: 'Okul Müdürü', cert: '', langs: 'TR / EN', photo: null },
];

const cafeTeam = [
  { name: 'Deniz Gönül', role: 'Big Mama — Cafe Yöneticisi', cert: '', langs: '' },
  { name: 'Sezen Pak', role: 'Şef', cert: '', langs: '' },
  { name: 'Zeynep Halisçelik', role: 'Şef', cert: '', langs: '' },
];

export default async function HakkimizdaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about_page' });

  return (
    <>
      <Nav />
      <main style={{ fontFamily: 'Manrope, sans-serif', color: '#07283b' }}>
        {/* Hero */}
        <section style={{ position: 'relative', color: '#fbf6ec', padding: 'clamp(100px,12vw,140px) clamp(20px,5vw,72px) clamp(56px,8vw,112px)', overflow: 'hidden' }}>
          <Image src="/images/egitim-kurs-6.jpg" alt="Volkite Kiteboard Okulu" fill style={{ objectFit: 'cover', objectPosition: 'center 40%' }} priority sizes="100vw" />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(6,33,49,.72) 0%,rgba(6,33,49,.88) 100%)' }} />
          <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              {t('kicker')}
            </div>
            <h1 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(40px,6vw,84px)', lineHeight: 0.95, marginBottom: '22px' }}>
              {t('h1')}
            </h1>
            <p style={{ color: '#9fc0cf', fontSize: 'clamp(16px,2vw,22px)', lineHeight: 1.5, fontStyle: 'italic' }}>
              {t('slogan')}
            </p>
          </div>
        </section>

        {/* Opening paragraph */}
        <section style={{ background: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '24px' }}>
              21 Yılın Hikayesi
            </div>
            <p style={{ fontSize: '18px', lineHeight: 1.8, color: '#3a5563', marginBottom: '20px' }}>
              Volkite Kiteboard Okulu olarak 21. yılımızı kutluyoruz! Biz eksilmeyen sporcu ruhumuz ve 21 senelik eğitmenlik deneyimimizle her geçen yıl kendimizi daha da geliştirerek, öğrencilerimize en iyi kitesurf deneyimini sunmayı hedefliyoruz.
            </p>
            <p style={{ fontSize: '17px', lineHeight: 1.75, color: '#3a5563', marginBottom: '20px' }}>
              Gökçeada’nın eşsiz rüzgarları ve turkuaz sularında, deneyimli eğitmen kadromuzla binlerce öğrenciye kitesurf sevgisini aşıladık. TYF (Türkiye Yelken Federasyonu) Usta Öğretici belgeli eğitmenlerimizle, güvenli ve eğlenceli bir öğrenme ortamı sunuyoruz.
            </p>
            <p style={{ fontSize: '17px', lineHeight: 1.75, color: '#3a5563' }}>
              Türkiye’nin kitesurf başkenti Gökçeada’da, Kefaloz Koyu’nun sakin sularında 2000 yılından bu yana faaliyet gösteriyoruz. Hem yeni başlayanlar hem de deneyimli sporcular için kapsamlı programlarımız ile rüzgarın ve özgürlüğün tadını çıkarmanızı sağlıyoruz.
            </p>
          </div>
        </section>

        {/* History timeline */}
        <section style={{ background: '#062131', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Tarihçe
            </div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(30px,4vw,52px)', lineHeight: 0.98, marginBottom: '48px' }}>
              21 Yılda Önemli Dönüm Noktaları
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {historyItems.map((item, i) => (
                <div
                  key={item.year}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr',
                    gap: '32px',
                    padding: '24px 0',
                    borderBottom: i < historyItems.length - 1 ? '1px solid rgba(255,255,255,.07)' : 'none',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '24px', color: '#14b8cf', lineHeight: 1, paddingTop: '2px' }}>
                    {item.year}
                  </div>
                  <div style={{ fontSize: '16px', color: '#bcd4de', lineHeight: 1.7 }}>{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Founder bio */}
        <section style={{ background: '#07283b', color: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Kurucumuz
            </div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(30px,4vw,52px)', lineHeight: 0.98, marginBottom: '48px' }}>
              Volkan Günel
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(36px,5vw,64px)', alignItems: 'start' }}>
              <div>
                <div style={{ background: '#0c3346', border: '1px solid rgba(255,255,255,.08)', borderRadius: '18px', padding: '36px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '28px', left: '28px', fontSize: '64px', lineHeight: 1, color: '#14b8cf', opacity: 0.3, fontFamily: 'Anton, Impact, sans-serif' }}>“</div>
                  <p style={{ color: '#bcd4de', fontSize: '16px', lineHeight: 1.8, marginBottom: '20px', paddingTop: '24px' }}>
                    1977 yılında İstanbul’da doğdum. Gençliğimden beri deniz ve rüzgar benim için sadece doğa unsurları değil, yaşam biçiminin parçasıydı. Windsürf ile başlayan su sporları serüvenim, kitesurf ile bambaşka bir boyut kazandı.
                  </p>
                  <p style={{ color: '#bcd4de', fontSize: '16px', lineHeight: 1.8, marginBottom: '20px' }}>
                    2000 yılında Gökçeada’ya ilk geldiğimde, adanın kitesurf için sahip olduğu potansiyeli hemen fark ettim. Poyraz rüzgarı, sığ ve güvenli koy, el değmemiş doğa... Bunun bir okul için mükemmel zemin olduğunu anlamak çok sürmedi.
                  </p>
                  <p style={{ color: '#bcd4de', fontSize: '16px', lineHeight: 1.8, marginBottom: '20px' }}>
                    TYF (Yelken Federasyonu) eğitmenlik belgemi aldıktan sonra Volkite’i kurdum. İlk yıllarda küçük gruplarla başladık. Zamanla büyüdük, ekibimizi geliştirdik. Ama hiçbir zaman değişmeyen bir şey var: her öğrenciye verdiğimiz özel ilgi ve güvenliği ön planda tutma anlayışımız.
                  </p>
                  <p style={{ color: '#bcd4de', fontSize: '16px', lineHeight: 1.8 }}>
                    21 yılda 2 000’den fazla öğrenci yetiştirdik. Bazıları bugün milli takımda yarışıyor, bazıları dünya turuna çıkmış kiter’lar oldu. Hepsinin yolculuğuna ortak olmuş olmak, bu işi yapmaya devam etmemin en büyük sebebi.
                  </p>
                  <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,.1)' }}>
                    <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '22px', color: '#fbf6ec' }}>Volkan Günel</div>
                    <div style={{ color: '#14b8cf', fontWeight: 700, fontSize: '14px', marginTop: '4px' }}>Kurucu & Baş Eğitmen · TYF KB5 · TR / EN</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'rgba(12,51,70,.5)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Sertifikalar</div>
                  <p style={{ color: '#9fc0cf', fontSize: '15px', lineHeight: 1.65 }}>TYF (Türkiye Yelken Federasyonu) Usta Öğretici belgeli; KB5 — en yüksek eğitmen seviyesi. Tüm Volkite eğitmenleri TYF belgeli.</p>
                </div>
                <div style={{ background: 'rgba(12,51,70,.5)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Diller</div>
                  <p style={{ color: '#9fc0cf', fontSize: '15px', lineHeight: 1.65 }}>Türkçe ve İngilizce olarak eğitim veriyorum. Ekibimiz Türkçe, İngilizce ve Fransızca dersler sunmaktadır.</p>
                </div>
                <div style={{ background: 'rgba(12,51,70,.5)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Felsefe</div>
                  <p style={{ color: '#9fc0cf', fontSize: '15px', lineHeight: 1.65 }}>Güvenlik birinci, eğlence ikinci, teknik üçüncü. Bu sıralamanın tersine gitmeden hiçbir ders yapmadım.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Kite Team */}
        <section style={{ background: '#fbf6ec', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Kite Ekibi
            </div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(28px,3.5vw,48px)', lineHeight: 0.98, color: '#07283b', marginBottom: '40px' }}>
              Eğitmen Kadromuz
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '18px', marginBottom: '64px' }}>
              {kiteTeam.map((member) => (
                <div
                  key={member.name}
                  style={{ background: '#fff', border: '1px solid #ece1cc', borderRadius: '16px', padding: '26px 22px', display: 'flex', flexDirection: 'column', gap: '6px' }}
                >
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#cfdde2,#9fc0cf)', marginBottom: '8px', position: 'relative', flexShrink: 0 }}>
                    {member.photo && (
                      <Image src={member.photo} alt={member.name} fill style={{ objectFit: 'cover' }} sizes="56px" />
                    )}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '16px', color: '#07283b' }}>{member.name}</div>
                  <div style={{ color: '#14b8cf', fontWeight: 700, fontSize: '13px' }}>{member.role}</div>
                  {member.cert ? (
                    <div style={{ color: '#3a5563', fontSize: '12px', marginTop: '2px', fontWeight: 600 }}>TYF {member.cert}</div>
                  ) : null}
                  {member.langs ? (
                    <div style={{ color: '#3a5563', fontSize: '12px' }}>{member.langs}</div>
                  ) : null}
                </div>
              ))}
            </div>

            <div style={{ color: '#ff6a3d', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Cafe On Shore Ekibi
            </div>
            <h3 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(24px,3vw,40px)', lineHeight: 0.98, color: '#07283b', marginBottom: '32px' }}>
              Mutfak Takımı
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '18px' }}>
              {cafeTeam.map((member) => (
                <div
                  key={member.name}
                  style={{ background: '#fff', border: '1px solid #ece1cc', borderRadius: '16px', padding: '26px 22px', display: 'flex', flexDirection: 'column', gap: '6px' }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#ffe0d4,#ffb89a)', marginBottom: '6px' }} />
                  <div style={{ fontWeight: 800, fontSize: '16px', color: '#07283b' }}>{member.name}</div>
                  <div style={{ color: '#ff6a3d', fontWeight: 700, fontSize: '13px' }}>{member.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA strip */}
        <section style={{ background: '#062131', color: '#fbf6ec', padding: 'clamp(40px,5vw,72px) clamp(20px,5vw,72px)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <p style={{ color: '#bcd4de', fontSize: '16px', lineHeight: 1.65, maxWidth: '600px', margin: 0 }}>
              {t('certifications')}
            </p>
            <Link
              href="/#iletisim"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#ff6a3d', color: '#fff', fontWeight: 800, padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontSize: '16px', whiteSpace: 'nowrap' }}
            >
              {t('read_more')}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
