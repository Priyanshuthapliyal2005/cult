'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Globe, Filter, Star, Clock, Users, ArrowLeft, AlertCircle, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/lib/trpc';
import AudioPlayer from '@/components/AudioPlayer';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
    <div className="text-gray-500">Loading map...</div>
  </div>
});

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [culturalInsights, setCulturalInsights] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const getCulturalInsights = trpc.getCulturalInsights.useMutation();
  const { data: destinations = [], isLoading: destinationsLoading } = trpc.getDestinations.useQuery();
  const testElevenLabs = trpc.audio.testElevenLabs.useQuery();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter destinations based on search query
    const filtered = destinations.filter(dest => 
      dest.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.region.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      handleDestinationSelect(filtered[0]);
    }
  };

  const handleDestinationSelect = async (destination: any) => {
    setSelectedDestination(destination);
    setIsLoading(true);
    setError(null);
    setCulturalInsights(null);
    
    try {
      const insights = await getCulturalInsights.mutateAsync({
        location: destination.location,
        latitude: destination.latitude,
        longitude: destination.longitude,
      });
      setCulturalInsights(insights);
    } catch (error) {
      console.error('Error fetching cultural insights:', error);
      setError(error instanceof Error ? error.message : 'Failed to load cultural insights');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (destinations.length > 0 && !selectedDestination) {
      handleDestinationSelect(destinations[0]);
    }
  }, [destinations]);

  if (destinationsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading destinations...</p>
        </div>
      </div>
    );
  }

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
          <Badge 
            variant={testElevenLabs.data?.status === 'success' ? "default" : "secondary"} 
            className={testElevenLabs.data?.status === 'success' ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200"}
          >
            Audio: {testElevenLabs.isLoading ? 'Testing...' : testElevenLabs.data?.status || 'Demo'}
          </Badge>
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
              {destinations.map((destination: any) => (
                <motion.div
                  key={destination.location}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedDestination?.location === destination.location
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
                            alt={destination.location}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold truncate">{destination.location}</h3>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{destination.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{destination.region}, {destination.country}</p>
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
            {/* Error Display */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Audio Status */}
            {testElevenLabs.data?.status === 'demo' && (
              <Alert className="border-blue-200 bg-blue-50">
                <Volume2 className="h-4 w-4" />
                <AlertDescription>
                  Audio pronunciation is in demo mode. Add your ElevenLabs API key for real voice synthesis.
                </AlertDescription>
              </Alert>
            )}

            {selectedDestination && (
              <>
                {/* Destination Header */}
                <div className="relative">
                  <div className="h-64 rounded-xl overflow-hidden">
                    <img
                      src={selectedDestination.image}
                      alt={selectedDestination.location}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h1 className="text-3xl font-bold mb-2">{selectedDestination.location}</h1>
                      <p className="text-lg opacity-90">{selectedDestination.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{selectedDestination.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedDestination.region}, {selectedDestination.country}</span>
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
                          {selectedDestination.highlights.map((highlight: string, index: number) => (
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
                          <p className="text-gray-500">Click on a destination to load cultural insights...</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="phrases" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Essential Phrases</CardTitle>
                        <CardDescription>Learn key phrases with pronunciation guides</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="p-3 bg-gray-50 rounded-lg animate-pulse">
                                <div className="h-4 bg-gray-200 rounded mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-2/3" />
                              </div>
                            ))}
                          </div>
                        ) : culturalInsights?.phrases ? (
                          <div className="space-y-3">
                            {culturalInsights.phrases.essential_phrases.map((phrase: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{phrase.english}</p>
                                  <p className="text-lg text-blue-600 font-semibold">{phrase.local}</p>
                                  <p className="text-sm text-gray-500 italic">Pronunciation: {phrase.pronunciation}</p>
                                </div>
                                <AudioPlayer
                                  text={phrase.local}
                                  language="hi"
                                  className="ml-4 hover:bg-blue-100"
                                />
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
                          {isLoading ? (
                            <div className="space-y-3">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="border-l-4 border-gray-200 pl-3 animate-pulse">
                                  <div className="h-4 bg-gray-200 rounded mb-1" />
                                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-1" />
                                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                                </div>
                              ))}
                            </div>
                          ) : culturalInsights?.recommendations ? (
                            <div className="space-y-4">
                              {culturalInsights.recommendations.restaurants.map((restaurant: any, index: number) => (
                                <div key={index} className="border-l-4 border-blue-500 pl-4 hover:bg-blue-50 p-2 rounded-r transition-colors">
                                  <h4 className="font-semibold text-gray-900">{restaurant.name}</h4>
                                  <p className="text-sm text-blue-600 font-medium">{restaurant.type}</p>
                                  <p className="text-sm text-gray-600 mt-1">{restaurant.description}</p>
                                  {restaurant.price_range && (
                                    <Badge variant="outline" className="mt-2 text-xs">
                                      {restaurant.price_range}
                                    </Badge>
                                  )}
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
                          {isLoading ? (
                            <div className="space-y-3">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="border-l-4 border-gray-200 pl-3 animate-pulse">
                                  <div className="h-4 bg-gray-200 rounded mb-1" />
                                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-1" />
                                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                                </div>
                              ))}
                            </div>
                          ) : culturalInsights?.recommendations ? (
                            <div className="space-y-4">
                              {culturalInsights.recommendations.attractions.map((attraction: any, index: number) => (
                                <div key={index} className="border-l-4 border-purple-500 pl-4 hover:bg-purple-50 p-2 rounded-r transition-colors">
                                  <h4 className="font-semibold text-gray-900">{attraction.name}</h4>
                                  <p className="text-sm text-purple-600 font-medium">{attraction.type}</p>
                                  <p className="text-sm text-gray-600 mt-1">{attraction.description}</p>
                                  {attraction.timing && (
                                    <Badge variant="outline" className="mt-2 text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {attraction.timing}
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">Loading attractions...</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Local Tips */}
                    {culturalInsights?.recommendations?.local_tips && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Local Tips</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-3">
                            {culturalInsights.recommendations.local_tips.map((tip: string, index: number) => (
                              <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 shrink-0" />
                                <p className="text-sm text-gray-700">{tip}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="map" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          Interactive Map
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/map">
                              <MapPin className="w-4 h-4 mr-1" />
                              Full Map View
                            </Link>
                          </Button>
                        </CardTitle>
                        <CardDescription>
                          Basic map view - visit our full maps page for advanced features
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <MapComponent
                          center={[selectedDestination.latitude, selectedDestination.longitude]}
                          zoom={13}
                          destinations={[{
                            id: 1,
                            name: selectedDestination.location,
                            latitude: selectedDestination.latitude,
                            longitude: selectedDestination.longitude,
                            description: selectedDestination.description,
                            culture: selectedDestination.culture
                          }]}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}