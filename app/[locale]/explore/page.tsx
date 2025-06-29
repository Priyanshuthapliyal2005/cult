'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Globe, Filter, Star, Clock, Users, ArrowLeft, AlertCircle, Volume2, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { getCitiesByFilter, getCityById, type CityData } from '@/lib/cityDatabase';
import { dynamicCityService } from '@/lib/dynamicCityService';
import AudioPlayer from '@/components/AudioPlayer';
import TripPlanner from '@/components/TripPlanner';
import DynamicCityMap from '@/components/DynamicCityMap';
import MapComponent from '@/components/MapComponent';
import RouteMapper from '@/components/RouteMapper';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UserMenu from '@/components/UserMenu';
import TravelLawsAssistant from '@/components/TravelLawsAssistant';
import Link from 'next/link';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [culturalInsights, setCulturalInsights] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<CityData[]>([]);
  const [isGeneratingCity, setIsGeneratingCity] = useState(false);
  const [newCityError, setNewCityError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    country: 'all',
    costLevel: 'all' as 'all' | 'budget' | 'moderate' | 'expensive',
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
    const query = searchParams?.get('q');
    if (query) {
      setSearchQuery(query);
      
      // Use a timeout to avoid immediate search during initial load
      setTimeout(() => {
        handleSearch(query);
      }, 100);
    }
    
    // Check for tab parameter
    const tab = searchParams?.get('tab');
    if (tab) {
      // Will be used later for tab selection
    }
  }, [searchParams, filters]);

  const loadCities = () => {
    const filteredCities = getCitiesByFilter({
      country: filters.country === 'all' ? undefined : filters.country,
      costLevel: filters.costLevel === 'all' ? undefined : filters.costLevel,
      minRating: filters.minRating || undefined,
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
    
    setIsGeneratingCity(false);
    setNewCityError(null);
    
    setIsGeneratingCity(false);
    setNewCityError(null);
    
    const filteredCities = getCitiesByFilter({
      country: filters.country === 'all' ? undefined : filters.country,
      costLevel: filters.costLevel === 'all' ? undefined : filters.costLevel,
      minRating: filters.minRating || undefined,
      searchTerm: query
    });

    if (filteredCities.length === 0) {
      // City not found in local database, try to generate it using AI
      handleGenerateNewCity(query);
    } else {
      setCities(filteredCities);
    } else {
      setCities(filteredCities);
      handleCitySelect(filteredCities[0]);
    }
  };

  const handleGenerateNewCity = async (cityName: string) => {
    try {
      setIsGeneratingCity(true);
      setError(null);
      setError(null);
      
      console.log(`City "${cityName}" not found in local database. Generating using AI...`);
      
      // Use the dynamic city service to generate city data
      const generatedCity = await dynamicCityService.searchCity(cityName);
    setIsLoading(true);
    setNewCityError(null);
    setCulturalInsights(null);
    setNewCityError(null);
    setCulturalInsights(null);
    
    try {
      const insights = await getCulturalInsights.mutateAsync({
        location: city.name,
        latitude: city.latitude,
        longitude: city.longitude,
      if (generatedCity) {
        // Add the generated city to the cities list
        setCities([generatedCity]);
        handleCitySelect(generatedCity);
        
        // Show success message
        setError(`Successfully generated information for ${cityName}. This city has been added to our database.`);
      } else {
        setNewCityError(`Could not generate information for "${cityName}". Please try a different city name.`);
        // Load some default cities as fallback
        const defaultCities = getCitiesByFilter({ limit: 8 });
        setCities(defaultCities);
      }
    } catch (error) {
      console.error('Error fetching cultural insights:', error);
      setNewCityError(`Error generating data for "${cityName}". Please try a different city name.`);
      // Load some default cities as fallback
      const defaultCities = getCitiesByFilter({ limit: 8 });
      setCities(defaultCities);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };
  
  // Determine which tab to show based on searchParams
  const getInitialTab = () => {
    const tab = searchParams?.get('tab');
    if (tab === 'laws') return 'recommendations';
    if (tab === 'map') return 'map';
    return 'overview';
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
        {/* Sidebar - City Selection */}
        <div className="w-full lg:w-80 p-4 overflow-y-auto border-r bg-white/50 flex flex-col">
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
                    <SelectItem value="all">All Countries</SelectItem>
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
                    <SelectItem value="all">All Budgets</SelectItem>
                    <SelectItem value="budget">Budget-friendly</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="expensive">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading State */}
            {isGeneratingCity && (
              <Card className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
                <div className="mt-3 text-sm text-gray-600 text-center">
                  Generating new city data using AI...
                </div>
              </Card>
            )}
            
            {/* Error State */}
            {newCityError && !isGeneratingCity && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription>{newCityError}</AlertDescription>
              </Alert>
            )}
            {isGeneratingCity && (
              <Card className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
                <div className="mt-3 text-sm text-gray-600 text-center">
                  Generating new city data using AI...
                </div>
              </Card>
            )}
            
            {/* Error State */}
            {newCityError && !isGeneratingCity && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription>{newCityError}</AlertDescription>
              </Alert>
            )}
            
            {/* Cities List */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-sm">Cities ({cities.length})</h3>
                {cities.length > 0 && !isGeneratingCity && (
                  <Badge variant="outline" className="text-xs">
                    {cities.some(c => c.id.includes('-generated')) ? 'AI Enhanced' : 'Database'}
                  </Badge>
                )}
                {cities.length > 0 && !isGeneratingCity && (
                  <Badge variant="outline" className="text-xs">
                    {cities.some(c => c.id.includes('-generated')) ? 'AI Enhanced' : 'Database'}
                  </Badge>
                )}
              </div>
              
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
                            alt={`${city.name} image`}
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
                      {city.id.includes('-generated') && (
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">AI Generated</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Error Display */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
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
                      alt={`${selectedCity.name} skyline`}
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
                <Tabs defaultValue={getInitialTab()} className="w-full">
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
                        {city.id.includes('-generated') && (
                          <div className="mt-1">
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">AI Generated</Badge>
                          </div>
                        )}
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

                  {/* Essential Phrases Tab */}
                  <TabsContent value="phrases" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Essential Phrases</CardTitle>
                        <CardDescription>Learn key phrases for respectful communication</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                          </div>
                        ) : culturalInsights?.phrases?.essential_phrases ? (
                          <div className="space-y-4">
                            {culturalInsights.phrases.essential_phrases.map((phrase: any, index: number) => (
                              <div key={index} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold">{phrase.english}</h4>
                                    <p className="text-lg text-blue-600">{phrase.local}</p>
                                  </div>
                                  <AudioPlayer text={phrase.local} language={selectedCity.language[0]} />
                                </div>
                                <p className="text-sm text-gray-600">{phrase.pronunciation}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-gray-500">Loading essential phrases...</p>
                            {/* Fallback phrases for immediate display */}
                            <div className="space-y-3">
                              <div className="border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold">Hello</h4>
                                    <p className="text-lg text-blue-600">Basic greeting</p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600">Used for formal and informal greetings</p>
                              </div>
                              <div className="border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold">Thank you</h4>
                                    <p className="text-lg text-blue-600">Expression of gratitude</p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600">Essential for polite interactions</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Local Laws & Rules Tab */}
                  <TabsContent value="recommendations" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Local Laws & Cultural Rules</CardTitle>
                        <CardDescription>Important legal and cultural guidelines you must know</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                          </div>
                        ) : culturalInsights?.laws ? (
                          <div className="space-y-6">
                            {/* Legal Requirements */}
                            <div>
                              <h4 className="font-semibold text-red-700 mb-3 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Legal Requirements & Restrictions
                              </h4>
                              <div className="space-y-2">
                                {culturalInsights.laws.legal.map((law: string, index: number) => (
                                  <div key={index} className="bg-red-50 border border-red-200 rounded p-3">
                                    <p className="text-sm text-red-800">{law}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Cultural Rules */}
                            <div>
                              <h4 className="font-semibold text-orange-700 mb-3">Cultural Rules & Expectations</h4>
                              <div className="space-y-2">
                                {culturalInsights.laws.cultural.map((rule: string, index: number) => (
                                  <div key={index} className="bg-orange-50 border border-orange-200 rounded p-3">
                                    <p className="text-sm text-orange-800">{rule}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Local Guidelines */}
                            <div>
                              <h4 className="font-semibold text-blue-700 mb-3">Local Guidelines & Etiquette</h4>
                              <div className="space-y-2">
                                {culturalInsights.laws.guidelines.map((guideline: string, index: number) => (
                                  <div key={index} className="bg-blue-50 border border-blue-200 rounded p-3">
                                    <p className="text-sm text-blue-800">{guideline}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Penalties for Violations */}
                            {culturalInsights.laws.penalties && culturalInsights.laws.penalties.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-purple-700 mb-3 flex items-center">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Potential Penalties & Consequences
                                </h4>
                                <div className="space-y-2">
                                  {culturalInsights.laws.penalties.map((penalty: string, index: number) => (
                                    <div key={index} className="bg-purple-50 border border-purple-200 rounded p-3">
                                      <p className="text-sm text-purple-800">{penalty}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-gray-500">Loading local laws and cultural rules...</p>
                            {/* Fallback content with focus on local rules */}
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-red-700 mb-3 flex items-center">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Important Legal Considerations
                                </h4>
                                <div className="bg-red-50 border border-red-200 rounded p-3">
                                  <p className="text-sm text-red-800">Check local visa requirements and entry restrictions</p>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded p-3 mt-2">
                                  <p className="text-sm text-red-800">Respect photography restrictions at religious and government sites</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-orange-700 mb-3">Cultural Sensitivities</h4>
                                <div className="bg-orange-50 border border-orange-200 rounded p-3">
                                  <p className="text-sm text-orange-800">Dress modestly when visiting religious sites</p>
                                </div>
                                <div className="bg-orange-50 border border-orange-200 rounded p-3 mt-2">
                                  <p className="text-sm text-orange-800">Remove shoes before entering homes and certain establishments</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Enhanced Map Tab */}
                  <TabsContent value="map" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-7">
                      <Card className="lg:col-span-5">
                        <CardHeader className="pb-2">
                          <CardTitle>{selectedCity.name} Interactive Map</CardTitle>
                          <CardDescription>Explore cultural points of interest and plan your routes</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <DynamicCityMap
                            center={[selectedCity.latitude, selectedCity.longitude]}
                            zoom={12}
                            height="500px"
                            onCitySelect={handleCitySelect}
                            selectedCityId={selectedCity.id}
                            showSearch={true}
                            showNearby={true}
                            filters={{ country: selectedCity.country }}
                          />
                        </CardContent>
                      </Card>
                      
                      <Card className="lg:col-span-2">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Nearby Cities</CardTitle>
                        </CardHeader>
                        <CardContent className="max-h-[400px] overflow-y-auto">
                          <div className="space-y-3">
                            {getCitiesByFilter({
                              country: selectedCity.country,
                              limit: 5,
                              exclude: [selectedCity.id]
                            }).map((city) => (
                              <Button 
                                key={city.id}
                                variant="outline" 
                                className="w-full justify-start h-auto p-2"
                                onClick={() => handleCitySelect(city)}
                              >
                                <div className="flex items-center space-x-2 w-full">
                                  <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                                    <img 
                                      src={city.image} 
                                      alt={city.name} 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 text-left">
                                    <div className="font-medium text-sm">{city.name}</div>
                                    <div className="text-xs text-gray-500">{city.region}</div>
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              // Open the RouteMapper panel
                              const routeMapperSection = document.getElementById('route-mapper');
                              if (routeMapperSection) {
                                routeMapperSection.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                          >
                            Plan a Route
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                    
                    <div id="route-mapper">
                      <RouteMapper
                        center={[selectedCity.latitude, selectedCity.longitude]}
                        zoom={12}
                        height="600px"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
            
            {/* Laws Tab (when accessed via laws link) */}
            {searchParams?.get('tab') === 'laws' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Scale className="h-5 w-5 mr-2" />
                    Travel Laws Assistant
                  </CardTitle>
                  <CardDescription>Get reliable information about local laws and regulations</CardDescription>
                </CardHeader>
                <CardContent>
                  <TravelLawsAssistant
                    selectedCity={selectedCity}
                    onCityChange={handleCitySelect}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}