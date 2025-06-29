'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Globe, Star, ArrowLeft, AlertCircle, Volume2, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { getCitiesByFilter, getCityById, type CityData } from '@/lib/cityDatabase';
import { dynamicCityService, type WikipediaData } from '@/lib/dynamicCityService';
import AudioPlayer from '@/components/AudioPlayer';
import TripPlanner from '@/components/TripPlanner';
import DynamicCityMap from '@/components/DynamicCityMap';
import RouteMapper from '@/components/RouteMapper';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UserMenu from '@/components/UserMenu';
import { useTranslation } from '@/hooks/useTranslation';

export default function ExplorePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [culturalInsights, setCulturalInsights] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<CityData[]>([]);
  const [isGeneratingCity, setIsGeneratingCity] = useState(false);
  const [newCityError, setNewCityError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    continent: '',
    population: '',
    climate: ''
  });
  const searchParams = useSearchParams();

  const getCulturalInsights = trpc.getCulturalInsights.useMutation();
  const testElevenLabs = trpc.audio.testElevenLabs.useQuery(undefined, {
    staleTime: Infinity
  });
  const testAI = trpc.testAI.useQuery(undefined, {
    staleTime: Infinity
  });

  // Load initial data and handle search params
  useEffect(() => {
    loadCities();
    
    // Handle city selection from URL params
    const cityId = searchParams?.get('city');
    if (cityId) {
      const city = getCityById(parseInt(cityId));
      if (city) {
        handleCitySelect(city);
      }
    }
  }, [searchParams]);

  const loadCities = () => {
    const filteredCities = getCitiesByFilter({
      continent: filters.continent,
      population: filters.population,
      climate: filters.climate,
      limit: 20
    });
    setCities(filteredCities);
    
    // Auto-select first city if none selected
    if (!selectedCity && filteredCities.length > 0) {
      handleCitySelect(filteredCities[0]);
    } 
  };

  const handleSearch = (query = searchQuery) => {
    if (!query.trim()) {
      loadCities();
      return;
    }

    // First, search in existing cities
    const searchResults = getCitiesByFilter({
      search: query,
      limit: 20
    });

    if (searchResults.length > 0) {
      setCities(searchResults);
      setNewCityError(null);
    } else {
      // If no results found, offer to generate new city
      setCities([]);
      setNewCityError(`No cities found matching "${query}". Would you like us to generate information for this city?`);
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
        });
        
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
    } catch (error) {
      console.error('Error generating city:', error);
      setNewCityError(`Error generating data for "${cityName}". Please try a different city name.`);
      const defaultCities = getCitiesByFilter({ limit: 8 });
      setCities(defaultCities);
      setIsGeneratingCity(false);
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
      setError('Failed to load cultural insights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToExplore = () => {
    setSelectedCity(null);
    setCulturalInsights(null);
    setError(null);
    router.push('/explore');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {selectedCity && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToExplore}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Explore</span>
              </Button>
            )}
            
            <div className="flex items-center space-x-3">
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
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </div>

        {!selectedCity ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Search and Filters */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="w-5 h-5 mr-2" />
                    {t('explore.search')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder={t('explore.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={() => handleSearch()}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>

                  {newCityError && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-yellow-800">{newCityError}</p>
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => handleGenerateNewCity(searchQuery)}
                            disabled={isGeneratingCity}
                          >
                            {isGeneratingCity ? 'Generating...' : 'Generate City Info'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cities List */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>{t('explore.cities')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cities.map((city) => (
                      <motion.div
                        key={city.id || `city-${city.name}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleCitySelect(city)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{city.name}</h3>
                            <p className="text-sm text-gray-500">{city.country}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {city.continent}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                Pop: {city.population?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8 text-center">
                  <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">{t('explore.selectCity')}</h2>
                  <p className="text-gray-500">{t('explore.selectCityDescription')}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* City Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{selectedCity.name}</h1>
                      <p className="text-gray-600">{selectedCity.country}, {selectedCity.continent}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="outline">
                          Population: {selectedCity.population?.toLocaleString()}
                        </Badge>
                        <Badge variant="outline">
                          {selectedCity.climate}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {culturalInsights?.audioUrl && (
                    <AudioPlayer 
                      audioUrl={culturalInsights.audioUrl}
                      title={`Cultural insights for ${selectedCity.name}`}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trip-planner">Trip Planner</TabsTrigger>
                <TabsTrigger value="map">Interactive Map</TabsTrigger>
                <TabsTrigger value="route-mapper">Route Mapper</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Cultural Insights */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Star className="w-5 h-5 mr-2" />
                        Cultural Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        </div>
                      ) : culturalInsights ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Overview</h4>
                            <p className="text-sm text-gray-600">{culturalInsights.overview}</p>
                          </div>
                          
                          {culturalInsights.traditions && (
                            <div>
                              <h4 className="font-medium mb-2">Local Traditions</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {culturalInsights.traditions.map((tradition: string, index: number) => (
                                  <li key={index} className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    {tradition}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {culturalInsights.cuisine && (
                            <div>
                              <h4 className="font-medium mb-2">Local Cuisine</h4>
                              <p className="text-sm text-gray-600">{culturalInsights.cuisine}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">No cultural insights available.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Facts */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Facts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Population</span>
                          <span className="font-medium">{selectedCity.population?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Climate</span>
                          <span className="font-medium">{selectedCity.climate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Continent</span>
                          <span className="font-medium">{selectedCity.continent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Coordinates</span>
                          <span className="font-medium text-sm">
                            {selectedCity.latitude.toFixed(4)}, {selectedCity.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Trip Planner Tab */}
              <TabsContent value="trip-planner" className="space-y-4">
                <TripPlanner 
                  cityId={selectedCity.id}
                  onPlanSelect={() => {}}
                />
              </TabsContent>

              {/* Interactive Map Tab */}
              <TabsContent value="map" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-7">
                  <Card className="lg:col-span-5">
                    <CardHeader className="pb-2"> 
                      <CardTitle>{selectedCity.name} Interactive Map</CardTitle>
                      <CardDescription>Explore cultural points of interest and plan your routes</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="h-[500px] rounded-lg overflow-hidden">
                        <DynamicCityMap 
                          city={selectedCity}
                          culturalInsights={culturalInsights}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full">
                        Plan a Route
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Points of Interest</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {culturalInsights?.pointsOfInterest ? (
                        <div className="space-y-3">
                          {culturalInsights.pointsOfInterest.map((poi: any, index: number) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <h4 className="font-medium text-sm">{poi.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{poi.description}</p>
                              {poi.category && (
                                <Badge variant="secondary" className="mt-2 text-xs">
                                  {poi.category}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Loading points of interest...</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Route Mapper Tab */}
              <TabsContent value="route-mapper" className="space-y-4">
                <RouteMapper 
                  city={selectedCity}
                  culturalInsights={culturalInsights}
                />
              </TabsContent>
            </Tabs>

            {/* Laws Tab (when accessed via laws link) */}
            {searchParams?.get('tab') === 'laws' && (
              <Card>
                <CardHeader> 
                  <CardTitle className="flex items-center">
                    <Scale className="h-5 w-5 mr-2" />
                    Travel Laws Assistant
                  </CardTitle>
                  <CardDescription>
                    Get information about local laws and regulations for {selectedCity.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Travel laws information for {selectedCity.name} will be displayed here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Scale icon component
function Scale({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  );
}