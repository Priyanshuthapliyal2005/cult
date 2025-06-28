'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, stagger } from 'framer-motion';
import { MapPin, MessageCircle, Globe, Compass, Users, Zap, Scale, Database, ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
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
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const testimonialRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.5]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });
  
  const isHeroInView = useInView(heroRef, { once: false, amount: 0.5 });
  const isFeaturedInView = useInView(featuredRef, { once: false, amount: 0.2 });
  const isFeaturesInView = useInView(featuresRef, { once: false, amount: 0.2 });
  const isTestimonialInView = useInView(testimonialRef, { once: false, amount: 0.2 });
  const isCtaInView = useInView(ctaRef, { once: false, amount: 0.2 });
  
  const tFeatures = useTranslations('features');
  const tNavigation = useTranslations('navigation');
  const tHomepage = useTranslations('homepage');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    setIsLoaded(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

  const staggerChildrenVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1]
      }
    })
  };
  
  const heroTextVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const parallaxOffset = {
    transform: `translateY(${-scrollY * 0.15}px)`
  };

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  return (
    <div className="min-h-screen clay-hero-pattern">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between clay-frosted-nav fixed w-full z-50">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg clay-float">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold clay-gradient-text">
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

      {/* Floating shapes */}
      <div className="clay-shape clay-shape-1" style={{ top: '10%', left: '5%' }}></div>
      <div className="clay-shape clay-shape-2" style={{ top: '15%', right: '10%' }}></div>
      <div className="clay-shape" style={{ bottom: '20%', left: '15%', width: '400px', height: '400px', background: 'linear-gradient(135deg, rgba(var(--sage-green), 0.2), rgba(var(--dusty-blue), 0.1))', filter: 'blur(80px)' }}></div>
      <div className="clay-shape" style={{ top: '30%', right: '5%', width: '250px', height: '250px', background: 'linear-gradient(135deg, rgba(var(--terracotta), 0.1), rgba(var(--dusty-blue), 0.15))', filter: 'blur(40px)' }}></div>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative clay-section" ref={heroRef}>
        <div className="clay-shape" style={{ top: '20%', left: '30%', width: '300px', height: '300px', background: 'linear-gradient(135deg, rgba(var(--sage-green), 0.2), rgba(var(--dusty-blue), 0.1))', filter: 'blur(60px)' }}></div>
      
        <motion.div 
          className="max-w-5xl mx-auto text-center relative z-10"
          style={{ opacity: heroOpacity }}
          variants={heroTextVariants}
          initial="hidden"
          animate={isHeroInView ? "visible" : "hidden"}
        >
          <motion.span 
            className="inline-block mb-3 text-xl text-blue-600 font-medium clay-float-slow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <Sparkles className="w-5 h-5 inline-block mr-2 text-yellow-500" />
            Journey Beyond Tourism
          </motion.span>
          
          <motion.h1 
            className="text-6xl md:text-7xl font-bold mb-6 clay-gradient-text leading-tight"
            variants={heroTextVariants}
          >
            Experience Culture Through <br/>
            <span className="relative">
              AI-Powered Intelligence
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></span>
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            variants={heroTextVariants}
          >
            {tHomepage('subtitle')}
          </motion.p>

          <motion.div 
            className="max-w-md mx-auto mb-12"
            variants={heroTextVariants}
          >
            <form onSubmit={handleSearch} className="flex gap-2 relative z-10">
              <Input
                type="text"
                placeholder={tHomepage('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-14 text-lg border-2 border-transparent focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-xl rounded-xl pl-4"
              />
              <Button 
                type="submit" 
                size="lg" 
                className="h-14 px-8 text-lg bg-gradient-to-r from-blueberry to-ube shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl clay-btn"
              >
                <Compass className="w-5 h-5 mr-2 clay-float-fast" />
                {tCommon('explore')}
              </Button>
            </form>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {featuredDestinations.slice(0, 4).map((destination, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={staggerChildrenVariants}
                initial="hidden"
                animate="visible"
              >
              <Card className="group cursor-pointer clay-card hover:scale-105 shadow-md clay-float">
                <CardContent className="p-0">
                  <div className="aspect-square mb-3 rounded-lg overflow-hidden">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{destination.name}</h3>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{destination.description}</p>
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border-none">
                      {destination.culture}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            className="mt-12 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <a 
              href="#features" 
              className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition-colors"
            >
              <span className="text-sm font-medium mb-2">Discover More</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </a>
          </motion.div>
        </motion.div>
        
        {/* Floating cultural symbols */}
        <motion.div className="absolute top-1/4 left-10 w-16 h-16 opacity-20 clay-float-slow">
          <div className="w-full h-full rounded-full border-2 border-blue-600 flex items-center justify-center">
            <span className="text-2xl">🕉️</span>
          </div>
        </motion.div>
        <motion.div className="absolute top-1/3 right-20 w-12 h-12 opacity-20 clay-float">
          <div className="w-full h-full rounded-full border-2 border-red-400 flex items-center justify-center">
            <span className="text-2xl">🏮</span>
          </div>
        </motion.div>
        <motion.div className="absolute bottom-1/4 right-1/4 w-14 h-14 opacity-20 clay-float-fast">
          <div className="w-full h-full rounded-full border-2 border-green-500 flex items-center justify-center">
            <span className="text-2xl">⛩️</span>
          </div>
        </motion.div>
      </section>
      
      {/* Featured Destinations Section */}
      <section id="featured" className="py-24 relative clay-section bg-gradient-to-b from-white via-blue-50/30 to-white" ref={featuredRef}>
        <div className="clay-shape" style={{ top: '-5%', right: '10%', width: '500px', height: '500px', background: 'linear-gradient(135deg, rgba(var(--sage-green), 0.1), rgba(var(--dusty-blue), 0.2))', filter: 'blur(80px)' }}></div>
        <div className="clay-shape" style={{ bottom: '10%', left: '5%', width: '400px', height: '400px', background: 'linear-gradient(135deg, rgba(var(--deep-indigo), 0.1), rgba(var(--sage-green), 0.1))', filter: 'blur(70px)' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={isFeaturedInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 clay-gradient-text inline-block"
              style={{ ...parallaxOffset }}
            >
              Experience Cultural Depth
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={isFeaturedInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Discover rich cultural experiences at these trending destinations with comprehensive AI-powered cultural insights
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDestinations.slice(0, 6).map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isFeaturedInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="clay-parallax-item clay-parallax-depth-1"
              >
                <div className="clay-card shadow-lg group h-full">
                  <div className="aspect-[5/3] overflow-hidden relative">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 w-full p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-sm font-medium">{destination.highlights.slice(0, 2).join(' • ')}</p>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col h-[calc(100%-60%)]">
                    <h3 className="text-xl font-bold mb-2 clay-gradient-text inline-block">{destination.name}</h3>
                    <div className="text-gray-500 text-sm mb-2">{destination.region}, {destination.country}</div>
                    <p className="text-gray-600 mb-4 text-sm flex-grow">{destination.description}</p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      <Badge className="bg-blue-100 text-blue-800 border-none">
                        {destination.culture}
                      </Badge>
                      <Badge variant="outline" className={`
                        ${destination.costLevel === 'budget' ? 'text-green-700 border-green-200 bg-green-50' : 
                          destination.costLevel === 'moderate' ? 'text-amber-700 border-amber-200 bg-amber-50' :
                          'text-red-700 border-red-200 bg-red-50'}`
                      }>
                        {destination.costLevel}
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={isFeaturedInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Button 
              asChild 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <Link href={getLocalizedPath('/explore')} className="flex items-center space-x-2">
                <span>Explore All Destinations</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="features" className="py-24 relative clay-section bg-gradient-to-br from-slate-50 to-blue-50" ref={featuresRef}>
        <div className="clay-shape" style={{ top: '10%', left: '20%', width: '600px', height: '600px', background: 'linear-gradient(135deg, rgba(var(--sage-green), 0.2), rgba(var(--dusty-blue), 0.1))', filter: 'blur(100px)' }}></div>
        <div className="clay-shape" style={{ bottom: '5%', right: '10%', width: '500px', height: '500px', background: 'linear-gradient(135deg, rgba(var(--deep-indigo), 0.1), rgba(var(--terracotta), 0.1))', filter: 'blur(80px)' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 40 }}
            animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              className="inline-block mb-3 text-lg text-blue-600 font-medium"
              initial={{ opacity: 0 }}
              animate={isFeaturesInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              AI-Powered Cultural Intelligence
            </motion.span>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 clay-gradient-text inline-block"
              initial={{ opacity: 0 }}
              animate={isFeaturesInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              How CulturalCompass Works
            </motion.h2>
            
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={isFeaturesInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Our AI-powered platform helps you navigate cultural nuances with ease and confidence
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="text-center">
              <motion.div 
                className="w-20 h-20 bg-gradient-to-r from-blueberry to-ube rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg clay-float-slow"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={isFeaturesInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Globe className="w-10 h-10" />
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={isFeaturesInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
              <h3 className="text-2xl font-bold mb-4 clay-gradient-text inline-block">Choose Your Destination</h3>
              <p className="text-gray-600 leading-relaxed">
                Select any city from our database of 1000+ global destinations or ask our AI about any location.
              </p>
              </motion.div>
            </div>
            
            <div className="text-center">
              <motion.div 
                className="w-20 h-20 bg-gradient-to-r from-tangarine to-dragonfruit rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg clay-float"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={isFeaturesInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <MessageCircle className="w-10 h-10" />
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={isFeaturesInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
              <h3 className="text-2xl font-bold mb-4 clay-gradient-text inline-block">Get Cultural Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive personalized recommendations, essential phrases, local customs, and legal guidance.
              </p>
              </motion.div>
            </div>
            
            <div className="text-center">
              <motion.div 
                className="w-20 h-20 bg-gradient-to-r from-matcha to-blueberry rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg clay-float-fast"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={isFeaturesInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <Compass className="w-10 h-10" />
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={isFeaturesInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
              <h3 className="text-2xl font-bold mb-4 clay-gradient-text inline-block">Travel Confidently</h3>
              <p className="text-gray-600 leading-relaxed">
                Navigate local culture with ease, avoid cultural pitfalls, and connect authentically with your destination.
              </p>
              </motion.div>
            </div>
          </div>
          
          <motion.div 
            className="mt-20 max-w-4xl mx-auto p-8 clay-card bg-white/80"
            initial={{ opacity: 0, y: 40 }}
            animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div className="relative">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 clay-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-20 clay-pulse"></div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Cultural Intelligence Dashboard</h3>
                <p className="text-gray-600">Analyze, compare, and understand cultural nuances across destinations</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Customs & Etiquette</h4>
                    <span className="text-blue-600 text-xs">12 insights</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[85%]"></div>
                    </div>
                    <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[65%]"></div>
                    </div>
                    <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[92%]"></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Language Proficiency</h4>
                    <span className="text-green-600 text-xs">8 languages</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs mb-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span>Fluent</span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500 ml-2"></span>
                    <span>Intermediate</span>
                    <span className="w-3 h-3 rounded-full bg-red-500 ml-2"></span>
                    <span>Basic</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Hindi</span>
                      <div className="w-20 h-2 bg-green-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Japanese</span>
                      <div className="w-20 h-2 bg-yellow-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Legal Compliance</h4>
                    <span className="text-purple-600 text-xs">15 regions</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs flex justify-between">
                      <span>Visa Requirements</span>
                      <span className="font-medium text-green-600">Compliant</span>
                    </div>
                    <div className="text-xs flex justify-between">
                      <span>Local Regulations</span>
                      <span className="font-medium text-yellow-600">Review Needed</span>
                    </div>
                    <div className="text-xs flex justify-between">
                      <span>Privacy Laws</span>
                      <span className="font-medium text-green-600">Compliant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-24 relative clay-section bg-gradient-to-b from-white via-slate-50/60 to-white" ref={testimonialRef}>
        <div className="clay-shape" style={{ top: '20%', right: '5%', width: '400px', height: '400px', background: 'linear-gradient(135deg, rgba(var(--deep-indigo), 0.08), rgba(var(--dusty-blue), 0.12))', filter: 'blur(70px)' }}></div>
        <div className="clay-shape" style={{ bottom: '10%', left: '10%', width: '300px', height: '300px', background: 'linear-gradient(135deg, rgba(var(--terracotta), 0.08), rgba(var(--sage-green), 0.1))', filter: 'blur(60px)' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={isTestimonialInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              className="inline-block mb-3 text-lg text-blue-600 font-medium"
              initial={{ opacity: 0 }}
              animate={isTestimonialInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              Testimonials
            </motion.span>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 clay-gradient-text inline-block"
              initial={{ opacity: 0 }}
              animate={isTestimonialInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              What Travelers Say
            </motion.h2>
            
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={isTestimonialInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Real experiences from travelers who used CulturalCompass on their journeys
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isTestimonialInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="clay-parallax-item clay-parallax-depth-1"
            >
              <div className="p-8 rounded-xl bg-gradient-to-br from-white to-blue-50 shadow-xl border border-white/80 relative h-full">
                <div className="absolute -top-6 -left-6">
                  <div className="w-12 h-12 rounded-full border-4 border-white shadow-lg overflow-hidden">
                    <img src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg" alt="User" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex items-center mb-4">
                  <div className="ml-6">
                    <h4 className="font-bold text-lg">Sarah Thompson</h4>
                    <p className="text-sm text-blue-600">Tokyo, Japan</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-6 italic relative">
                  <span className="absolute -top-3 -left-2 text-4xl text-blue-200">"</span>
                  CulturalCompass was a lifesaver in Japan. The local phrases helped me connect with shop owners, and the customs guide kept me from making embarrassing mistakes!
                  <span className="absolute -bottom-5 -right-2 text-4xl text-blue-200">"</span>
                </p>
                <div className="flex text-yellow-400 justify-end">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isTestimonialInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="clay-parallax-item clay-parallax-depth-2"
            >
              <div className="p-8 rounded-xl bg-gradient-to-br from-white to-purple-50 shadow-xl border border-white/80 relative h-full">
                <div className="absolute -top-6 -left-6">
                  <div className="w-12 h-12 rounded-full border-4 border-white shadow-lg overflow-hidden">
                    <img src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg" alt="User" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex items-center mb-4">
                  <div className="ml-6">
                    <h4 className="font-bold text-lg">Michael Rodriguez</h4>
                    <p className="text-sm text-purple-600">Pushkar, India</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-6 italic relative">
                  <span className="absolute -top-3 -left-2 text-4xl text-purple-200">"</span>
                  The cultural insights about Pushkar's spiritual significance transformed my visit. I participated in rituals with confidence and had meaningful conversations with locals.
                  <span className="absolute -bottom-5 -right-2 text-4xl text-purple-200">"</span>
                </p>
                <div className="flex text-yellow-400 justify-end">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isTestimonialInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="clay-parallax-item clay-parallax-depth-1"
            >
              <div className="p-8 rounded-xl bg-gradient-to-br from-white to-green-50 shadow-xl border border-white/80 relative h-full">
                <div className="absolute -top-6 -left-6">
                  <div className="w-12 h-12 rounded-full border-4 border-white shadow-lg overflow-hidden">
                    <img src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg" alt="User" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex items-center mb-4">
                  <div className="ml-6">
                    <h4 className="font-bold text-lg">Emma Wilson</h4>
                    <p className="text-sm text-green-600">Paris, France</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-6 italic relative">
                  <span className="absolute -top-3 -left-2 text-4xl text-green-200">"</span>
                  The legal advice about photography restrictions in Paris museums saved me from a potentially awkward situation. I appreciated having all this knowledge at my fingertips.
                  <span className="absolute -bottom-5 -right-2 text-4xl text-green-200">"</span>
                </p>
                <div className="flex text-yellow-400 justify-end">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isTestimonialInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <div className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors">
              <span>See all traveler stories</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
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
      <section className="py-32 px-4 relative clay-section" ref={ctaRef}>
        {/* Background gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blueberry via-ube to-purple-700"></div>
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400 opacity-30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-purple-500 opacity-20 rounded-full blur-3xl"></div>
        </div>
        
        {/* Content */}
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span 
              className="inline-block mb-3 text-lg text-white font-medium"
              initial={{ opacity: 0 }}
              animate={isCtaInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              Ready to begin your journey?
            </motion.span>
            
            <motion.h2 
              className="text-5xl md:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0 }}
              animate={isCtaInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {tHomepage('ctaTitle')}
            </motion.h2>
            
            <motion.p 
              className="text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={isCtaInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {tHomepage('ctaSubtitle')}
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0 }}
              animate={isCtaInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.5, staggerChildren: 0.1 }}
            >
              <Button 
                size="lg" 
                variant="secondary" 
                className="h-14 px-8 text-lg bg-white text-blue-700 hover:bg-blue-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
                asChild
              >
                <Link href={getLocalizedPath('/chat')}>
                  <MessageCircle className="w-5 h-5 mr-2 clay-float-fast" />
                  {tHomepage('startChat')}
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-8 text-lg border-white text-white hover:bg-white hover:text-blue-600 rounded-xl" 
                asChild
              >
                <Link href={getLocalizedPath('/laws')}>
                  <Scale className="w-5 h-5 mr-2 clay-float" />
                  Travel Laws
                </Link>
              </Button>
            </motion.div>
            
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={isCtaInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <p className="text-blue-200 text-sm">
                Powered by advanced AI for authentic cultural experiences
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-gray-900 text-white relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-b from-deep-indigo/10 to-transparent opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-t from-deep-indigo/10 to-transparent opacity-20"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold clay-gradient-text">CulturalCompass</span>
              </div>
              <p className="text-gray-400 mb-4 leading-relaxed">
                Your AI-powered cultural intelligence platform for authentic travel experiences across 1000+ global destinations.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-400 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Features</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cultural Intelligence</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">AI Assistant</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Interactive Maps</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Travel Laws</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Knowledge Base</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Destinations</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pushkar, India</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Rishikesh, India</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Mussoorie, India</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tokyo, Japan</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Paris, France</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link href={getLocalizedPath('/about')} className="text-gray-400 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href={getLocalizedPath('/contact')} className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href={getLocalizedPath('/privacy')} className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href={getLocalizedPath('/terms')} className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">&copy; 2024 CulturalCompass. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href={getLocalizedPath('/privacy')} className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy
              </Link>
              <Link href={getLocalizedPath('/terms')} className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms
              </Link>
              <Link href={getLocalizedPath('/contact')} className="text-gray-400 hover:text-white transition-colors text-sm">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const Star = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    stroke="currentColor" 
    strokeWidth="1" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);