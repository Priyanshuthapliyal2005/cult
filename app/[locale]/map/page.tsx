'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, MapPin, Search, Filter, Layers, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import MapComponent from '@/components/MapComponent';
import RouteMapper from '@/components/RouteMapper';
import MapSearch from '@/components/MapSearch';
import DynamicCityMap from '@/components/DynamicCityMap';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UserMenu from '@/components/UserMenu';

export default function MapPage() {
  const [destinations, setDestinations] = useState<any[]>([
    {
      id: 1,
      name: 'Pushkar Brahma Temple',
      latitude: 26.4899,
      longitude: 74.5511,
      description: 'One of the few temples dedicated to Lord Brahma',
      type: 'temple',
      rating: 4.8,
      image: 'https://images.pexels.com/photos/5458388/pexels-photo-5458388.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 2,
      name: 'Pushkar Lake',
      latitude: 26.4902,
      longitude: 74.5514,
      description: 'Sacred lake with 52 ghats',
      type: 'attraction',
      rating: 4.6,
      image: 'https://images.pexels.com/photos/16802465/pexels-photo-16802465/free-photo-of-temple-in-pushkar.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 3,
      name: 'Sunset Cafe',
      latitude: 26.4895,
      longitude: 74.5508,
      description: 'Popular cafe with lake views',
      type: 'restaurant',
      rating: 4.3,
      image: 'https://images.pexels.com/photos/2159065/pexels-photo-2159065.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }
  ]);

  const t = useTranslations();
  const locale = useLocale();

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  // Function to handle location click on map
  const handleLocationClick = (lat: number, lng: number) => {
    console.log(`Selected location: ${lat}, ${lng}`);
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
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">{t('map.title')}</h1>
              <p className="text-sm text-gray-500">{t('map.subtitle')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <LanguageSwitcher variant="compact" />
          <UserMenu />
        </div>
      </header>

      <div className="container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Map navigation tabs */}
          <Tabs defaultValue="explore" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="explore">
                <Globe className="w-4 h-4 mr-2" />
                {t('map.culturalDestinations')}
              </TabsTrigger>
              <TabsTrigger value="route">
                <Navigation className="w-4 h-4 mr-2" />
                {t('map.routePlanning')}
              </TabsTrigger>
              <TabsTrigger value="search">
                <Search className="w-4 h-4 mr-2" />
                {t('map.searchAndNavigate')}
              </TabsTrigger>
            </TabsList>

            {/* Explore Map */}
            <TabsContent value="explore" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Cultural Destinations Map
                  </CardTitle>
                  <CardDescription>
                    Explore destinations with cultural significance and local insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <DynamicCityMap
                    center={[26.4899, 74.5511]} // Pushkar coordinates
                    zoom={14}
                    height="600px"
                    onCitySelect={(city) => console.log('Selected city:', city)}
                    selectedCityId="pushkar-india"
                    showSearch={true}
                    showNearby={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Route Planner */}
            <TabsContent value="route" className="space-y-4 mt-4">
              <RouteMapper
                center={[26.4899, 74.5511]} // Pushkar coordinates
                zoom={14}
                height="600px"
              />
            </TabsContent>

            {/* Search Map */}
            <TabsContent value="search" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="w-5 h-5 mr-2" />
                    Find Cultural Points of Interest
                  </CardTitle>
                  <CardDescription>
                    Search for temples, historical sites, and local experiences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <MapSearch
                      onLocationSelect={(lat, lng, name) => {
                        console.log(`Selected: ${name} at ${lat},${lng}`);
                      }}
                      className="flex-1"
                    />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="temple">Temples</SelectItem>
                        <SelectItem value="attraction">Attractions</SelectItem>
                        <SelectItem value="restaurant">Restaurants</SelectItem>
                        <SelectItem value="hotel">Accommodations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <MapComponent
                    center={[26.4899, 74.5511]}
                    zoom={14}
                    destinations={destinations}
                    height="500px"
                    showControls={true}
                    showSearch={true}
                    onLocationClick={handleLocationClick}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}