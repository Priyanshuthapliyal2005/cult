'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslations, useLocale } from 'next-intl';
import RealTimeAssistant from '@/components/RealTimeAssistant';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UserMenu from '@/components/UserMenu';
import Link from 'next/link';

export default function ChatPage() {
  const [currentLocation, setCurrentLocation] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  
  const t = useTranslations();
  const locale = useLocale();

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={getLocalizedPath('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">{t('chat.title')}</h1>
              <p className="text-sm text-gray-500">{t('chat.subtitle')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <LanguageSwitcher variant="compact" />
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4 h-[calc(100vh-73px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto h-full"
        >
          <RealTimeAssistant
            initialLocation={currentLocation}
            onLocationChange={setCurrentLocation}
            isMinimized={isMinimized}
            onToggleSize={() => setIsMinimized(!isMinimized)}
            className="h-full"
          />
        </motion.div>
      </div>
    </div>
  );
}