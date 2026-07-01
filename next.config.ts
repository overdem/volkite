import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Home
      { source: '/anasayfa', destination: '/', permanent: true },
      { source: '/tr', destination: '/', permanent: true },
      // Lessons — old WP slugs
      { source: '/kitesurf-dersleri', destination: '/egitimler', permanent: true },
      { source: '/kurslari', destination: '/egitimler', permanent: true },
      { source: '/kitesurf-egitimi', destination: '/egitimler', permanent: true },
      { source: '/kiteboard-dersleri', destination: '/egitimler', permanent: true },
      { source: '/kitesurf-courses', destination: '/en/egitimler', permanent: true },
      { source: '/kite-lessons', destination: '/en/egitimler', permanent: true },
      { source: '/learn-kiteboarding', destination: '/en/egitimler', permanent: true },
      // Services — old WP slugs
      { source: '/hizmetlerimiz', destination: '/hizmetler', permanent: true },
      { source: '/services', destination: '/en/hizmetler', permanent: true },
      { source: '/kite-rental', destination: '/en/hizmetler', permanent: true },
      { source: '/kiralama', destination: '/hizmetler', permanent: true },
      // Spot — old WP slugs
      { source: '/spot', destination: '/spot-ruzgar', permanent: true },
      { source: '/ruzgar', destination: '/spot-ruzgar', permanent: true },
      { source: '/gokceada-spot', destination: '/spot-ruzgar', permanent: true },
      { source: '/wind', destination: '/en/spot-ruzgar', permanent: true },
      { source: '/kitesurf-spot', destination: '/en/spot-ruzgar', permanent: true },
      // About — old WP slugs
      { source: '/about', destination: '/en/hakkimizda', permanent: true },
      { source: '/about-us', destination: '/en/hakkimizda', permanent: true },
      { source: '/biz-kimiz', destination: '/hakkimizda', permanent: true },
      { source: '/volkite-hakkinda', destination: '/hakkimizda', permanent: true },
      // Kitchen
      { source: '/cafe', destination: '/mutfak', permanent: true },
      { source: '/restoran', destination: '/mutfak', permanent: true },
      { source: '/yemek', destination: '/mutfak', permanent: true },
      { source: '/kitchen', destination: '/en/mutfak', permanent: true },
      { source: '/cafe-on-shore', destination: '/en/mutfak', permanent: true },
      // Contact / booking
      { source: '/iletisim', destination: '/#iletisim', permanent: true },
      { source: '/contact', destination: '/en#iletisim', permanent: true },
      { source: '/rezervasyon', destination: '/#iletisim', permanent: true },
      { source: '/booking', destination: '/en#iletisim', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
