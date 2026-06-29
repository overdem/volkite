-- Fix phone number, address and package pricing to match volkite-icerik.md

update site_settings set
  phone        = '+90 533 241 10 15',
  whatsapp_url = 'https://wa.me/905332411015',
  address_tr   = 'Eşelek Köyü, Köy Sokağı 104/1, Gökçeada-Çanakkale',
  address_en   = 'Eşelek Village, Köy Sokağı 104/1, Gökçeada, Çanakkale, Turkey'
where id = 1;

-- Beginner extra-hour price 70€ → 80€
update packages set
  rows_tr = '[{"label":"Özel ders","price":"700€"},{"label":"2 kişilik grup / kişi","price":"600€"},{"label":"Ek ders (1 saat)","price":"80€"}]',
  rows_en = '[{"label":"Private","price":"€700"},{"label":"Group of 2 / person","price":"€600"},{"label":"Extra hour","price":"€80"}]',
  rows_bg = '[{"label":"Частен","price":"700€"},{"label":"Група от 2 / човек","price":"600€"},{"label":"Доп. час","price":"80€"}]',
  rows_ro = '[{"label":"Privat","price":"700€"},{"label":"Grup de 2 / pers.","price":"600€"},{"label":"Oră extra","price":"80€"}]'
where slug = 'beginner';

-- Discovery: remove 280€/240€ prices, show contact-for-pricing note
update packages set
  rows_tr = '[{"label":"Fiyat için bize sorun","price":""}]',
  rows_en = '[{"label":"Contact us for pricing","price":""}]',
  rows_bg = '[{"label":"Свържете се за цена","price":""}]',
  rows_ro = '[{"label":"Contactați-ne pentru preț","price":""}]'
where slug = 'discovery';
