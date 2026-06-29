import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge(base: Record<string, any>, override: Record<string, any>): Record<string, any> {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      typeof override[key] === 'object' &&
      !Array.isArray(override[key]) &&
      override[key] !== null &&
      result[key] != null &&
      typeof result[key] === 'object' &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const messages = (await import(`../messages/${locale}.json`)).default;

  if (locale === 'bg' || locale === 'ro') {
    const en = (await import('../messages/en.json')).default;
    return { locale, messages: deepMerge(en, messages) };
  }

  return { locale, messages };
});
