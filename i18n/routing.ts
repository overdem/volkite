import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['tr', 'en', 'bg', 'ro'],
  defaultLocale: 'tr',
  localePrefix: 'as-needed',
});
