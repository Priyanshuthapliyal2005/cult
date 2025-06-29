import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Globe, Filter, Star, Clock, Users, ArrowLeft, AlertCircle, Volume2, ChevronRight, ChevronDown, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useTranslation } from 'react-i18next';
import { trpc } from '@/lib/trpc';
import { getCitiesByFilter, getCityById, type CityData } from '@/lib/cityDatabase';
import { dynamicCityService } from '@/lib/dynamicCityService';
import { useVoiceCommand } from '@/components/VoiceCommandProvider';
import AudioPlayer from '@/components/AudioPlayer';

export default function ExplorePage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState<CityData[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [culturalInsights, setCulturalInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingCity, setIsGeneratingCity] = useState(false);
  const [newCityError, setNewCityError] = useState<string | null>(null);
  const { isListening, startListening, stopListening, isVoiceEnabled, speak } = useVoiceCommand();
  const [filters, setFilters] = useState({
    country: 'all',
    costLevel: 'all' as 'all' | 'budget' | 'moderate' | 'expensive',
    minRating: 0
  });

  const getCulturalInsights = trpc.culturalInsights.getCulturalInsights.useMutation();

  useEffect(() => {
    // Load initial cities
    const initialCities = getCitiesByFilter({ limit: 12 });
    setCities(initialCities);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSearch = (query = searchQuery) => {
    if (!query.trim()) return;
    
    setSearchQuery(query);
    setIsGeneratingCity(false);
    
    // Announce search via voice if voice is enabled
    if (isVoiceEnabled) {
      speak(`Searching for ${query}`);
    }
    
    // Update URL to reflect search
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.pushState({}, '', url.toString());
    
    const filteredCities = getCitiesByFilter({
      country: filters.country === 'all' ? undefined : filters.country,
      costLevel: filters.costLevel === 'all' ? undefined : filters.costLevel,
      minRating: filters.minRating,
      searchQuery: query,
      limit: 20
    });

    if (filteredCities.length === 0) {
      // No cities found, offer to generate new city
      setIsGeneratingCity(true);
      setNewCityError(null);
      setCities([]);
    } else {
      setCities(filteredCities);
      setNewCityError(null);
    }
  };

  const handleGenerateNewCity = async (cityName: string) => {
    try {
      setIsGeneratingCity(true);
      setError(null);
      setNewCityError(null);
      
      if (isVoiceEnabled) {
        speak(`Generating information for ${cityName}`);
      }
      console.log(`City "${cityName}" not found in local database. Generating using AI...`);
      
      // Use the dynamic city service to generate city data
      const generatedCity = await dynamicCityService.searchCity(cityName);
      
      if (generatedCity) {
        // Add the generated city to the cities list
        setCities([generatedCity]);
        handleCitySelect(generatedCity);
        if (isVoiceEnabled) {
          speak(`Successfully generated information for ${cityName}`);
        }
        // Show success message
        setError(`Successfully generated information for ${cityName}. This city has been added to our database.`);
      } else {
        setNewCityError(`Could not generate information for "${cityName}". Please try a different city name.`);
        // Load some default cities as fallback
        const defaultCities = getCitiesByFilter({ limit: 8 });
        setCities(defaultCities);
      }
    } catch (error) {
      console.error('Error generating city:', error);
      setNewCityError(`Error generating data for "${cityName}". Please try a different city name.`);
      const defaultCities = getCitiesByFilter({ limit: 8 });
      setCities(defaultCities);
    } finally {
      setIsGeneratingCity(false);
    }
  };

  const handleCitySelect = async (city: CityData) => {
    setSelectedCity(city);
    setIsLoading(true);
    setNewCityError(null);
    setCulturalInsights(null);
    setError(null);
    
    if (isVoiceEnabled) {
      speak(`Loading information for ${city.name}, ${city.country}`);
    }
    try {
      const insights = await getCulturalInsights.mutateAsync({
        location: city.name,
        latitude: city.latitude,
        longitude: city.longitude,
      });
      setCulturalInsights(insights);
      if (isVoiceEnabled) {
        speak(`Information loaded for ${city.name}`);
      }
    } catch (error) {
      console.error('Error fetching cultural insights:', error);
      setError(error instanceof Error ? error.message : 'Failed to load cultural insights');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = () => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      const filteredCities = getCitiesByFilter({
        country: filters.country === 'all' ? undefined : filters.country,
        costLevel: filters.costLevel === 'all' ? undefined : filters.costLevel,
        minRating: filters.minRating,
        limit: 20
      });
      setCities(filteredCities);
    }
  };

  const getCostLevelColor = (level: string) => {
    switch (level) {
      case 'budget': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'expensive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedCity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => setSelectedCity(null)}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold text-gray-900">
                      {selectedCity.name}
                    </CardTitle>
                    <CardDescription className="text-lg flex items-center gap-2 mt-2">
                      <MapPin className="w-4 h-4" />
                      {selectedCity.country}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{selectedCity.rating}</span>
                    </div>
                    <Badge className={getCostLevelColor(selectedCity.costLevel)}>
                      {selectedCity.costLevel}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{selectedCity.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Best time: {selectedCity.bestTimeToVisit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Population: {selectedCity.population?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">Language: {selectedCity.language}</span>
                  </div>
                </div>

                {selectedCity.highlights && selectedCity.highlights.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Highlights</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCity.highlights.map((highlight, index) => (
                        <Badge key={index} variant="secondary">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {isLoading && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading cultural insights...</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {culturalInsights && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Cultural Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {culturalInsights.audioUrl && (
                      <AudioPlayer 
                        src={culturalInsights.audioUrl} 
                        title={`Cultural insights for ${selectedCity.name}`}
                      />
                    )}
                    
                    {culturalInsights.content && (
                      <div className="prose max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: culturalInsights.content }} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('explore.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('explore.subtitle')}
          </p>
        </motion.div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder={isVoiceEnabled ? "Type or say 'search for [city name]'" : t('explore.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm" aria-label="Search">
                <Search className="w-4 h-4" />
              </Button>
              {isVoiceEnabled && (
                <Button 
                  type="button"
                  variant={isListening ? "destructive" : "outline"} 
                  size="sm"
                  onClick={() => isListening ? stopListening() : startListening()}
                  aria-label={isListening ? "Stop listening" : "Start voice search"}
                  className={isListening ? "animate-pulse" : ""}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              )}
            </form>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <Select
                  value={filters.country}
                  onValueChange={(value) => {
                    setFilters(prev => ({ ...prev, country: value }));
                    setTimeout(handleFilterChange, 0);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    <SelectItem value="Japan">Japan</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Italy">Italy</SelectItem>
                    <SelectItem value="Spain">Spain</SelectItem>
                    <SelectItem value="Greece">Greece</SelectItem>
                    <SelectItem value="Thailand">Thailand</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="Morocco">Morocco</SelectItem>
                    <SelectItem value="Peru">Peru</SelectItem>
                    <SelectItem value="Turkey">Turkey</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cost Level</label>
                <Select
                  value={filters.costLevel}
                  onValueChange={(value: 'all' | 'budget' | 'moderate' | 'expensive') => {
                    setFilters(prev => ({ ...prev, costLevel: value }));
                    setTimeout(handleFilterChange, 0);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Budgets</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="expensive">Expensive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Minimum Rating: {filters.minRating}
                </label>
                <Slider
                  value={[filters.minRating]}
                  onValueChange={([value]) => {
                    setFilters(prev => ({ ...prev, minRating: value }));
                    setTimeout(handleFilterChange, 0);
                  }}
                  max={5}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-800">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {newCityError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span>{newCityError}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {isGeneratingCity && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">City not found in our database</h3>
                <p className="text-gray-600 mb-4">
                  Would you like us to generate information for "{searchQuery}" using AI?
                </p>
                <div className="flex gap-2 justify-center">
                  <Button 
                    onClick={() => handleGenerateNewCity(searchQuery)}
                    disabled={getCulturalInsights.isLoading}
                  >
                    {getCulturalInsights.isLoading ? 'Generating...' : 'Yes, Generate City Info'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsGeneratingCity(false);
                      const defaultCities = getCitiesByFilter({ limit: 12 });
                      setCities(defaultCities);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow h-full"
                onClick={() => handleCitySelect(city)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{city.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {city.country}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{city.rating}</span>
                      </div>
                      <Badge className={getCostLevelColor(city.costLevel)} variant="secondary">
                        {city.costLevel}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {city.description}
                  </p>
                  
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Best time: {city.bestTimeToVisit}</span>
                    </div>
                    {city.population && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>Population: {city.population.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {city.highlights && city.highlights.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {city.highlights.slice(0, 3).map((highlight, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {highlight}
                          </Badge>
                        ))}
                        {city.highlights.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{city.highlights.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {cities.length === 0 && !isGeneratingCity && (
          <Card>
            <CardContent className="p-12 text-center">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No cities found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or filters to find more destinations.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}