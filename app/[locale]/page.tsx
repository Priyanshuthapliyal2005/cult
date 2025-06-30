'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
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
import { BoltNewIcon } from '@/components/ui/BoltNewIcon';

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
          <Link href={getLocalizedPath('/knowledge-base')} className="text-gray-600 hover:text-gray-900 transition-colors">
            Knowledge Base
          </Link>
          <Link href={getLocalizedPath('/chat')} className="text-gray-600 hover:text-gray-900 transition-colors">
            {tNavigation('chat')}
          </Link>
          <Link href={getLocalizedPath('/admin')} className="text-gray-600 hover:text-gray-900 transition-colors">
            {tNavigation('admin')}
          </Link>
          <Link href="https://bolt.new/" target="_blank" rel="noopener noreferrer" title="bolt.new" className="hover:scale-110 transition-transform">
            <BoltNewIcon className="w-7 h-7" />
          </Link>
          <LanguageSwitcher variant="compact" />
          <UserMenu />
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative clay-section" ref={heroRef}>
        <div className="clay-shape" style={{ top: '20%', left: '30%', width: '300px', height: '300px', background: 'linear-gradient(135deg, rgba(var(--sage-green), 0.2), rgba(var(--dusty-blue), 0.1))', filter: 'blur(60px)' }}></div>
      
        <motion.div 
          className="max-w-5xl mx-auto text-center"
          variants={heroTextVariants}
          initial="hidden"
          animate={isHeroInView ? "visible" : "hidden"}
        >
          <motion.h1 className="text-5xl md:text-6xl font-extrabold mb-6 clay-gradient-text leading-tight" variants={heroTextVariants}>
            {tHomepage('title')}
          </motion.h1>
          <motion.p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10" variants={heroTextVariants}>
            {tHomepage('subtitle')}
          </motion.p>
          
          <motion.div className="max-w-2xl mx-auto mb-16" variants={heroTextVariants}>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row">
              <div className="relative flex-grow">
                <Input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={tHomepage('searchPlaceholder')}
                  className="h-14 pl-5 pr-12 rounded-l-full rounded-r-full sm:rounded-r-none border-2 border-indigo-100 focus-visible:ring-indigo-300 text-lg"
                />
                <Button 
                  variant="ghost" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                  aria-label="Search"
                  type="button"
                  onClick={handleSearch}
                >
                  <Sparkles size={24} />
                </Button>
              </div>
              <Button 
                type="submit"
                className="h-14 px-8 mt-3 sm:mt-0 sm:rounded-l-none rounded-full bg-gradient-to-r from-blueberry to-ube text-white hover:shadow-lg transition-all duration-300"
              >
                {tCommon('search')}
              </Button>
            </form>
          </motion.div>
          
          <motion.div 
            className="flex flex-wrap justify-center gap-4"
            variants={heroTextVariants}
          >
            <Button variant="outline" size="lg" asChild className="gap-2 rounded-full shadow-sm clay-btn px-6 hover:shadow-md">
              <Link href={getLocalizedPath('/chat')}>
                <MessageCircle size={18} />
                {tHomepage('startChat')}
              </Link>
            </Button>
            <Button size="lg" asChild className="gap-2 rounded-full bg-gradient-to-r from-blueberry to-ube text-white shadow-sm hover:shadow-md">
              <Link href={getLocalizedPath('/explore')}>
                <Compass size={18} />
                {tHomepage('exploreDestinations')}
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Destinations */}
      <section className="py-16 px-4 bg-white" ref={featuredRef}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Destinations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Discover these culturally rich destinations with comprehensive insights</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDestinations.map((destination, index) => (
              <motion.div 
                key={destination.id}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                animate={isFeaturedInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                custom={index}
              >
                <Link href={getLocalizedPath(`/explore?q=${destination.name}`)}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={destination.image} 
                        alt={destination.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4">
                        <Badge className="mb-2">{destination.costLevel}</Badge>
                        <h3 className="text-xl font-bold text-white">{destination.name}</h3>
                        <p className="text-white/80">{destination.region}, {destination.country}</p>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Star className="text-yellow-400 fill-yellow-400 w-4 h-4 mr-1" />
                          <span className="font-medium">{destination.rating}</span>
                        </div>
                        <Badge variant="outline">{destination.culture}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{destination.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Button asChild variant="outline" className="rounded-full">
              <Link href={getLocalizedPath('/explore')}>
                View All Destinations
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-24 px-4 bg-gray-50" ref={featuresRef}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{tHomepage('featuresTitle')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{tHomepage('featuresSubtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                custom={index}
                initial="hidden"
                animate={isFeaturesInView ? "visible" : "hidden"}
                variants={staggerChildrenVariants}
              >
                <Card className="h-full overflow-hidden clay-card border-0">
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.color} mb-4`}>
                      <feature.icon className="text-white w-6 h-6" />
                    </div>
                    <CardTitle className="mb-3">{feature.title}</CardTitle>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-white" ref={testimonialRef}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Travelers Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Real experiences from travelers using cultural intelligence</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "CulturalCompass transformed my trip to Pushkar. The cultural insights helped me connect with locals in ways I wouldn't have imagined possible.",
                name: "Emma Roberts",
                title: "Adventure Traveler",
                avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              },
              {
                quote: "The real-time assistant answered all my questions about local customs and even helped me learn essential Hindi phrases. Invaluable experience!",
                name: "David Chen",
                title: "Digital Nomad",
                avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              },
              {
                quote: "As a solo female traveler, the legal guidelines and safety tips gave me confidence exploring new destinations. This app is a game-changer.",
                name: "Sarah Johnson",
                title: "Solo Traveler",
                avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isTestimonialInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="clay-testimonial border-0 h-full flex flex-col">
                  <CardContent className="p-6 flex-grow flex flex-col">
                    <div className="mb-4 text-amber-500 flex">
                      <Star className="fill-current w-5 h-5" />
                      <Star className="fill-current w-5 h-5" />
                      <Star className="fill-current w-5 h-5" />
                      <Star className="fill-current w-5 h-5" />
                      <Star className="fill-current w-5 h-5" />
                    </div>
                    <p className="text-gray-600 italic mb-6 flex-grow">"{testimonial.quote}"</p>
                    <div className="flex items-center mt-auto">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500">{testimonial.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-indigo-500/90 to-purple-500/90 text-white relative overflow-hidden" ref={ctaRef}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'url("https://images.pexels.com/photos/3761529/pexels-photo-3761529.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              {tHomepage('ctaTitle')}
            </motion.h2>
            <motion.p 
              className="text-xl text-white/80 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {tHomepage('ctaSubtitle')}
            </motion.p>
          </div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button size="lg" asChild className="bg-white text-indigo-600 hover:bg-white/90 hover:text-indigo-700">
              <Link href={getLocalizedPath('/explore')}>
                <Compass className="mr-2 h-5 w-5" />
                Start Exploring
              </Link>
            </Button>
            <Button size="lg" asChild variant="outline" className="text-white border-white hover:bg-white/10">
              <Link href={getLocalizedPath('/chat')}>
                <MessageCircle className="mr-2 h-5 w-5" />
                Chat with Cultural AI
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                CulturalCompass
              </span>
            </div>
            <p className="mb-4">Your AI-powered travel companion with cultural intelligence for authentic, respectful exploration.</p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index}>
                  <Link href="#" className="hover:text-white transition-colors">
                    {feature.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/knowledge-base" className="hover:text-white transition-colors">Knowledge Base</Link></li>
              <li><Link href="/explore" className="hover:text-white transition-colors">Destination Explorer</Link></li>
              <li><Link href="/chat" className="hover:text-white transition-colors">AI Assistant</Link></li>
              <li><Link href="/explore?tab=laws" className="hover:text-white transition-colors">Travel Laws</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-gray-800 text-center flex flex-col items-center gap-2">
          <p>&copy; 2025 CulturalCompass. All rights reserved.</p>
          <a href="https://bolt.new/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mt-2">
            <BoltNewIcon className="w-6 h-6" />
            <span>This project is sponsored by <span className="font-semibold">bolt.new</span></span>
          </a>
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