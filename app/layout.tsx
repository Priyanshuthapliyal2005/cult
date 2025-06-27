import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
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
        {children}
      </body>
    </html>
  );
}