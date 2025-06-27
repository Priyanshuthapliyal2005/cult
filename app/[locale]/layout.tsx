'use client';

import '../globals.css';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { NextIntlClientProvider } from 'next-intl';
import { useEffect, useState } from 'react';
import { locales } from '@/i18n';
import { notFound } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const [messages, setMessages] = useState({});

  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  useEffect(() => {
    // Load messages for the current locale
    import(`../../messages/${locale}.json`)
      .then((module) => setMessages(module.default))
      .catch(() => {
        // Fallback to English if locale not found
        import('../../messages/en.json').then((module) => setMessages(module.default));
      });
  }, [locale]);

  return (
    <html lang={locale}>
      <head>
        <title>CulturalCompass - AI-Powered Travel Assistant</title>
        <meta name="description" content="Your intelligent travel companion with deep cultural insights and personalized recommendations" />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SessionProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export default trpc.withTRPC(LocaleLayout);