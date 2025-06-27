'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, MessageCircle, Globe, Compass, Users, Zap, Scale, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge'; 
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import UserMenu from '@/components/UserMenu';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { cityDatabase, type CityData } from '@/lib/cityDatabase';
import Link from 'next/link';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const tFeatures = useTranslations('features');
  const tNavigation = useTranslations('navigation');
  const tHomepage = useTranslations('homepage');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      icon: Globe,
      title: tFeatures('culturalIntelligence.title'),
      description: tFeatures('culturalIntelligence.description'),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: MessageCircle,
      title: tFeatures('aiAssistant.title'),
      description: tFeatures('aiAssistant.description'),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: MapPin,
      title: tFeatures('interactiveMapping.title'),
      description: tFeatures('interactiveMapping.description'),
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Compass,
      title: tFeatures('localNavigation.title'),
      description: tFeatures('localNavigation.description'),
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Users,
      title: tFeatures('communityInsights.title'),
      description: tFeatures('communityInsights.description'),
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Zap,
      title: tFeatures('realTimeUpdates.title'),
      description: tFeatures('realTimeUpdates.description'),
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  // Get featured destinations from city database
  const featuredDestinations = [
    'pushkar-india',
    'rishikesh-india', 
    'mussoorie-india',
    'tokyo-japan'
  ].map(id => cityDatabase.find(city => city.id === id)).filter(Boolean) as CityData[];

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
            {tNavigation('explore')}
          </Link>
          <Link href={getLocalizedPath('/laws')} className="text-gray-600 hover:text-gray-900 transition-colors">
            {tNavigation('laws')}
          </Link>
          <Link href={getLocalizedPath('/map')} className="text-gray-600 hover:text-gray-900 transition-colors">
            {tNavigation('maps')}
          </Link>
          <Link href={getLocalizedPath('/knowledge-base')} className="text-gray-600 hover:text-gray-900 transition-colors">
            Knowledge Base
          </Link>
          <Link href={getLocalizedPath('/chat')} className="text-gray-600 hover:text-gray-900 transition-colors">
            {tNavigation('chat')}
          </Link>
          <Link href={getLocalizedPath('/admin')} className="text-gray-600 hover:text-gray-900 transition-colors">
            {tNavigation('admin')}
          </Link>
          <LanguageSwitcher variant="compact" />
          <UserMenu />
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blueberry via-ube to-secondary bg-clip-text text-transparent">
              {tHomepage('title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {tHomepage('subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-md mx-auto mb-12"
          >
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder={tHomepage('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-12 text-lg border-2 border-gray-200 focus:border-blue-500"
              />
              <Button type="submit" size="lg" className="h-12 px-6 bg-gradient-to-r from-blueberry to-ube hover:shadow-md transition-all duration-300">
                <Compass className="w-5 h-5 mr-2" />
                {tCommon('explore')}
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {featuredDestinations.map((destination, index) => (
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
      {/* Featured Destinations Section */}
      <section className="clay-section bg-white">
        <div className="clay-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Popular Destinations</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover rich cultural experiences at these trending destinations with comprehensive cultural insights
            </p>
          </div>
          
          <div className="clay-responsive-grid">
            {featuredDestinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="clay-card overflow-hidden group">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{destination.name}, {destination.country}</h3>
                    <p className="text-gray-600 mb-4">{destination.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-blueberry/10 text-blueberry border-none">
                        {destination.culture}
                      </Badge>
                      <Badge variant="outline" className={
                        destination.costLevel === 'budget' ? 'text-green-700 border-green-200' :
                        destination.costLevel === 'moderate' ? 'text-yellow-700 border-yellow-200' :
                        'text-red-700 border-red-200'
                      }>
                        {destination.costLevel}
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Button asChild className="clay-primary-button">
              <Link href={getLocalizedPath('/explore')}>
                Explore All Destinations
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="clay-section bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="clay-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How CulturalCompass Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform helps you navigate cultural nuances with ease and confidence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blueberry to-ube rounded-2xl flex items-center justify-center text-white mx-auto mb-5">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Choose Your Destination</h3>
              <p className="text-gray-600">
                Select any city from our database of 1000+ global destinations or ask our AI about any location.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-tangarine to-dragonfruit rounded-2xl flex items-center justify-center text-white mx-auto mb-5">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Get Cultural Insights</h3>
              <p className="text-gray-600">
                Receive personalized recommendations, essential phrases, local customs, and legal guidance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-matcha to-blueberry rounded-2xl flex items-center justify-center text-white mx-auto mb-5">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Travel Confidently</h3>
              <p className="text-gray-600">
                Navigate local culture with ease, avoid cultural pitfalls, and connect authentically with your destination.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="clay-section bg-white">
        <div className="clay-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Travelers Say</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Real experiences from travelers who used CulturalCompass on their journeys
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="clay-testimonial">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                  <img src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg" alt="User" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold">Sarah Thompson</h4>
                  <p className="text-sm text-gray-600">Tokyo, Japan</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "CulturalCompass was a lifesaver in Japan. The local phrases helped me connect with shop owners, and the customs guide kept me from making embarrassing mistakes!"
              </p>
              <div className="flex text-yellow-400">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
            </div>
            
            <div className="clay-testimonial">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                  <img src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg" alt="User" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold">Michael Rodriguez</h4>
                  <p className="text-sm text-gray-600">Pushkar, India</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "The cultural insights about Pushkar's spiritual significance transformed my visit. I participated in rituals with confidence and had meaningful conversations with locals."
              </p>
              <div className="flex text-yellow-400">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
            </div>
            
            <div className="clay-testimonial">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                  <img src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg" alt="User" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold">Emma Wilson</h4>
                  <p className="text-sm text-gray-600">Paris, France</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "The legal advice about photography restrictions in Paris museums saved me from a potentially awkward situation. I appreciated having all this knowledge at my fingertips."
              </p>
              <div className="flex text-yellow-400">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{tHomepage('featuresTitle')}</h2>
            <p className="text-gray-600 text-lg">
              {tHomepage('featuresSubtitle')}
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
      <section className="py-20 px-4 bg-gradient-to-r from-blueberry to-ube">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              {tHomepage('ctaTitle')}
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              {tHomepage('ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="h-12 px-8 text-lg" asChild>
                <Link href={getLocalizedPath('/chat')}>
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {tHomepage('startChat')}
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg border-white text-white hover:bg-white hover:text-blue-600" asChild>
                <Link href={getLocalizedPath('/laws')}>
                  <Scale className="w-5 h-5 mr-2" />
                  Travel Laws
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg border-white text-white hover:bg-white hover:text-blue-600" asChild>
                <Link href={getLocalizedPath('/explore')}>
                  <MapPin className="w-5 h-5 mr-2" />
                  {tHomepage('exploreDestinations')}
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg border-white text-white hover:bg-white hover:text-blue-600" asChild>
                <Link href={getLocalizedPath('/knowledge-base')}>
                  <Database className="w-5 h-5 mr-2" />
                  Knowledge Base
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
              <span className="text-xl font-bold">CulturalCompass AI</span>
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
              <li>Travel Law Guidance</li>
              <li>Local Recommendations</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Destinations</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Pushkar, India</li>
              <li>Rishikesh, India</li>
              <li>Mussoorie, India</li>
              <li>Tokyo, Japan</li>
              <li>Paris, France</li>
              <li>Ubud, Indonesia</li>
              <li>1000+ More Cities</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Experience</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Cultural Customs</li>
              <li>Local Phrases</li>
              <li>Legal Regulations</li>
              <li>Festival Information</li>
              <li>Authentic Recommendations</li>
            </ul>
          </div>
        </div>
            <p>&copy; 2024 CulturalCompass AI. Experience authentic cultural intelligence.</p>
            <div className="mt-4 flex justify-center space-x-4">
              <Link href={getLocalizedPath('/privacy')}>
                <span className="text-gray-400 hover:text-white transition-colors">Privacy Policy</span>
              </Link>
              <Link href={getLocalizedPath('/terms')}>
                <span className="text-gray-400 hover:text-white transition-colors">Terms of Service</span>
              </Link>
              <Link href={getLocalizedPath('/contact')}>
                <span className="text-gray-400 hover:text-white transition-colors">Contact Us</span>
              </Link>
            </div>
          <p>&copy; 2024 CulturalCompass Demo. Experience authentic cultural intelligence.</p>
        </div>
      </footer>
    </div>
  );
}