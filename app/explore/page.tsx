'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Globe, Filter, Star, Clock, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-100 rounded-lg animate-pulse" />
});

const destinations = [
  {
    id: 1,
    name: 'Tokyo, Japan',
    country: 'Japan',
    image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'A fascinating blend of ancient traditions and cutting-edge technology',
    culture: 'Traditional & Modern',
    highlights: ['Cherry Blossoms', 'Temples', 'Technology', 'Cuisine'],
    rating: 4.8,
    latitude: 35.6762,
    longitude: 139.6503,
    insights: 'Bow when greeting, remove shoes indoors, and be mindful of noise levels on public transport.',
  },
  {
    id: 2,
    name: 'Paris, France',
    country: 'France',
    image: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'The City of Light, renowned for art, fashion, and romance',
    culture: 'Art & Romance',
    highlights: ['Eiffel Tower', 'Louvre', 'Cafés', 'Architecture'],
    rating: 4.7,
    latitude: 48.8566,
    longitude: 2.3522,
    insights: 'Greet with "Bonjour" before asking questions, dress elegantly, and appreciate the art of conversation.',
  },
  {
    id: 3,
    name: 'Marrakech, Morocco',
    country: 'Morocco',
    image: 'https://images.pexels.com/photos/1534560/pexels-photo-1534560.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'The Red City with vibrant souks and rich Islamic heritage',
    culture: 'Vibrant Souks',
    highlights: ['Medina', 'Souks', 'Palaces', 'Gardens'],
    rating: 4.6,
    latitude: 31.6295,
    longitude: -7.9811,
    insights: 'Haggle respectfully in markets, dress modestly, and use your right hand for greetings and eating.',
  },
  {
    id: 4,
    name: 'New York City, USA',
    country: 'United States',
    image: 'https://images.pexels.com/photos/290386/pexels-photo-290386.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'The Big Apple, a melting pot of cultures and endless possibilities',
    culture: 'Urban Energy',
    highlights: ['Skyline', 'Broadway', 'Museums', 'Diversity'],
    rating: 4.5,
    latitude: 40.7128,
    longitude: -74.0060,
    insights: 'Walk fast, tip 18-20%, and be direct in communication while remaining friendly.',
  },
  {
    id: 5,
    name: 'Bali, Indonesia',
    country: 'Indonesia',
    image: 'https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Island paradise with Hindu temples, rice terraces, and spiritual retreats',
    culture: 'Spiritual & Tropical',
    highlights: ['Temples', 'Rice Terraces', 'Beaches', 'Yoga'],
    rating: 4.7,
    latitude: -8.3405,
    longitude: 115.0920,
    insights: 'Respect temple dress codes, use both hands when giving/receiving, and embrace the "go slow" mentality.',
  },
  {
    id: 6,
    name: 'Istanbul, Turkey',
    country: 'Turkey',
    image: 'https://images.pexels.com/photos/1198174/pexels-photo-1198174.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Where Europe meets Asia, rich with Byzantine and Ottoman history',
    culture: 'East Meets West',
    highlights: ['Hagia Sophia', 'Bazaars', 'Bosphorus', 'Cuisine'],
    rating: 4.6,
    latitude: 41.0082,
    longitude: 28.9784,
    insights: 'Remove shoes when entering mosques, bargain in markets, and enjoy the tea culture.',
  },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(destinations[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [culturalInsights, setCulturalInsights] = useState<any>(null);

  const getCulturalInsights = trpc.getCulturalInsights.useMutation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
  };

  const handleDestinationSelect = async (destination: typeof destinations[0]) => {
    setSelectedDestination(destination);
    setIsLoading(true);
    
    try {
      const insights = await getCulturalInsights.mutateAsync({
        location: `${destination.name}, ${destination.country}`,
        latitude: destination.latitude,
        longitude: destination.longitude,
      });
      setCulturalInsights(insights);
    } catch (error) {
      console.error('Error fetching cultural insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleDestinationSelect(destinations[0]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">Explore Destinations</h1>
              <p className="text-sm text-gray-500">Discover cultural insights worldwide</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Select>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="country">Country</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-full lg:w-80 p-4 overflow-y-auto border-r bg-white/50">
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm">
                <Search className="w-4 h-4" />
              </Button>
            </form>

            <div className="space-y-3">
              {destinations.map((destination) => (
                <motion.div
                  key={destination.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedDestination.id === destination.id
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleDestinationSelect(destination)}
                  >
                    <CardContent className="p-4">
                      <div className="flex space-x-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={destination.image}
                            alt={destination.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold truncate">{destination.name}</h3>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{destination.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{destination.country}</p>
                          <Badge variant="secondary" className="text-xs">
                            {destination.culture}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Destination Header */}
            <div className="relative">
              <div className="h-64 rounded-xl overflow-hidden">
                <img
                  src={selectedDestination.image}
                  alt={selectedDestination.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h1 className="text-3xl font-bold mb-2">{selectedDestination.name}</h1>
                  <p className="text-lg opacity-90">{selectedDestination.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{selectedDestination.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedDestination.country}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cultural Insights */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="customs">Customs</TabsTrigger>
                <TabsTrigger value="phrases">Phrases</TabsTrigger>
                <TabsTrigger value="recommendations">Places</TabsTrigger>
                <TabsTrigger value="map">Map</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="w-5 h-5 mr-2" />
                      Cultural Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{selectedDestination.insights}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {selectedDestination.highlights.map((highlight, index) => (
                        <Badge key={index} variant="outline" className="justify-center">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="customs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Local Customs & Etiquette</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                      </div>
                    ) : culturalInsights?.customs ? (
                      <div className="space-y-4">
                        <p className="text-gray-600">{culturalInsights.customs.description}</p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-green-700 mb-2">Do's</h4>
                            <ul className="space-y-1">
                              {culturalInsights.customs.dos.map((item: string, index: number) => (
                                <li key={index} className="text-sm text-gray-600">• {item}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-red-700 mb-2">Don'ts</h4>
                            <ul className="space-y-1">
                              {culturalInsights.customs.donts.map((item: string, index: number) => (
                                <li key={index} className="text-sm text-gray-600">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">Loading cultural insights...</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="phrases" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Essential Phrases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {culturalInsights?.phrases ? (
                      <div className="space-y-3">
                        {culturalInsights.phrases.essential_phrases.map((phrase: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{phrase.english}</p>
                              <p className="text-gray-600">{phrase.local}</p>
                              <p className="text-sm text-gray-500 italic">{phrase.pronunciation}</p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Users className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Loading phrases...</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Restaurants</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {culturalInsights?.recommendations ? (
                        <div className="space-y-3">
                          {culturalInsights.recommendations.restaurants.map((restaurant: any, index: number) => (
                            <div key={index} className="border-l-4 border-blue-500 pl-3">
                              <h4 className="font-semibold">{restaurant.name}</h4>
                              <p className="text-sm text-gray-600">{restaurant.type}</p>
                              <p className="text-sm text-gray-500">{restaurant.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">Loading recommendations...</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Attractions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {culturalInsights?.recommendations ? (
                        <div className="space-y-3">
                          {culturalInsights.recommendations.attractions.map((attraction: any, index: number) => (
                            <div key={index} className="border-l-4 border-purple-500 pl-3">
                              <h4 className="font-semibold">{attraction.name}</h4>
                              <p className="text-sm text-gray-600">{attraction.type}</p>
                              <p className="text-sm text-gray-500">{attraction.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">Loading attractions...</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="map" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Interactive Map</CardTitle>
                    <CardDescription>Explore cultural points of interest</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MapComponent
                      center={[selectedDestination.latitude, selectedDestination.longitude]}
                      zoom={13}
                      destinations={[selectedDestination]}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}