import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import ChatWidget from '@/components/ChatWidget';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  const base = 'https://volkite.com';
  const localeHref = (l: string) => (l === 'tr' ? base : `${base}/${l}`);

  return {
    title: {
      default: t('title'),
      template: `%s | Volkite`,
    },
    description: t('description'),
    metadataBase: new URL(base),
    alternates: {
      canonical: localeHref(locale),
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, localeHref(l)])
      ),
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: localeHref(locale),
      siteName: 'Volkite Kitesurf',
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full scroll-smooth">
      <body className="min-h-full font-body antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <ChatWidget />
      </body>
    </html>
  );
}
