'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Scale, Shield, Users, CheckCircle, Globe, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations, useLocale } from 'next-intl';
import TravelLawsAssistant from '@/components/TravelLawsAssistant';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UserMenu from '@/components/UserMenu';
import { cityDatabase, type CityData } from '@/lib/cityDatabase';
import Link from 'next/link';

export default function TravelLawsPage() {
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const t = useTranslations();
  const locale = useLocale();

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  // Statistics
  const totalCities = cityDatabase.length;
  const totalCountries = new Set(cityDatabase.map(city => city.country)).size;
  const citiesWithLaws = cityDatabase.filter(city => city.travelLaws).length;

  const features = [
    {
      icon: Scale,
      title: 'Legal Compliance',
      description: 'Understand local laws and regulations to avoid legal issues during travel',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Shield,
      title: 'Travel Safety',
      description: 'Know your rights and responsibilities as a tourist in any destination',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Users,
      title: 'Cultural Respect',
      description: 'Navigate local customs and social norms with confidence and respect',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Access legal information for destinations worldwide',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">TravelLaw.AI</h1>
              <p className="text-sm text-gray-500">AI-powered legal travel guidance</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <LanguageSwitcher variant="compact" />
          <UserMenu />
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Hero Section */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Understand Travel Laws
                <br />
                in Plain English
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Get clear, AI-powered explanations of local government laws and policies. 
                No legal jargon, just straightforward answers for confident travel.
              </p>
            </motion.div>

            {/* Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12"
            >
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                  <div className="text-sm text-gray-500">Questions Answered</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">{totalCities}+</div>
                  <div className="text-sm text-gray-500">Cities Covered</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
                  <div className="text-sm text-gray-500">User Satisfaction</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                  <div className="text-sm text-gray-500">Available</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Features Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">How TravelLaw.AI Helps</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
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

          {/* Mission Statement */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600 max-w-3xl mx-auto">
                We aim to bridge the gap between complex legal language and everyday understanding, 
                making local government policies accessible to all travelers through the power of AI technology.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Accurate & Reliable</h3>
                  <p className="text-sm text-gray-600">Information sourced from official government databases</p>
                </div>
                <div className="text-center">
                  <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Accessible to All</h3>
                  <p className="text-sm text-gray-600">Complex legal language made simple for everyone</p>
                </div>
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Instant Answers</h3>
                  <p className="text-sm text-gray-600">Get immediate responses to your legal questions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Assistant Component */}
          <TravelLawsAssistant 
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
          />

          {/* Technology Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Our Technology</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Advanced Features</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Advanced AI language processing
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Real-time government data integration
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Location-specific legal information
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Continuously updated knowledge base
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">For Travelers</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                      Understand local ordinances in plain English
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                      Get instant answers to legal questions
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                      Access information 24/7 from anywhere
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                      Save and reference important information
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}