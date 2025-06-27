'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';

const inter = Inter({ subsets: ['latin'] });

function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>CulturalCompass - AI-Powered Travel Assistant</title>
        <meta name="description" content="Your intelligent travel companion with deep cultural insights and personalized recommendations" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

export default trpc.withTRPC(RootLayout);