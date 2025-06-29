'use client';

import '../globals.css';
import { trpc } from '@/lib/trpc';
import { NextIntlClientProvider } from 'next-intl';
import { useEffect, useState } from 'react';
import { locales } from '@/i18n';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';

const inter = Inter({ subsets: ['latin'] });

// Dynamically import providers to prevent SSR issues
const AuthProviders = dynamic(() => import('@/components/AuthProviders'), {
  ssr: false,
});

function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const [messages, setMessages] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  useEffect(() => {
    // Load messages for the current locale
    setIsLoading(true);
    import(`../../messages/${locale}.json`)
      .then((module) => {
        setMessages(module.default);
        setIsLoading(false);
      })
      .catch(() => {
        // Fallback to English if locale not found
        import('../../messages/en.json').then((module) => {
          setMessages(module.default);
          setIsLoading(false);
        });
      });
  }, [locale]);

  return (
    <html lang={locale}>
      <head>
        <title>CulturalCompass - AI-Powered Travel Assistant</title>
        <meta name="description" content="Your intelligent travel companion with deep cultural insights and personalized recommendations" />
        <meta name="theme-color" content="#6B7AFF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        {isLoading || !messages ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-lg">Loading...</div>
          </div>
        ) : (
          <NextIntlClientProvider locale={locale} messages={messages}>
            <AuthProviders>
              {children}
            </AuthProviders>
          </NextIntlClientProvider>
        )}
      </body>
    </html>
  );
}

export default trpc.withTRPC(LocaleLayout);