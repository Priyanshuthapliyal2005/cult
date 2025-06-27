'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Search, MapPin, BarChart3, RefreshCw, AlertCircle, CheckCircle, XCircle, ArrowLeft, Globe, Book, FileText, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const t = useTranslations();
  const locale = useLocale();

  // TRPC queries
  const systemStatus = trpc.knowledgeBase.getSystemStatus.useQuery(undefined, {
    refetchInterval: 60000 // Refresh every minute
  });
  const qualityReport = trpc.knowledgeBase.getQualityReport.useQuery();
  const searchKnowledgeBase = trpc.knowledgeBase.search.useMutation();
  const runManualUpdate = trpc.knowledgeBase.runManualUpdate.useMutation();

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const searchRequest = {
        query: searchQuery,
        context: {
          interests: selectedInterests.length > 0 ? selectedInterests : undefined,
        },
        filters: {
          countries: selectedCountry !== 'all' ? [selectedCountry] : undefined,
          costLevel: selectedBudget !== 'all' ? 
            [selectedBudget as 'budget' | 'moderate' | 'expensive'] : undefined
        },
        includeRecommendations: true
      };
      
      const result = await searchKnowledgeBase.mutateAsync(searchRequest);
      setSearchResults([result.data.destination]);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRunUpdate = async () => {
    try {
      await runManualUpdate.mutateAsync();
      systemStatus.refetch();
      qualityReport.refetch();
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'partial': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const interests = [
    'adventure', 'culture', 'food', 'history', 'nature', 
    'nightlife', 'shopping', 'spiritual', 'art', 'music'
  ];

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
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">Travel Knowledge Base</h1>
              <p className="text-sm text-gray-500">Comprehensive travel intelligence system</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              systemStatus.refetch();
              qualityReport.refetch();
            }}
            disabled={systemStatus.isFetching || qualityReport.isFetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${systemStatus.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* System Status */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Cities</div>
                    <div className="text-2xl font-bold">
                      {systemStatus.data?.totalCities || 0}
                    </div>
                    <div className="text-xs text-gray-500">Comprehensive city profiles</div>
                  </div>
                  <Globe className="w-8 h-8 text-blue-500 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Data Quality</div>
                    <div className="text-2xl font-bold">
                      {((systemStatus.data?.dataQuality.overallScore || 0) * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">Overall quality score</div>
                  </div>
                  <FileText className="w-8 h-8 text-green-500 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Last Updated</div>
                    <div className="text-2xl font-bold">
                      {systemStatus.data?.lastUpdated ? 
                        new Date(systemStatus.data.lastUpdated).toLocaleDateString() : 'Never'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {systemStatus.data?.lastUpdated ? 
                        new Date(systemStatus.data.lastUpdated).toLocaleTimeString() : ''}
                    </div>
                  </div>
                  <Book className="w-8 h-8 text-purple-500 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Pipeline Status</div>
                    <div className="text-2xl font-bold">
                      {systemStatus.data?.pipelineStatus?.isRunning ? 'Running' : 'Idle'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {systemStatus.data?.pipelineStatus?.stats?.citiesProcessed || 0} cities processed
                    </div>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="cities">Cities</TabsTrigger>
              <TabsTrigger value="quality">Quality</TabsTrigger>
              <TabsTrigger value="management">Management</TabsTrigger>
            </TabsList>

            {/* Search Tab */}
            <TabsContent value="search" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Intelligent Travel Search</CardTitle>
                  <CardDescription>Search our comprehensive knowledge base of 1000+ cities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        placeholder="Search for a city or travel topic..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                    <div>
                      <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger>
                          <SelectValue placeholder="Country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Countries</SelectItem>
                          <SelectItem value="India">India</SelectItem>
                          <SelectItem value="Japan">Japan</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="Thailand">Thailand</SelectItem>
                          <SelectItem value="Singapore">Singapore</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Select value={selectedBudget} onValueChange={setSelectedBudget}>
                        <SelectTrigger>
                          <SelectValue placeholder="Budget" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Budgets</SelectItem>
                          <SelectItem value="budget">Budget</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="expensive">Luxury</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Interests</div>
                    <div className="flex flex-wrap gap-2">
                      {interests.map((interest) => (
                        <Badge
                          key={interest}
                          variant={selectedInterests.includes(interest) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            if (selectedInterests.includes(interest)) {
                              setSelectedInterests(selectedInterests.filter(i => i !== interest));
                            } else {
                              setSelectedInterests([...selectedInterests, interest]);
                            }
                          }}
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                    <Search className="w-4 h-4 mr-2" />
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>

                  {searchResults.length > 0 && (
                    <div className="space-y-4 mt-4">
                      <h3 className="text-lg font-semibold">Search Results</h3>
                      {searchResults.map((result, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle>{result.name}</CardTitle>
                                <CardDescription>{result.region}, {result.country}</CardDescription>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className={
                                  result.costLevel === 'budget' ? 'border-green-500 text-green-700' :
                                  result.costLevel === 'moderate' ? 'border-yellow-500 text-yellow-700' :
                                  'border-red-500 text-red-700'
                                }>
                                  {result.costLevel}
                                </Badge>
                                <Badge variant="secondary">
                                  {result.safetyRating}/10
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Legal Highlights</h4>
                                <ul className="space-y-1 text-sm">
                                  {result.travelLaws.immigration.visaRequired && (
                                    <li className="flex items-start">
                                      <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 mr-2"></span>
                                      <span>Visa required for most visitors</span>
                                    </li>
                                  )}
                                  {result.travelLaws.publicBehavior.alcoholRestrictions.slice(0, 1).map((restriction, i) => (
                                    <li key={i} className="flex items-start">
                                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-2"></span>
                                      <span>{restriction}</span>
                                    </li>
                                  ))}
                                  {result.travelLaws.photography.restrictedAreas.slice(0, 1).map((area, i) => (
                                    <li key={i} className="flex items-start">
                                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                                      <span>Photography restricted: {area}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Cultural Insights</h4>
                                <ul className="space-y-1 text-sm">
                                  {result.culturalNorms.etiquette.slice(0, 3).map((etiquette, i) => (
                                    <li key={i} className="flex items-start">
                                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-2"></span>
                                      <span>{etiquette}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <div className="mt-4">
                              <h4 className="font-semibold text-sm mb-2">Best Time to Visit</h4>
                              <div className="flex flex-wrap gap-1">
                                {result.bestTimeToVisit.map((month, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {month}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-end mt-4">
                              <Button size="sm" variant="outline">
                                View Full Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cities Tab */}
            <TabsContent value="cities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>City Database</CardTitle>
                  <CardDescription>
                    Comprehensive database of {systemStatus.data?.totalCities || 0} cities worldwide
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Add New City</h3>
                      <Button size="sm" variant="outline">
                        <MapPin className="w-4 h-4 mr-2" />
                        Add City
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">City Coverage</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Asia</span>
                                <span>450+ cities</span>
                              </div>
                              <Progress value={45} className="h-2" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Europe</span>
                                <span>300+ cities</span>
                              </div>
                              <Progress value={30} className="h-2" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>North America</span>
                                <span>150+ cities</span>
                              </div>
                              <Progress value={15} className="h-2" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Other Regions</span>
                                <span>100+ cities</span>
                              </div>
                              <Progress value={10} className="h-2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Data Completeness</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Legal Information</span>
                                <span>98%</span>
                              </div>
                              <Progress value={98} className="h-2" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Cultural Data</span>
                                <span>95%</span>
                              </div>
                              <Progress value={95} className="h-2" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Practical Information</span>
                                <span>92%</span>
                              </div>
                              <Progress value={92} className="h-2" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Language Essentials</span>
                                <span>90%</span>
                              </div>
                              <Progress value={90} className="h-2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quality Tab */}
            <TabsContent value="quality" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Quality Metrics
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => qualityReport.refetch()}
                      disabled={qualityReport.isFetching}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${qualityReport.isFetching ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Comprehensive quality assessment of the knowledge base
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-4">Overall Quality Score</h4>
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                              {((qualityReport.data?.overallScore || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                          <div 
                            style={{ width: `${(qualityReport.data?.overallScore || 0) * 100}%` }} 
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-3 mt-6">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Data Freshness</span>
                          <span className="text-sm font-medium">
                            {((qualityReport.data?.metrics.dataFreshness || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Source Reliability</span>
                          <span className="text-sm font-medium">
                            {((qualityReport.data?.metrics.sourceReliability || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">User Validation</span>
                          <span className="text-sm font-medium">
                            {((qualityReport.data?.metrics.userValidation || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Expert Review</span>
                          <span className="text-sm font-medium">
                            {((qualityReport.data?.metrics.expertReview || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Cross-Reference Accuracy</span>
                          <span className="text-sm font-medium">
                            {((qualityReport.data?.metrics.crossReferenceAccuracy || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-4">Data Freshness</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Recent (< 7 days)</span>
                          <span className="text-sm font-medium">
                            {qualityReport.data?.dataFreshness.recent || 0} cities
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Current (7-30 days)</span>
                          <span className="text-sm font-medium">
                            {qualityReport.data?.dataFreshness.current || 0} cities
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Stale (> 30 days)</span>
                          <span className="text-sm font-medium">
                            {qualityReport.data?.dataFreshness.stale || 0} cities
                          </span>
                        </div>
                      </div>

                      <h4 className="font-semibold mb-4 mt-6">User Satisfaction</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Average Rating</span>
                          <span className="text-sm font-medium">
                            {qualityReport.data?.userSatisfaction.averageRating.toFixed(1) || 0}/5
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Total Ratings</span>
                          <span className="text-sm font-medium">
                            {qualityReport.data?.userSatisfaction.totalRatings || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {qualityReport.data?.recommendations && qualityReport.data.recommendations.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {qualityReport.data.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {qualityReport.data?.criticalIssues && qualityReport.data.criticalIssues.length > 0 && (
                    <Alert className="mt-4 border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription>
                        <div className="font-semibold text-red-700 mb-1">Critical Issues</div>
                        <ul className="space-y-1">
                          {qualityReport.data.criticalIssues.map((issue, index) => (
                            <li key={index} className="text-sm text-red-700">{issue}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Management Tab */}
            <TabsContent value="management" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Knowledge Base Management</CardTitle>
                  <CardDescription>
                    Manage and maintain the travel knowledge base
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">Run Manual Update</h3>
                        <p className="text-sm text-gray-600">
                          Trigger a manual update of the knowledge base
                        </p>
                      </div>
                      <Button 
                        onClick={handleRunUpdate}
                        disabled={runManualUpdate.isLoading || systemStatus.data?.pipelineStatus?.isRunning}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${runManualUpdate.isLoading ? 'animate-spin' : ''}`} />
                        {runManualUpdate.isLoading ? 'Updating...' : 'Run Update'}
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Pipeline Configuration</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Update Interval</span>
                              <span className="text-sm font-medium">24 hours</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Batch Size</span>
                              <span className="text-sm font-medium">10 cities</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Quality Threshold</span>
                              <span className="text-sm font-medium">60%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Auto Expansion</span>
                              <span className="text-sm font-medium">Enabled</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Pipeline Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Status</span>
                              <Badge variant={systemStatus.data?.pipelineStatus?.isRunning ? "default" : "secondary"}>
                                {systemStatus.data?.pipelineStatus?.isRunning ? 'Running' : 'Idle'}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Last Run</span>
                              <span className="text-sm font-medium">
                                {systemStatus.data?.pipelineStatus?.lastRun ? 
                                  new Date(systemStatus.data.pipelineStatus.lastRun).toLocaleString() : 'Never'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Next Run</span>
                              <span className="text-sm font-medium">
                                {systemStatus.data?.pipelineStatus?.nextRun ? 
                                  new Date(systemStatus.data.pipelineStatus.nextRun).toLocaleString() : 'Not scheduled'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Cities Processed</span>
                              <span className="text-sm font-medium">
                                {systemStatus.data?.pipelineStatus?.stats?.citiesProcessed || 0}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">System Performance</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="text-sm text-gray-600 mb-1">Response Time</div>
                          <div className="text-2xl font-bold">185ms</div>
                          <div className="text-xs text-gray-500">Average search time</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="text-sm text-gray-600 mb-1">Uptime</div>
                          <div className="text-2xl font-bold">99.9%</div>
                          <div className="text-xs text-gray-500">Last 30 days</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="text-sm text-gray-600 mb-1">API Calls</div>
                          <div className="text-2xl font-bold">12,458</div>
                          <div className="text-xs text-gray-500">Last 7 days</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}