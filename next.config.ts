import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/anasayfa', destination: '/', permanent: true },
      { source: '/tr', destination: '/', permanent: true },
      { source: '/kitesurf-dersleri', destination: '/#egitimler', permanent: true },
      { source: '/kurslari', destination: '/#egitimler', permanent: true },
      { source: '/kitesurf-courses', destination: '/en#lessons', permanent: true },
      { source: '/about', destination: '/en#about', permanent: true },
      { source: '/hakkimizda', destination: '/#hakkimizda', permanent: true },
      { source: '/iletisim', destination: '/#rezervasyon', permanent: true },
      { source: '/contact', destination: '/en#booking', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
