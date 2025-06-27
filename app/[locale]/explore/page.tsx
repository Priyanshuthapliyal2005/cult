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
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { getCitiesByFilter, getCityById, type CityData } from '@/lib/cityDatabase';
import AudioPlayer from '@/components/AudioPlayer';
import TripPlanner from '@/components/TripPlanner';
import DynamicCityMap from '@/components/DynamicCityMap';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UserMenu from '@/components/UserMenu';
import Link from 'next/link';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [culturalInsights, setCulturalInsights] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<CityData[]>([]);
  const [filters, setFilters] = useState({
    country: '',
    costLevel: '' as '' | 'budget' | 'moderate' | 'expensive',
    minRating: 0
  });

  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const getCulturalInsights = trpc.getCulturalInsights.useMutation();
  const testElevenLabs = trpc.audio.testElevenLabs.useQuery();
  const testAI = trpc.testAI.useQuery();

  // Load initial data and handle search params
  useEffect(() => {
    loadCities();
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      handleSearch(query);
    }
  }, [searchParams, filters]);

  const loadCities = () => {
    const filteredCities = getCitiesByFilter({
      ...filters,
      searchTerm: searchQuery || undefined
    });
    setCities(filteredCities);
    
    // Auto-select first city if none selected
    if (!selectedCity && filteredCities.length > 0) {
      handleCitySelect(filteredCities[0]);
    }
  };

  const handleSearch = (query = searchQuery) => {
    if (!query.trim()) return;
    
    const filteredCities = getCitiesByFilter({
      ...filters,
      searchTerm: query
    });
    setCities(filteredCities);
    
    if (filteredCities.length > 0) {
      handleCitySelect(filteredCities[0]);
    }
  };

  const handleCitySelect = async (city: CityData) => {
    setSelectedCity(city);
    setIsLoading(true);
    setError(null);
    setCulturalInsights(null);
    
    try {
      const insights = await getCulturalInsights.mutateAsync({
        location: city.name,
        latitude: city.latitude,
        longitude: city.longitude,
      });
      setCulturalInsights(insights);
    } catch (error) {
      console.error('Error fetching cultural insights:', error);
      setError(error instanceof Error ? error.message : 'Failed to load cultural insights');
    } finally {
      setIsLoading(false);
    }
  };

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
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
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">{t('explore.title')}</h1>
              <p className="text-sm text-gray-500">{t('explore.subtitle')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            variant={testAI.data?.overall?.status === 'success' ? "default" : "secondary"} 
            className={
              testAI.data?.overall?.status === 'success' ? "bg-green-50 text-green-700 border-green-200" : 
              testAI.data?.overall?.status === 'partial' ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
              "bg-blue-50 text-blue-700 border-blue-200"
            }
          >
            AI: {testAI.isLoading ? 'Testing...' : testAI.data?.overall?.status || 'Demo'}
          </Badge>
          <Badge 
            variant={testElevenLabs.data?.status === 'success' ? "default" : "secondary"} 
            className={testElevenLabs.data?.status === 'success' ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200"}
          >
            Audio: {testElevenLabs.isLoading ? 'Testing...' : testElevenLabs.data?.status || 'Demo'}
          </Badge>
          <LanguageSwitcher variant="compact" />
          <UserMenu />
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-full lg:w-80 p-4 overflow-y-auto border-r bg-white/50">
          <div className="space-y-4">
            {/* Search */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder={t('explore.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm">
                <Search className="w-4 h-4" />
              </Button>
            </form>

            {/* Filters */}
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-sm">Filters</h3>
              <div className="space-y-2">
                <Select value={filters.country} onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Countries</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="Japan">Japan</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Indonesia">Indonesia</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filters.costLevel} onValueChange={(value: any) => setFilters(prev => ({ ...prev, costLevel: value }))}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Budgets</SelectItem>
                    <SelectItem value="budget">Budget-friendly</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="expensive">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cities List */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Cities ({cities.length})</h3>
              {cities.map((city) => (
                <motion.div
                  key={city.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedCity?.id === city.id
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleCitySelect(city)}
                  >
                    <CardContent className="p-4">
                      <div className="flex space-x-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={city.image}
                            alt={city.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold truncate">{city.name}</h3>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{city.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{city.region}, {city.country}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              {city.culture}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                city.costLevel === 'budget' ? 'border-green-500 text-green-700' :
                                city.costLevel === 'moderate' ? 'border-yellow-500 text-yellow-700' :
                                'border-red-500 text-red-700'
                              }`}
                            >
                              {city.costLevel}
                            </Badge>
                          </div>
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
            {(testAI.data?.overall?.status !== 'success' || testElevenLabs.data?.status === 'demo') && (
              <Alert className="border-blue-200 bg-blue-50">
                <Volume2 className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    {testAI.data?.overall?.status === 'demo' && (
                      <div>AI services in demo mode - add Gemini/Groq API keys for enhanced cultural insights</div>
                    )}
                    {testElevenLabs.data?.status === 'demo' && (
                      <div>Audio pronunciation is in demo mode - add ElevenLabs API key for real voice synthesis</div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {selectedCity && (
              <>
                {/* City Header */}
                <div className="relative">
                  <div className="h-64 rounded-xl overflow-hidden">
                    <img
                      src={selectedCity.image}
                      alt={selectedCity.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h1 className="text-3xl font-bold mb-2">{selectedCity.name}</h1>
                      <p className="text-lg opacity-90">{selectedCity.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{selectedCity.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedCity.region}, {selectedCity.country}</span>
                        </div>
                        <Badge className={`${
                          selectedCity.costLevel === 'budget' ? 'bg-green-500' :
                          selectedCity.costLevel === 'moderate' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}>
                          {selectedCity.costLevel}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">{t('explore.tabs.overview')}</TabsTrigger>
                    <TabsTrigger value="customs">{t('explore.tabs.customs')}</TabsTrigger>
                    <TabsTrigger value="phrases">{t('explore.tabs.phrases')}</TabsTrigger>
                    <TabsTrigger value="recommendations">{t('explore.tabs.recommendations')}</TabsTrigger>
                    <TabsTrigger value="trip-planner">Trip Plans</TabsTrigger>
                    <TabsTrigger value="map">{t('explore.tabs.map')}</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Globe className="w-5 h-5 mr-2" />
                          {t('explore.culturalOverview')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-gray-600 mb-4">{selectedCity.description}</p>
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold mb-2">Quick Facts</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>Population: {selectedCity.population.toLocaleString()}</div>
                                  <div>Languages: {selectedCity.language.join(', ')}</div>
                                  <div>Currency: {selectedCity.currency}</div>
                                  <div>Timezone: {selectedCity.timezone}</div>
                                  <div>Average Stay: {selectedCity.averageStay} days</div>
                                  <div>Safety: {selectedCity.safetyRating}/10</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Best Time to Visit</h4>
                            <div className="flex flex-wrap gap-1 mb-4">
                              {selectedCity.bestTimeToVisit.map((month, index) => (
                                <Badge key={index} variant="outline">
                                  {month}
                                </Badge>
                              ))}
                            </div>
                            <h4 className="font-semibold mb-2">Main Attractions</h4>
                            <div className="space-y-1">
                              {selectedCity.mainAttractions.map((attraction, index) => (
                                <div key={index} className="text-sm text-gray-600">• {attraction}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Trip Planner Tab */}
                  <TabsContent value="trip-planner" className="space-y-4">
                    <TripPlanner 
                      cityId={selectedCity.id}
                      onPlanSelect={(plan) => console.log('Selected plan:', plan)}
                    />
                  </TabsContent>

                  {/* Existing tabs with enhanced content... */}
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

                  {/* Enhanced Map Tab */}
                  <TabsContent value="map" className="space-y-4">
                    <DynamicCityMap
                      center={[selectedCity.latitude, selectedCity.longitude]}
                      zoom={12}
                      onCitySelect={handleCitySelect}
                      selectedCityId={selectedCity.id}
                      showSearch={true}
                      showNearby={true}
                      filters={{ country: selectedCity.country }}
                    />
                  </TabsContent>

                  {/* Other tabs... */}
                </Tabs>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}