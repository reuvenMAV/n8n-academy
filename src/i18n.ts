import { getRequestConfig } from 'next-intl/server';

export const locales = ['he', 'en'] as const;
export type Locale = (typeof locales)[number];

export const routingConfig = {
  locales: ['he', 'en'] as const,
  defaultLocale: 'he' as const,
  localePrefix: 'as-needed' as const,
};

export default getRequestConfig(async ({ locale: requestLocale }) => {
  const locale = !requestLocale || !locales.includes(requestLocale as Locale) ? 'he' : requestLocale;
  const messages = (await import(`../messages/${locale}.json`)).default;
  return {
    locale,
    messages,
    timeZone: 'Asia/Jerusalem',
    now: new Date(),
  };
});
