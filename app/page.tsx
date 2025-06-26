'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, MessageCircle, Globe, Compass, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const features = [
  {
    icon: Globe,
    title: 'Cultural Intelligence',
    description: 'Get deep insights into local customs, etiquette, and cultural nuances',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: MessageCircle,
    title: 'AI Travel Assistant',
    description: 'Chat with our AI for personalized travel advice and recommendations',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: MapPin,
    title: 'Interactive Mapping',
    description: 'Explore destinations with cultural points of interest and local insights',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Compass,
    title: 'Local Navigation',
    description: 'Navigate like a local with culturally-aware directions and tips',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Users,
    title: 'Community Insights',
    description: 'Connect with locals and fellow travelers for authentic experiences',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'Get live updates on events, festivals, and local happenings',
    color: 'from-yellow-500 to-orange-500',
  },
];

const popularDestinations = [
  { name: 'Tokyo, Japan', image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400', culture: 'Traditional & Modern' },
  { name: 'Paris, France', image: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=400', culture: 'Art & Romance' },
  { name: 'Marrakech, Morocco', image: 'https://images.pexels.com/photos/1534560/pexels-photo-1534560.jpeg?auto=compress&cs=tinysrgb&w=400', culture: 'Vibrant Souks' },
  { name: 'New York, USA', image: 'https://images.pexels.com/photos/290386/pexels-photo-290386.jpeg?auto=compress&cs=tinysrgb&w=400', culture: 'Urban Energy' },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/explore?q=${encodeURIComponent(searchQuery)}`;
    }
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
          <Link href="/explore" className="text-gray-600 hover:text-gray-900 transition-colors">
            Explore
          </Link>
          <Link href="/chat" className="text-gray-600 hover:text-gray-900 transition-colors">
            Chat
          </Link>
          <Button variant="outline" size="sm">
            Sign In
          </Button>
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
              Explore the World with Cultural Intelligence
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your AI-powered travel companion that provides deep cultural insights, 
              local customs, and personalized recommendations for every destination.
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
                placeholder="Where are you going?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-12 text-lg border-2 border-gray-200 focus:border-blue-500"
              />
              <Button type="submit" size="lg" className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Compass className="w-5 h-5 mr-2" />
                Explore
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {popularDestinations.map((destination, index) => (
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
                  <Badge variant="secondary" className="text-xs">
                    {destination.culture}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features for Every Traveler</h2>
            <p className="text-gray-600 text-lg">
              Discover the world with confidence using our AI-powered cultural intelligence platform
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

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Explore with Cultural Intelligence?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of travelers who trust CulturalCompass for authentic experiences
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="h-12 px-8 text-lg" asChild>
                <Link href="/chat">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Start Chatting
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg border-white text-white hover:bg-white hover:text-blue-600" asChild>
                <Link href="/explore">
                  <MapPin className="w-5 h-5 mr-2" />
                  Explore Destinations
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
            <h3 className="font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Cultural Insights</li>
              <li>AI Chat Assistant</li>
              <li>Interactive Maps</li>
              <li>Local Recommendations</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li>About Us</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Twitter</li>
              <li>LinkedIn</li>
              <li>Instagram</li>
              <li>YouTube</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2024 CulturalCompass. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}