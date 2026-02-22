import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from '@/components/providers/SessionProvider';
import type { Locale } from '@/i18n';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

const supportedLocales: Locale[] = ['he', 'en'];

export const metadata: Metadata = {
  title: 'N8N Academy',
  description: 'Learn N8N by doing – interactive workflows in the browser',
};
export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const localeHeader = headersList.get('x-next-intl-locale') ?? headersList.get('accept-language');
  const locale: Locale = localeHeader && supportedLocales.includes(localeHeader.slice(0, 2) as Locale) ? (localeHeader.slice(0, 2) as Locale) : 'he';
  const messages = (await import(`../../messages/${locale}.json`)).default;
  const dir = locale === 'he' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-background text-text-primary antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SessionProvider>
            {children}
          </SessionProvider>
          <Toaster position="top-center" toastOptions={{ className: '!bg-surface !text-text-primary !border-white/10' }} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
