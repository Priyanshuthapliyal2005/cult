'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { locales, type Locale } from '@/i18n';

const languageNames: Record<Locale, { name: string; nativeName: string; flag: string }> = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳' }
};

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export default function LanguageSwitcher({ variant = 'default', className = '' }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const t = useTranslations('common');

  const switchLanguage = (newLocale: Locale) => {
    if (newLocale === locale) return;

    startTransition(() => {
      // Remove current locale from pathname if present
      const safePath = pathname || '/';
      const pathWithoutLocale = safePath.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/';
      
      // Create new path with new locale
      const newPath = newLocale === 'en' ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`;
      
      router.push(newPath);
      setIsOpen(false);
    });
  };

  const currentLang = languageNames[locale];

  if (variant === 'compact') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DropdownMenuTrigger asChild className="transition-all duration-300">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 rounded-lg hover:bg-gray-100 ${className}`}
            disabled={isPending}
          >
            <span className="sr-only">{t('language')}</span>
            <span className="text-lg">{currentLang.flag}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 border-0 shadow-lg rounded-lg overflow-hidden mt-1">
          {locales.map((lang) => {
            const langInfo = languageNames[lang];
            return (
              <DropdownMenuItem
                key={lang}
                onClick={() => switchLanguage(lang)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span>{langInfo.flag}</span>
                  <span className="text-sm">{langInfo.nativeName}</span>
                </div>
                {locale === lang && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild className="transition-all duration-300">
        <Button
          variant="outline"
          size="sm"
          className={`h-9 px-3 rounded-lg hover:border-blueberry ${className}`}
          disabled={isPending}
        >
          <Globe className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">{currentLang.nativeName}</span>
          <span className="sm:hidden">{currentLang.flag}</span>
          <ChevronDown className="w-3 h-3 ml-2 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-0 shadow-lg rounded-lg overflow-hidden">
        {locales.map((lang) => {
          const langInfo = languageNames[lang];
          return (
            <DropdownMenuItem
              key={lang}
              onClick={() => switchLanguage(lang)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{langInfo.flag}</span>
                <div>
                  <div className="text-sm font-medium">{langInfo.nativeName}</div>
                  <div className="text-xs text-gray-500">{langInfo.name}</div>
                </div>
              </div>
              {locale === lang && <Check className="w-4 h-4 text-blueberry" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}