'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Scale, Shield, Users, CheckCircle, Globe, BarChart3, AlertTriangle, Book, Search, AlertCircle, FileText, Filter, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslations, useLocale } from 'next-intl';
import { cityDatabase, type CityData } from '@/lib/cityDatabase';
import { trpc } from '@/lib/trpc';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TravelLawsPage() {
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [legalQuestion, setLegalQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAsking, setIsAsking] = useState(false);
  const [legalResponse, setLegalResponse] = useState<string>('');
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  // Disable landing-page-only intro sections on /laws
  const showIntro = false;
  
  const askLegalQuestion = trpc.sendMessage.useMutation();
  const knowledgeBaseSearch = trpc.knowledgeBase.search.useMutation();

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  // Statistics
  const totalCities = cityDatabase.length;
  const totalCountries = new Set(cityDatabase.map(city => city.country)).size;
  const citiesWithLaws = cityDatabase.filter(city => city.travelLaws).length;

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const query = searchQuery.trim();
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
      const resp = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
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
      }
    } catch (err) {
      console.error('Wikipedia fetch error', err);
    }
  };

  const handleLegalQuestion = async () => {
    if (!legalQuestion.trim() || !selectedCity) return;
    
    setIsAsking(true);
    setFeedbackGiven(false);
    
    try {
      // Try to use the knowledge base first
      try {
        const response = await knowledgeBaseSearch.mutateAsync({
          query: `${legalQuestion} in ${selectedCity.name}, ${selectedCity.country}`,
          context: {
            interests: ["legal", "safety"],
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
    "What are the photography restrictions?",
    "Do I need special permits to drive here?",
    "What should I declare at customs?",
    "Are there any dress code requirements?",
    "What are the noise regulations?",
    "Can I use ride-sharing services?",
    "What happens if I'm arrested as a tourist?"
  ];

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
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Select Your Destination
                </CardTitle>
                <CardDescription>
                  Choose a city to get location-specific legal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCitySearch} className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search for any city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit">Search</Button>
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
                <CardTitle className="flex items-center">
                  <Scale className="w-5 h-5 mr-2" />
                  Ask Your Legal Question
                </CardTitle>
                <CardDescription>
                  Get instant answers about local laws and regulations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Select category" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {legalCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center">
                            {category.icon}
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Textarea
                  placeholder="Ask about any local law, regulation, or legal requirement..."
                  value={legalQuestion}
                  onChange={(e) => setLegalQuestion(e.target.value)}
                  rows={3}
                  className="w-full"
                />
                
                <Button 
                  onClick={handleLegalQuestion}
                  disabled={!legalQuestion.trim() || !selectedCity || isAsking}
                  className="w-full"
                >
                  {isAsking ? 'Researching Legal Information...' : 'Get Legal Guidance'}
                </Button>

                {/* Quick Questions */}
                <div>
                  <p className="text-sm font-medium mb-2">Common Questions:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {commonQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="justify-start h-auto py-2 px-3 text-left"
                        onClick={() => setLegalQuestion(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Response */}
                {legalResponse && (
                  <div className="mt-4">
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader>
                        <CardTitle className="flex items-center text-blue-800 text-lg">
                          <Scale className="w-5 h-5 mr-2" />
                          Legal Guidance
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="whitespace-pre-wrap text-gray-700">{legalResponse}</div>
                          <Alert className="bg-gray-50 border-gray-200">
                            <AlertCircle className="h-4 w-4 text-gray-500" />
                            <AlertDescription className="text-gray-600 text-sm">
                              This is AI-generated guidance. For official legal advice, please consult local authorities or legal professionals.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-4">
                        <div className="text-sm text-gray-500">Was this information helpful?</div>
                        <div className="space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => setFeedbackGiven(true)}
                            disabled={feedbackGiven}
                          >
                            Yes
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => setFeedbackGiven(true)}
                            disabled={feedbackGiven}
                          >
                            No
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legal Information Tabs */}
            {selectedCity?.travelLaws && (
              <Card>
                <CardHeader>
                  <CardTitle>Legal Regulations for {selectedCity.name}</CardTitle>
                  <CardDescription>Comprehensive legal information for travelers</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="penalties" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                      <TabsTrigger value="penalties">Penalties</TabsTrigger>
                      <TabsTrigger value="immigration">Immigration</TabsTrigger>
                      <TabsTrigger value="transport">Transport</TabsTrigger>
                      <TabsTrigger value="behavior">Behavior</TabsTrigger>
                      <TabsTrigger value="photography">Photography</TabsTrigger>
                      <TabsTrigger value="emergency">Emergency</TabsTrigger>
                    </TabsList>

                    <TabsContent value="penalties" className="space-y-4 mt-4">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-red-700 flex items-center">
                          <AlertTriangle className="w-5 h-5 mr-2" />
                          Common Violations & Penalties
                        </h3>
                        <div className="space-y-3">
                          {selectedCity.travelLaws.penalties.commonViolations.map((violation, index) => (
                            <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(violation.severity)}`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold">{violation.violation}</h4>
                                  <p className="text-sm mt-1">{violation.penalty}</p>
                                </div>
                                <Badge variant={violation.severity === 'severe' ? 'destructive' : 
                                          violation.severity === 'moderate' ? 'secondary' : 'outline'}>
                                  {violation.severity.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="immigration" className="space-y-4 mt-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-blue-700 mb-3">Visa Requirements</h3>
                          <ul className="space-y-2">
                            {selectedCity.travelLaws.immigration.visaRequirements.map((req, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                                <span className="text-sm">{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-blue-700 mb-3">Entry Restrictions</h3>
                          <ul className="space-y-2">
                            {selectedCity.travelLaws.immigration.entryRestrictions.map((restriction, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                                <span className="text-sm">{restriction}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="font-semibold text-blue-700 mb-3">Customs Regulations</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {selectedCity.travelLaws.immigration.customsRegulations.map((regulation, index) => (
                            <div key={index} className="bg-blue-50 border border-blue-200 rounded p-3">
                              <p className="text-sm text-blue-800">{regulation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="transport" className="space-y-4 mt-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-green-700 mb-3">Driving Laws</h3>
                          <ul className="space-y-2">
                            {selectedCity.travelLaws.transportation.drivingLaws.map((law, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2"></span>
                                <span className="text-sm">{law}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-green-700 mb-3">Public Transport Rules</h3>
                          <ul className="space-y-2">
                            {selectedCity.travelLaws.transportation.publicTransportRules.map((rule, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2"></span>
                                <span className="text-sm">{rule}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h3 className="font-semibold text-green-700 mb-3">Ride Sharing Regulations</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {selectedCity.travelLaws.transportation.rideSharingRegulations.map((regulation, index) => (
                            <div key={index} className="bg-green-50 border border-green-200 rounded p-3">
                              <p className="text-sm text-green-800">{regulation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="behavior" className="space-y-4 mt-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-purple-700 mb-3">Alcohol Restrictions</h3>
                          <ul className="space-y-2">
                            {selectedCity.travelLaws.publicBehavior.alcoholRestrictions.map((restriction, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-2"></span>
                                <span className="text-sm">{restriction}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-purple-700 mb-3">Smoking Bans</h3>
                          <ul className="space-y-2">
                            {selectedCity.travelLaws.publicBehavior.smokingBans.map((ban, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-2"></span>
                                <span className="text-sm">{ban}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h3 className="font-semibold text-purple-700 mb-3">Public Display Restrictions</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {selectedCity.travelLaws.publicBehavior.publicDisplayRestrictions.map((restriction, index) => (
                            <div key={index} className="bg-purple-50 border border-purple-200 rounded p-3">
                              <p className="text-sm text-purple-800">{restriction}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="photography" className="space-y-4 mt-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <Card className="bg-red-50 border-red-200">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-red-700">Restricted Areas</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-1">
                              {selectedCity.travelLaws.photography.restrictedAreas.map((area, index) => (
                                <li key={index} className="text-sm text-red-800 flex items-start">
                                  <AlertTriangle className="w-3 h-3 mt-1 mr-2 flex-shrink-0" />
                                  {area}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card className="bg-orange-50 border-orange-200">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-orange-700">Permits Required</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-1">
                              {selectedCity.travelLaws.photography.permitsRequired.map((permit, index) => (
                                <li key={index} className="text-sm text-orange-800 flex items-start">
                                  <FileText className="w-3 h-3 mt-1 mr-2 flex-shrink-0" />
                                  {permit}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card className="bg-blue-50 border-blue-200">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-blue-700">Privacy Laws</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-1">
                              {selectedCity.travelLaws.photography.privacyLaws.map((law, index) => (
                                <li key={index} className="text-sm text-blue-800 flex items-start">
                                  <Shield className="w-3 h-3 mt-1 mr-2 flex-shrink-0" />
                                  {law}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Alert className="bg-gray-50 border-gray-200 mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Photography laws can change frequently. Always confirm current regulations with local authorities before professional photography.
                        </AlertDescription>
                      </Alert>
                    </TabsContent>

                    <TabsContent value="emergency" className="space-y-4 mt-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-red-700 mb-3 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            Emergency Contacts
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                              <span className="font-medium">Police Emergency</span>
                              <Badge variant="destructive">{selectedCity?.emergencyNumbers?.police ?? 'N/A'}</Badge>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                              <span className="font-medium">Medical Emergency</span>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                {selectedCity?.emergencyNumbers?.medical ?? 'N/A'}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                              <span className="font-medium">Tourist Helpline</span>
                              <Badge variant="outline" className="border-orange-300 text-orange-700">
                                {selectedCity?.emergencyNumbers?.tourist ?? 'N/A'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-blue-700 mb-3">Legal Assistance</h3>
                          <div className="space-y-2">
                            {selectedCity?.travelLaws?.penalties?.contactAuthorities?.map((authority, index) => (
                              <div key={index} className="p-2 bg-blue-50 rounded">
                                <p className="text-sm text-blue-800">{authority}</p>
                              </div>
                            ))}
                          </div>
                          
                          <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                            <Shield className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Legal Rights:</strong> As a tourist, you have the right to contact your embassy 
                              if arrested. Always ask for an interpreter if needed and request to contact your 
                              country's consular services immediately.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Technology Section */}
            <Card className="mt-8">
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}