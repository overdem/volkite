-- Volkite · Seed verisi
-- Migration'dan sonra çalıştır

-- ─── packages ─────────────────────────────────────────────────────────────────
insert into packages (slug, sort, tag_tr, tag_en, tag_bg, tag_ro, dur_tr, dur_en, dur_bg, dur_ro, name_tr, name_en, name_bg, name_ro, desc_tr, desc_en, desc_bg, desc_ro, rows_tr, rows_en, rows_bg, rows_ro, cta_tr, cta_en, cta_bg, cta_ro) values

('beginner', 1,
  'Başlangıç', 'Beginner', 'Начинаещи', 'Începători',
  '10 saat', '10 hours', '10 часа', '10 ore',
  'BAŞLANGIÇ PROGRAMI', 'BEGINNER PROGRAM', 'ПРОГРАМА ЗА НАЧИНАЕЩИ', 'PROGRAM ÎNCEPĂTORI',
  'Teori, güvenlik ve 5 modülle sıfırdan bağımsız kiteboardcu seviyesine. Tüm ekipman dahil.',
  'From zero to independent kiteboarder with theory, safety and 5 modules. All equipment included.',
  'От нулата до независим кайтбордист с теория, безопасност и 5 модула. Цялото оборудване е включено.',
  'De la zero la kiteboarder independent cu teorie, siguranță și 5 module. Tot echipamentul inclus.',
  '[{"label":"Özel ders","price":"700€"},{"label":"2 kişilik grup / kişi","price":"600€"},{"label":"Ek ders (1 saat)","price":"70€"}]',
  '[{"label":"Private","price":"€700"},{"label":"Group of 2 / person","price":"€600"},{"label":"Extra hour","price":"€70"}]',
  '[{"label":"Частен","price":"700€"},{"label":"Група от 2 / човек","price":"600€"},{"label":"Доп. час","price":"70€"}]',
  '[{"label":"Privat","price":"700€"},{"label":"Grup de 2 / pers.","price":"600€"},{"label":"Oră extra","price":"70€"}]',
  'Rezervasyon', 'Book', 'Резервация', 'Rezervare'),

('discovery', 2,
  'Keşif & Devam', 'Discovery', 'Откриване', 'Descoperire',
  '4 saat', '4 hours', '4 часа', '4 ore',
  'KEŞİF & DEVAM', 'DISCOVERY & CONTINUE', 'ОТКРИВАНЕ & ПРОДЪЛЖЕНИЕ', 'DESCOPERIRE & CONTINUARE',
  'Rüzgarlı bir günde tamamlanır. Yeni başla ya da yarım kalan eğitimine kaldığın yerden devam et.',
  'Finish in one windy day. Start fresh or continue your unfinished training from where you left off.',
  'Завършва се за един ветровит ден. Започни наново или продължи незавършеното си обучение.',
  'Se termină într-o zi cu vânt. Începe de la zero sau continuă antrenamentul neterminat.',
  '[{"label":"Özel ders","price":"280€"},{"label":"2''li grup / kişi","price":"240€"},{"label":"Ek ders (1 saat)","price":"70€"}]',
  '[{"label":"Private","price":"€280"},{"label":"Group of 2 / person","price":"€240"},{"label":"Extra hour","price":"€70"}]',
  '[{"label":"Частен","price":"280€"},{"label":"Група от 2 / човек","price":"240€"},{"label":"Доп. час","price":"70€"}]',
  '[{"label":"Privat","price":"280€"},{"label":"Grup de 2 / pers.","price":"240€"},{"label":"Oră extra","price":"70€"}]',
  'Rezervasyon', 'Book', 'Резервация', 'Rezervare'),

('advanced', 3,
  'İleri Seviye', 'Advanced', 'Напреднали', 'Avansați',
  'saatlik', 'hourly', 'на час', 'pe oră',
  'İLERİ SEVİYE', 'ADVANCED LEVEL', 'НАПРЕДНАЛО НИВО', 'NIVEL AVANSAT',
  'Freeride, freestyle ve dalga sürüş. Seviyene özel yol haritası, BB Talkin telsizle birebir.',
  'Freeride, freestyle and wave riding. A roadmap for your level, one-to-one over BB Talkin radio.',
  'Фрийрайд, фрийстайл и каране по вълни. Пътна карта за твоето ниво, едно към едно по радио BB Talkin.',
  'Freeride, freestyle și ride pe valuri. O foaie de parcurs pentru nivelul tău, unu-la-unu prin radio BB Talkin.',
  '[{"label":"Özel ders / saat","price":"80€"},{"label":"2''li grup / kişi · saat","price":"70€"},{"label":"Coaching","price":"Bize sorun"}]',
  '[{"label":"Private / hour","price":"€80"},{"label":"Group of 2 / person · hr","price":"€70"},{"label":"Coaching","price":"Ask us"}]',
  '[{"label":"Частен / час","price":"80€"},{"label":"Група от 2 / човек · час","price":"70€"},{"label":"Коучинг","price":"Попитай ни"}]',
  '[{"label":"Privat / oră","price":"80€"},{"label":"Grup de 2 / pers. · oră","price":"70€"},{"label":"Coaching","price":"Întreabă-ne"}]',
  'Rezervasyon', 'Book', 'Резервация', 'Rezervare')

on conflict (slug) do nothing;

-- ─── services ─────────────────────────────────────────────────────────────────
insert into services (slug, sort, no, name_tr, name_en, name_bg, name_ro, desc_tr, desc_en, desc_bg, desc_ro) values
('equipment-sales',   1, '01', 'Ekipman Satış',     'Equipment Sales',     'Продажба на оборудване', 'Vânzare echipament',    'Slingshot ve seçili markalarda yeni & ikinci el ekipman.',                      'New & second-hand gear from Slingshot and select brands.',                   'Ново и втора употреба от Slingshot и избрани марки.',                      'Echipament nou și second-hand de la Slingshot și branduri selectate.'),
('equipment-rental',  2, '02', 'Ekipman Kiralama',  'Equipment Rental',    'Наем на оборудване',     'Închiriere echipament', 'Güncel kite, board ve trapez kiralama seçenekleri.',                           'Up-to-date kite, board and harness rental options.',                         'Актуални опции за наем на кайт, борд и трапец.',                           'Opțiuni actuale de închiriere kite, placă și ham.'),
('gear-storage',      3, '03', 'Malzeme Depolama',  'Gear Storage',        'Съхранение',             'Depozitare',            'Ekipmanını güvenle bırak, her geldiğinde hazır bul.',                          'Leave your gear safely and find it ready every visit.',                      'Остави оборудването си на сигурно и го намери готово всеки път.',           'Lasă-ți echipamentul în siguranță și găsește-l gata de fiecare dată.'),
('kite-repair',       4, '04', 'Kite Tamiri',        'Kite Repair',         'Ремонт на кайт',         'Reparații kite',        'Kite ve ekipmanların için profesyonel tamir servisi.',                         'Professional repair service for your kite and gear.',                        'Професионален ремонт за твоя кайт и оборудване.',                          'Service profesional pentru kite-ul și echipamentul tău.'),
('kitesurf-safari',   5, '05', 'Kitesurf Safari',   'Kitesurf Safari',     'Кайт сафари',            'Safari kitesurf',       'Uzun sürüş rotalarında rehberli kite safari deneyimi.',                        'Guided long-distance kite safari along the best routes.',                    'Водено сафари на дълги разстояния по най-добрите маршрути.',                'Safari ghidat pe distanțe lungi pe cele mai bune trasee.'),
('wakeboard',         6, '06', 'Wakeboard',         'Wakeboard',           'Уейкборд',               'Wakeboard',             'Rüzgar olmadığında da suda kalmanın keyifli yolu.',                            'A fun way to stay on the water even when there is no wind.',                 'Забавен начин да си във водата дори когато няма вятър.',                    'Un mod distractiv de a fi în apă chiar și când nu e vânt.'),
('massage',           7, '07', 'Masaj Terapi',       'Massage Therapy',     'Масажна терапия',        'Terapie prin masaj',    'Klasik, spor ve thai masaj ile sudan sonra yenilen.',                          'Classic, sport and thai massage to recover after the water.',                'Класически, спортен и тай масаж за възстановяване след водата.',            'Masaj clasic, sportiv și thailandez pentru recuperare după apă.')
on conflict (slug) do nothing;

-- ─── faq ──────────────────────────────────────────────────────────────────────
insert into faq (sort, q_tr, q_en, q_bg, q_ro, a_tr, a_en, a_bg, a_ro) values
(1,
  'Hiç tecrübem yok, öğrenebilir miyim?',
  'I have no experience, can I learn?',
  'Нямам опит, мога ли да се науча?',
  'Nu am experiență, pot învăța?',
  'Evet! Başlangıç programı tam da sıfırdan başlayanlar için. Güvenlik ve uçurtma kontrolüyle adım adım ilerliyoruz, tüm ekipman dahil.',
  'Yes! The beginner program is made for absolute beginners. We progress step by step with safety and kite control, all equipment included.',
  'Да! Програмата за начинаещи е точно за абсолютни начинаещи. Напредваме стъпка по стъпка с безопасност и контрол на кайта, цялото оборудване е включено.',
  'Da! Programul pentru începători e făcut exact pentru începători absoluți. Avansăm pas cu pas cu siguranță și control al kite-ului, tot echipamentul inclus.'),

(2,
  'Sezon ne zaman açık?',
  'When is the season open?',
  'Кога е отворен сезонът?',
  'Când e deschis sezonul?',
  'Nisan–Kasım arası okul açık ve senenin yaklaşık 300 günü rüzgar var.',
  'The school is open April–November, with around 300 windy days a year.',
  'Училището е отворено април–ноември, с около 300 ветровити дни в годината.',
  'Școala e deschisă aprilie–noiembrie, cu aproximativ 300 de zile cu vânt pe an.'),

(3,
  'Ekipman getirmem gerekiyor mu?',
  'Do I need to bring equipment?',
  'Трябва ли да нося оборудване?',
  'Trebuie să aduc echipament?',
  'Hayır. Eğitimlerde Slingshot ekipmanı, trapez ve kask-telsiz dahil. Kendi ekipmanını da kullanabilirsin.',
  'No. Slingshot gear, harness and helmet-radio are included. You can also use your own equipment.',
  'Не. Оборудване Slingshot, трапец и радио-каска са включени. Можеш да ползваш и собствено оборудване.',
  'Nu. Echipamentul Slingshot, hamul și radio-casca sunt incluse. Poți folosi și echipamentul propriu.'),

(4,
  'Rüzgar olmazsa ne oluyor?',
  'What if there is no wind?',
  'Какво става ако няма вятър?',
  'Ce se întâmplă dacă nu e vânt?',
  'Rüzgarsız günlerde ders ileri bir tarihe ertelenir; planını esnek tutuyoruz. Rüzgar yoksa wakeboard alternatifimiz var.',
  'On windless days the lesson is postponed to a later date; we keep your plan flexible. We also offer wakeboard as an alternative.',
  'В безветрени дни урокът се отлага за по-късна дата; пазим плана гъвкав. Предлагаме и уейкборд като алтернатива.',
  'În zilele fără vânt lecția se reprogramează; păstrăm planul flexibil. Oferim și wakeboard ca alternativă.'),

(5,
  'Hangi dillerde eğitim var?',
  'Which languages do you teach in?',
  'На какви езици преподавате?',
  'În ce limbi predați?',
  'Türkçe, İngilizce, İspanyolca, Arapça, Fransızca ve İtalyanca eğitim verebiliyoruz.',
  'We teach in Turkish, English, Spanish, Arabic, French and Italian.',
  'Преподаваме на турски, английски, испански, арабски, френски и италиански.',
  'Predăm în turcă, engleză, spaniolă, arabă, franceză și italiană.'),

(6,
  'Konaklama sağlıyor musunuz?',
  'Do you provide accommodation?',
  'Осигурявате ли настаняване?',
  'Oferiți cazare?',
  'Anlaşmalı pansiyon, otel ve kamp seçeneklerinde yönlendirme yapıyoruz. İletişime geç, en uygununu önerelim.',
  'We guide you to partner guesthouses, hotels and camping options. Get in touch and we''ll suggest the best fit.',
  'Насочваме те към партньорски къщи за гости, хотели и къмпинг. Свържи се с нас и ще предложим най-доброто.',
  'Te îndrumăm către pensiuni, hoteluri și camping partenere. Contactează-ne și îți sugerăm cea mai bună variantă.');

-- ─── site_settings ────────────────────────────────────────────────────────────
insert into site_settings (id, phone, email, address_tr, address_en, instagram_url, facebook_url, whatsapp_url, wind_url, season_tr, season_en, windy_days, spot_coords)
values (1,
  '+90 532 610 10 11',
  'info@volkite.com',
  'Kefaloz Koyu, Gökçeada, Çanakkale',
  'Kefalos Bay, Gokceada, Canakkale, Turkey',
  'https://www.instagram.com/volkite/',
  'https://www.facebook.com/volkite',
  'https://wa.me/905326101011',
  'https://kiting.live',
  'Nisan–Kasım',
  'April–November',
  300,
  '40°11′N 25°54′E'
)
on conflict (id) do update set
  phone         = excluded.phone,
  email         = excluded.email,
  address_tr    = excluded.address_tr,
  address_en    = excluded.address_en,
  instagram_url = excluded.instagram_url,
  facebook_url  = excluded.facebook_url,
  whatsapp_url  = excluded.whatsapp_url,
  wind_url      = excluded.wind_url,
  season_tr     = excluded.season_tr,
  season_en     = excluded.season_en,
  windy_days    = excluded.windy_days,
  spot_coords   = excluded.spot_coords;
