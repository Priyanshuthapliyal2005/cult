'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, MessageCircle, Globe, Compass, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import UserMenu from '@/components/UserMenu';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Link from 'next/link';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      icon: Globe,
      title: t('features.culturalIntelligence.title'),
      description: t('features.culturalIntelligence.description'),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: MessageCircle,
      title: t('features.aiAssistant.title'),
      description: t('features.aiAssistant.description'),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: MapPin,
      title: t('features.interactiveMapping.title'),
      description: t('features.interactiveMapping.description'),
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Compass,
      title: t('features.localNavigation.title'),
      description: t('features.localNavigation.description'),
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Users,
      title: t('features.communityInsights.title'),
      description: t('features.communityInsights.description'),
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Zap,
      title: t('features.realTimeUpdates.title'),
      description: t('features.realTimeUpdates.description'),
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  const sampleDestinations = [
    { 
      name: t('destinations.pushkar.name'), 
      image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=400', 
      culture: t('destinations.pushkar.culture'),
      description: t('destinations.pushkar.description')
    },
    { 
      name: t('destinations.rishikesh.name'), 
      image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=400', 
      culture: t('destinations.rishikesh.culture'),
      description: t('destinations.rishikesh.description')
    },
    { 
      name: t('destinations.mussoorie.name'), 
      image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=400', 
      culture: t('destinations.mussoorie.culture'),
      description: t('destinations.mussoorie.description')
    },
    { 
      name: 'Tokyo, Japan', 
      image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400', 
      culture: 'Traditional & Modern',
      description: 'Blend of ancient traditions and technology'
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const path = locale === 'en' ? '/explore' : `/${locale}/explore`;
      router.push(`${path}?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CulturalCompass
          </span>
        </div>
        <nav className="flex items-center space-x-6">
          <Link href={getLocalizedPath('/explore')} className="text-gray-600 hover:text-gray-900 transition-colors">
            {t('navigation.explore')}
          </Link>
          <Link href={getLocalizedPath('/map')} className="text-gray-600 hover:text-gray-900 transition-colors">
            {t('navigation.maps')}
          </Link>
          <Link href={getLocalizedPath('/chat')} className="text-gray-600 hover:text-gray-900 transition-colors">
            {t('navigation.chat')}
          </Link>
          <Link href={getLocalizedPath('/admin')} className="text-gray-600 hover:text-gray-900 transition-colors">
            {t('navigation.admin')}
          </Link>
          <LanguageSwitcher variant="compact" />
          <UserMenu />
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('homepage.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('homepage.subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-md mx-auto mb-12"
          >
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder={t('homepage.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-12 text-lg border-2 border-gray-200 focus:border-blue-500"
              />
              <Button type="submit" size="lg" className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Compass className="w-5 h-5 mr-2" />
                {t('common.explore')}
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {sampleDestinations.map((destination, index) => (
              <Card key={index} className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-4">
                  <div className="aspect-square mb-3 rounded-lg overflow-hidden">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{destination.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{destination.description}</p>
                  <Badge variant="secondary" className="text-xs">
                    {destination.culture}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Demo Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('homepage.featuresTitle')}</h2>
            <p className="text-gray-600 text-lg">
              {t('homepage.featuresSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full group hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              {t('homepage.ctaTitle')}
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              {t('homepage.ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="h-12 px-8 text-lg" asChild>
                <Link href={getLocalizedPath('/chat')}>
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {t('homepage.startChat')}
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg border-white text-white hover:bg-white hover:text-blue-600" asChild>
                <Link href={getLocalizedPath('/explore')}>
                  <MapPin className="w-5 h-5 mr-2" />
                  {t('homepage.exploreDestinations')}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">CulturalCompass</span>
            </div>
            <p className="text-gray-400">
              Your AI-powered cultural intelligence platform for authentic travel experiences.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Demo Features</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Cultural Insights</li>
              <li>AI Chat Assistant</li>
              <li>Advanced Mapping</li>
              <li>Local Recommendations</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Destinations</h3>
            <ul className="space-y-2 text-gray-400">
              <li>{t('destinations.pushkar.name')}</li>
              <li>{t('destinations.rishikesh.name')}</li>
              <li>{t('destinations.mussoorie.name')}</li>
              <li>More Coming Soon</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Experience</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Cultural Customs</li>
              <li>Local Phrases</li>
              <li>Festival Information</li>
              <li>Authentic Recommendations</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2024 CulturalCompass Demo. Experience authentic cultural intelligence.</p>
        </div>
      </footer>
    </div>
  );
}