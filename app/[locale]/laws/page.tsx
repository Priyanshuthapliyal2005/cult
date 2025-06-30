'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Scale, Shield, Users, CheckCircle, Globe, BarChart3, AlertTriangle, Book, Search, AlertCircle, FileText, Filter, Info, MapPin, Clock, History, Copy, Bookmark, BookmarkCheck, X, ChevronRight, ChevronDown, ThumbsUp, ThumbsDown, ExternalLink, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useTranslations, useLocale } from 'next-intl';
import { cityDatabase, type CityData } from '@/lib/cityDatabase';
import { trpc } from '@/lib/trpc';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchHistoryItem {
  query: string;
  location: string;
  timestamp: Date;
}

interface BookmarkedResponse {
  id: string;
  question: string;
  location: string;
  response: string;
  timestamp: Date;
}

interface SearchSuggestion {
  text: string;
  type: 'history' | 'popular' | 'autocomplete';
}

interface DataSource {
  name: string;
  url?: string;
  reliability: number;
  lastUpdated?: Date;
}

export default function TravelLawsPage() {
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [legalQuestion, setLegalQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('local');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isAsking, setIsAsking] = useState(false);
  const [legalResponse, setLegalResponse] = useState<string>('');
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [bookmarkedResponses, setBookmarkedResponses] = useState<BookmarkedResponse[]>([]);
  const [resultSources, setResultSources] = useState<DataSource[]>([]);
  const [activeLegalFilters, setActiveLegalFilters] = useState<string[]>([]);
  const [isWikipediaLoading, setIsWikipediaLoading] = useState(false);
  const searchInputRef = useRef<HTMLTextAreaElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  // Disable landing-page-only intro sections on /laws
  const showIntro = false;
  
  const askLegalQuestion = trpc.sendMessage.useMutation();
  const knowledgeBaseSearch = trpc.knowledgeBase.search.useMutation();

  useEffect(() => {
    // Load search history from localStorage
    const savedHistory = localStorage.getItem('legalSearchHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setSearchHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (err) {
        console.error('Error parsing search history:', err);
      }
    }
    
    // Load bookmarks from localStorage
    const savedBookmarks = localStorage.getItem('legalBookmarks');
    if (savedBookmarks) {
      try {
        const parsed = JSON.parse(savedBookmarks);
        setBookmarkedResponses(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (err) {
        console.error('Error parsing bookmarks:', err);
      }
    }
  }, []);

  useEffect(() => {
    // Generate search suggestions based on input
    if (legalQuestion.trim().length > 2) {
      const suggestions: SearchSuggestion[] = [];
      
      // Add matching history items
      const historyMatches = searchHistory
        .filter(item => item.query.toLowerCase().includes(legalQuestion.toLowerCase()))
        .slice(0, 3)
        .map(item => ({
          text: item.query,
          type: 'history' as const
        }));
      suggestions.push(...historyMatches);
      
      // Add matching common questions
      const questionMatches = commonQuestions
        .filter(q => q.toLowerCase().includes(legalQuestion.toLowerCase()))
        .slice(0, 3)
        .map(q => ({
          text: q,
          type: 'popular' as const
        }));
      suggestions.push(...questionMatches);
      
      // Add autocomplete suggestions
      if (legalQuestion.toLowerCase().includes('alcohol')) {
        suggestions.push({ text: `${legalQuestion} regulations in ${locationQuery || 'this area'}`, type: 'autocomplete' });
      } else if (legalQuestion.toLowerCase().includes('drive')) {
        suggestions.push({ text: `${legalQuestion} licensing requirements`, type: 'autocomplete' });
      } else if (legalQuestion.toLowerCase().includes('photo')) {
        suggestions.push({ text: `${legalQuestion} restrictions at religious sites`, type: 'autocomplete' });
      }
      
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [legalQuestion, locationQuery, searchHistory]);

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  // Statistics
  const totalCities = cityDatabase.length;
  const totalCountries = new Set(cityDatabase.map(city => city.country)).size;
  const citiesWithLaws = cityDatabase.filter(city => city.travelLaws).length;

  const handleLocationSearch = async (locationInput: string = locationQuery) => {
    if (!locationInput) return;
    
    setIsWikipediaLoading(true);

    const query = locationInput.trim();
    if (!query) return;

    const foundCity = cityDatabase.find(city =>
      city.name.toLowerCase().includes(query.toLowerCase()) ||
      city.country.toLowerCase().includes(query.toLowerCase()) ||
      city.region.toLowerCase().includes(query.toLowerCase())
    );

    if (foundCity) {
      setSelectedCity(foundCity);
      return;
    }

    // Fallback: fetch summary from Wikipedia REST API
    try {
      const resp = await fetch(`https://${selectedLanguage}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
      if (!resp.ok) return;
      const data = await resp.json();
      if (data && !data.type?.includes('disambiguation')) {
        const wikiCity: CityData = {
          id: data.title.toLowerCase().replace(/\s+/g, '-'),
          name: data.title,
          country: data.description || '',
          region: '',
          latitude: 0,
          longitude: 0,
          population: 0,
          timezone: '',
          language: [],
          currency: '',
          culture: '',
          image: '',
          description: data.extract || '',
          wikipediaUrl: data.content_urls?.desktop?.page ?? '',
          highlights: [],
          rating: 0,
          costLevel: 'budget',
          bestTimeToVisit: [],
          averageStay: 0,
          mainAttractions: [],
          localCuisine: [],
          transportOptions: [],
          safetyRating: 0,
          touristFriendly: 0,
          travelLaws: undefined,
        };
        setSelectedCity(wikiCity);
        
        // Set mock sources
        setResultSources([
          {
            name: 'Wikipedia',
            url: data.content_urls?.desktop?.page || '',
            reliability: 0.75,
            lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
          },
          {
            name: 'OpenStreetMap',
            reliability: 0.85
          },
          {
            name: 'Local Government Database',
            reliability: 0.92,
            lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 1 month ago
          }
        ]);
      }
    } catch (err) {
      console.error('Wikipedia fetch error', err);
    } finally {
      setIsWikipediaLoading(false);
    }
  };

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLocationSearch();
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setLegalQuestion(suggestion.text);
    setShowSuggestions(false);
    
    // Focus back on the search input
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const addToSearchHistory = (query: string, location: string) => {
    const newHistoryItem: SearchHistoryItem = {
      query,
      location,
      timestamp: new Date()
    };
    
    // Add to state and limit to 20 items
    const updatedHistory = [newHistoryItem, ...searchHistory].slice(0, 20);
    setSearchHistory(updatedHistory);
    
    // Save to localStorage
    localStorage.setItem('legalSearchHistory', JSON.stringify(updatedHistory));
  };

  const toggleBookmark = () => {
    if (!legalResponse || !legalQuestion) return;
    
    const bookmarkId = `${legalQuestion}-${selectedCity?.name || locationQuery}`;
    const isAlreadyBookmarked = bookmarkedResponses.some(b => b.id === bookmarkId);
    
    if (isAlreadyBookmarked) {
      // Remove bookmark
      const updatedBookmarks = bookmarkedResponses.filter(b => b.id !== bookmarkId);
      setBookmarkedResponses(updatedBookmarks);
      localStorage.setItem('legalBookmarks', JSON.stringify(updatedBookmarks));
    } else {
      // Add bookmark
      const newBookmark: BookmarkedResponse = {
        id: bookmarkId,
        question: legalQuestion,
        location: selectedCity?.name || locationQuery,
        response: legalResponse,
        timestamp: new Date()
      };
      
      const updatedBookmarks = [newBookmark, ...bookmarkedResponses];
      setBookmarkedResponses(updatedBookmarks);
      localStorage.setItem('legalBookmarks', JSON.stringify(updatedBookmarks));
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('legalSearchHistory');
  };

  const removeHistoryItem = (index: number) => {
    const updatedHistory = [...searchHistory];
    updatedHistory.splice(index, 1);
    setSearchHistory(updatedHistory);
    localStorage.setItem('legalSearchHistory', JSON.stringify(updatedHistory));
  };

  const removeBookmark = (id: string) => {
    const updatedBookmarks = bookmarkedResponses.filter(b => b.id !== id);
    setBookmarkedResponses(updatedBookmarks);
    localStorage.setItem('legalBookmarks', JSON.stringify(updatedBookmarks));
  };

  const handleLegalQuestion = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!legalQuestion.trim() || !selectedCity) return;
    
    setIsAsking(true);
    setFeedbackGiven(false);
    
    // Add to search history
    addToSearchHistory(legalQuestion, selectedCity.name);
    
    // Set mock sources first for immediate feedback
    setResultSources([
      {
        name: 'AI Analysis',
        reliability: 0.85,
        lastUpdated: new Date()
      },
      {
        name: 'Legal Database',
        url: 'https://example.com/legal-database',
        reliability: 0.92,
        lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        name: 'Travel Advisories',
        url: 'https://example.com/travel-advisories',
        reliability: 0.88,
        lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
      }
    ]);
    
    try {
      // Try to use the knowledge base first
      try {
        const response = await knowledgeBaseSearch.mutateAsync({
          query: `${legalQuestion} in ${selectedCity.name}, ${selectedCity.country}`,
          context: {
            legalConcerns: ["behavior", "alcohol", "dress-codes", "photography"]
          }
        });
        
        if (response.data?.destination) {
          // Found relevant information
          let answer = `Based on our knowledge base for ${selectedCity.name}:\n\n`;
          
          // Extract legal alerts
          if (response.data.legalAlerts && response.data.legalAlerts.length > 0) {
            const alert = response.data.legalAlerts[0];
            answer += `${alert.title}\n${alert.description}\n\n`;
            
            if (alert.consequences.length > 0) {
              answer += `Consequences: ${alert.consequences.join(", ")}\n\n`;
            }
            
            if (alert.recommendations.length > 0) {
              answer += `Recommendations:\n- ${alert.recommendations.join("\n- ")}`;
            }
          } else {
            // Fallback to general legal information
            answer += `For your question about ${legalQuestion}:\n\n`;
            
            const laws = selectedCity.travelLaws?.penalties?.commonViolations || [];
            if (laws.length > 0) {
              answer += "Important legal considerations:\n\n";
              laws.forEach(law => {
                answer += `• ${law.violation}: ${law.penalty} (${law.severity} severity)\n`;
              });
            }
            
            answer += "\nIt's always best to consult official sources or a legal professional for specific legal advice.";
          }
          
          setLegalResponse(answer);
        } else {
          throw new Error("No relevant information found in knowledge base");
        }
      } catch (kbError) {
        // Fallback to general AI response
        const response = await askLegalQuestion.mutateAsync({
          message: `Legal Question about ${selectedCity.name}: ${legalQuestion}`,
          location: selectedCity.name,
          latitude: selectedCity.latitude,
          longitude: selectedCity.longitude
        });
        
        setLegalResponse(response.response);
      }
    } catch (error) {
      console.error('Error processing legal question:', error);
      setLegalResponse('I apologize, but I encountered an error processing your legal question. Please try again with a more specific question, or contact local authorities for official legal advice.');
    } finally {
      setIsAsking(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'moderate': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'severe': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const legalCategories = [
    { value: 'all', label: 'All Categories', icon: <Book className="w-4 h-4 mr-2" /> },
    { value: 'immigration', label: 'Immigration & Visas', icon: <FileText className="w-4 h-4 mr-2" /> },
    { value: 'transportation', label: 'Transportation', icon: <Globe className="w-4 h-4 mr-2" /> },
    { value: 'behavior', label: 'Public Behavior', icon: <Users className="w-4 h-4 mr-2" /> },
    { value: 'photography', label: 'Photography & Privacy', icon: <AlertCircle className="w-4 h-4 mr-2" /> },
    { value: 'penalties', label: 'Penalties & Enforcement', icon: <AlertTriangle className="w-4 h-4 mr-2" /> }
  ];

  const commonQuestions = [
    "Can I drink alcohol in this city?",
    "Are there photography restrictions?",
    "Do I need special permits to drive here?",
    "What should I declare at customs?",
    "Are there any dress code requirements?",
    "What are the noise regulations?",
    "Can I use ride-sharing services?",
    "What happens if I'm arrested as a tourist?",
    "Is recreational marijuana legal here?",
    "What are the public smoking laws?",
    "Can I drink in public places?",
    "Are there curfew laws I should know about?",
    "Do I need a visa to visit for tourism?"
  ];
  
  // Filters for legal categories
  const legalFilters = [
    { id: 'immigration', label: 'Immigration & Visas' },
    { id: 'transportation', label: 'Transportation' },
    { id: 'behavior', label: 'Public Behavior' },
    { id: 'photography', label: 'Photography & Privacy' },
    { id: 'business', label: 'Business Rules' },
    { id: 'penalties', label: 'Penalties & Enforcement' },
    { id: 'religious', label: 'Religious Sites' },
    { id: 'alcohol', label: 'Alcohol & Substances' },
    { id: 'customs', label: 'Customs & Declarations' }
  ];
  
  const toggleLegalFilter = (filterId: string) => {
    if (activeLegalFilters.includes(filterId)) {
      setActiveLegalFilters(activeLegalFilters.filter(f => f !== filterId));
    } else {
      setActiveLegalFilters([...activeLegalFilters, filterId]);
    }
  };

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

  const isBookmarked = () => {
    if (!legalResponse || !legalQuestion) return false;
    const bookmarkId = `${legalQuestion}-${selectedCity?.name || locationQuery}`;
    return bookmarkedResponses.some(b => b.id === bookmarkId);
  };

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
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {showIntro && (
            <>
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

              {/* End landing intro sections */}
            </>
          )}

          {/* Main Assistant Component */}
          <div className="space-y-6">
            {/* City Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Select Your Destination
                </CardTitle>
                <CardDescription>
                  Choose a location to get specific legal information and regulations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCitySearch} className="space-y-3">
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        ref={locationInputRef}
                        placeholder="Enter city, region or country..."
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        className="pl-10"
                      />
                      
                      {/* Location autocomplete results would appear here */}
                      {locationQuery.length > 2 && (
                        <div className="absolute w-full z-10 bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                          {isWikipediaLoading ? (
                            <div className="p-2 text-sm text-gray-500 flex items-center justify-center">
                              <div className="animate-spin mr-2 h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                              Searching locations...
                            </div>
                          ) : (
                            <>
                              <div 
                                className="p-2 hover:bg-gray-100 cursor-pointer flex items-center text-sm"
                                onClick={() => {
                                  setLocationQuery('Dehradun, India');
                                  handleLocationSearch('Dehradun, India');
                                }}
                              >
                                <MapPin className="h-3 w-3 mr-2 text-gray-400" />
                                Dehradun, India
                              </div>
                              <div 
                                className="p-2 hover:bg-gray-100 cursor-pointer flex items-center text-sm"
                                onClick={() => {
                                  setLocationQuery('Dehradun, Uttarakhand, India');
                                  handleLocationSearch('Dehradun, Uttarakhand, India');
                                }}
                              >
                                <MapPin className="h-3 w-3 mr-2 text-gray-400" />
                                Dehradun, Uttarakhand, India
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <Button type="submit" disabled={isWikipediaLoading}>
                      {isWikipediaLoading ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Search
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Jurisdiction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Local Laws</SelectItem>
                          <SelectItem value="regional">Regional Laws</SelectItem>
                          <SelectItem value="national">National Laws</SelectItem>
                          <SelectItem value="international">International Laws</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => {
                            // Show a drawer with saved locations
                          }}>
                            <Bookmark className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Saved Locations</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </form>
                
                {selectedCity && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={selectedCity.image} 
                        alt={selectedCity.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{selectedCity.name}</h3>
                        <p className="text-gray-600">{selectedCity.region}, {selectedCity.country}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">Safety: {selectedCity.safetyRating}/10</Badge>
                          <Badge variant="outline">Tourist Friendly: {selectedCity.touristFriendly}/10</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legal Question Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Scale className="w-6 h-6 mr-2 text-blue-600" />
                  Ask Your Legal Question 
                </CardTitle>
                <CardDescription>
                  Get instant answers about local laws, regulations and legal requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Active filters display */}
                {activeLegalFilters.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {activeLegalFilters.map(filter => {
                      const filterData = legalFilters.find(f => f.id === filter);
                      return (
                        <Badge 
                          key={filter} 
                          variant="outline" 
                          className="py-1 flex items-center gap-1 bg-blue-50"
                        >
                          <div className="flex items-center">
                            {filterData?.label}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-5 w-5 p-0 ml-1 hover:bg-blue-100 rounded-full"
                              onClick={() => toggleLegalFilter(filter)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </Badge>
                      );
                    })}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-6 hover:bg-blue-50"
                      onClick={() => setActiveLegalFilters([])}
                    >
                      Clear all
                    </Button>
                  </div>
                )}
                
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium">Search Filters</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                          <Filter className="h-3.5 w-3.5" />
                          <span className="text-xs">Filters</span>
                          {activeLegalFilters.length > 0 && (
                            <Badge className="ml-1 h-5 px-1.5">{activeLegalFilters.length}</Badge>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-3" align="end">
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm">Filter by Category</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {legalFilters.map(filter => (
                              <div key={filter.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`filter-${filter.id}`}
                                  checked={activeLegalFilters.includes(filter.id)}
                                  onChange={() => toggleLegalFilter(filter.id)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor={`filter-${filter.id}`} className="text-sm">{filter.label}</label>
                              </div>
                            ))}
                          </div>
                          <div className="border-t pt-3 flex justify-between">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setActiveLegalFilters([])}
                            >
                              Clear All
                            </Button>
                            <Button size="sm">Apply Filters</Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <form onSubmit={handleLegalQuestion} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Textarea
                      ref={searchInputRef}
                      placeholder="Ask about any local law, regulation, or legal requirement..."
                      value={legalQuestion}
                      onChange={(e) => setLegalQuestion(e.target.value)}
                      rows={3}
                      className="w-full pl-11 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleLegalQuestion();
                        }
                      }}
                    />
                    
                    {/* Search suggestions dropdown */}
                    {showSuggestions && (
                      <div className="absolute w-full z-10 bg-white border rounded-md shadow-lg mt-1">
                        {searchSuggestions.map((suggestion, index) => (
                          <div 
                            key={index} 
                            className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 flex items-center"
                            onClick={() => handleSelectSuggestion(suggestion)}
                          >
                            {suggestion.type === 'history' && <History className="h-3 w-3 mr-2 text-gray-500" />}
                            {suggestion.type === 'popular' && <AlertCircle className="h-3 w-3 mr-2 text-blue-500" />}
                            {suggestion.type === 'autocomplete' && <Search className="h-3 w-3 mr-2 text-gray-500" />}
                            <span className="text-sm">{suggestion.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    type="submit"
                    disabled={!legalQuestion.trim() || !selectedCity || isAsking}
                    className="w-full"
                  >
                    {isAsking ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                        Researching Legal Information...
                      </>
                    ) : (
                      'Get Legal Guidance'
                    )}
                  </Button>
                </form>

                {/* Quick Questions */}
                <div>
                  <p className="text-sm font-medium mb-2">Common Questions:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                    {commonQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="justify-start h-auto py-2 px-3 text-left hover:bg-blue-50 text-xs"
                        onClick={() => setLegalQuestion(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Response */}
                {legalResponse && (
                  <div className="mt-6">
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-blue-800 text-lg">
                          <Scale className="w-5 h-5 mr-2" />
                          Legal Guidance for {selectedCity?.name || locationQuery}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* AI Response */}
                        <div className="space-y-4">
                          <div className="whitespace-pre-wrap text-gray-700">{legalResponse}</div>
                          
                          {/* Sources */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium flex items-center">
                              <FileText className="w-3.5 h-3.5 mr-1.5" />
                              Sources
                            </h4>
                            <div className="space-y-1.5">
                              {resultSources.map((source, index) => (
                                <div key={index} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center">
                                    <Badge 
                                      variant="outline" 
                                      className={`mr-2 ${
                                        source.reliability > 0.9 ? 'bg-green-50 text-green-700 border-green-200' : 
                                        source.reliability > 0.7 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                                      }`}
                                    >
                                      {Math.round(source.reliability * 100)}%
                                    </Badge>
                                    {source.url ? (
                                      <a 
                                        href={source.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline flex items-center"
                                      >
                                        {source.name}
                                        <ExternalLink className="w-3 h-3 ml-1" />
                                      </a>
                                    ) : (
                                      <span>{source.name}</span>
                                    )}
                                  </div>
                                  {source.lastUpdated && (
                                    <span className="text-gray-500 flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {new Date(source.lastUpdated).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
