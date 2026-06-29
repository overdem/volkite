import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // BG and RO fall back to EN content until translations are ready
  const messageLocale = locale === 'bg' || locale === 'ro' ? 'en' : locale;
  const messages = (await import(`../messages/${messageLocale}.json`)).default;

  return { locale, messages };
});
