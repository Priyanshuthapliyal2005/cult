'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Database, Users, RefreshCw, Search, BarChart3, Layers, Download, FileUp, ChevronDown, ChevronUp, Circle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UserMenu from '@/components/UserMenu';

export default function AdminPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [updateRunning, setUpdateRunning] = useState(false);

  const systemStatus = trpc.knowledgeBase.getSystemStatus.useQuery(undefined, {
    refetchInterval: 60000 // Refresh every minute
  });
  
  const vectorStats = trpc.vector.getVectorStats.useQuery(undefined, {
    refetchInterval: 120000 // Refresh every 2 minutes
  });
  
  const qualityReport = trpc.knowledgeBase.getQualityReport.useQuery();
  const runManualUpdate = trpc.knowledgeBase.runManualUpdate.useMutation();
  
  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };
  
  const handleRunUpdate = async () => {
    try {
      setUpdateRunning(true);
      await runManualUpdate.mutateAsync();
      systemStatus.refetch();
      qualityReport.refetch();
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setUpdateRunning(false);
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'partial': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Circle className="w-4 h-4 text-gray-600" />;
    }
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
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">{t('admin.title')}</h1>
              <p className="text-sm text-gray-500">{t('admin.subtitle')}</p>
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
          className="space-y-6"
        >
          {/* System Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <Database className="w-8 h-8 text-blue-600 mb-2" />
                  <div className="text-2xl font-bold">
                    {vectorStats.data?.content?.totalContent || 0}
                  </div>
                  <div className="text-sm text-gray-500">Vector Entries</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <Users className="w-8 h-8 text-purple-600 mb-2" />
                  <div className="text-2xl font-bold">
                    {systemStatus.data?.totalCities || 0}
                  </div>
                  <div className="text-sm text-gray-500">Cities</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
                  <div className="text-2xl font-bold">
                    {vectorStats.data?.rag?.totalQueries || 0}
                  </div>
                  <div className="text-sm text-gray-500">Total Queries</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="flex items-center mb-2">
                    {systemStatus.data?.dataQuality ? (
                      getStatusIcon(
                        systemStatus.data.dataQuality.overallScore > 0.7 
                          ? 'success' 
                          : systemStatus.data.dataQuality.overallScore > 0.5 
                            ? 'partial' 
                            : 'error'
                      )
                    ) : (
                      <Circle className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="text-2xl font-bold">
                    {systemStatus.data?.dataQuality 
                      ? Math.round(systemStatus.data.dataQuality.overallScore * 100) 
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-500">Data Quality</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Admin Interface */}
          <Tabs defaultValue="system-status">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="system-status">System Status</TabsTrigger>
              <TabsTrigger value="vector-database">Vector Database</TabsTrigger>
              <TabsTrigger value="data-management">Data Management</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            {/* System Status Tab */}
            <TabsContent value="system-status" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Knowledge Base Status</CardTitle>
                    <Button 
                      onClick={handleRunUpdate}
                      disabled={updateRunning} 
                      size="sm"
                      className="flex items-center"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${updateRunning ? 'animate-spin' : ''}`} />
                      {updateRunning ? 'Running...' : 'Run Update'}
                    </Button>
                  </div>
                  <CardDescription>
                    System health, data quality metrics, and pipeline status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* System Health */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">System Health</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {systemStatus.isLoading ? (
                              <Circle className="w-5 h-5 text-gray-400 animate-pulse" />
                            ) : (
                              getStatusIcon(systemStatus.data?.pipelineStatus?.isRunning ? 'partial' : 'success')
                            )}
                          </div>
                          <div>
                            <div className="font-medium">Pipeline Status</div>
                            <div className="text-sm text-gray-500">
                              {systemStatus.isLoading 
                                ? 'Checking...' 
                                : systemStatus.data?.pipelineStatus?.isRunning 
                                  ? 'Running' 
                                  : 'Ready'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-lg flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {getStatusIcon(vectorStats.data?.embeddings?.status || 'error')}
                          </div>
                          <div>
                            <div className="font-medium">Embeddings Service</div>
                            <div className="text-sm text-gray-500">
                              {vectorStats.data?.embeddings?.status === 'success' 
                                ? 'Operational' 
                                : vectorStats.data?.embeddings?.status === 'demo'
                                ? 'Demo Mode' 
                                : 'Unavailable'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-lg flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {getStatusIcon(vectorStats.data?.vectorStore?.status || 'error')}
                          </div>
                          <div>
                            <div className="font-medium">Vector Store</div>
                            <div className="text-sm text-gray-500">
                              {vectorStats.data?.vectorStore?.status === 'success' 
                                ? 'Connected' 
                                : vectorStats.data?.vectorStore?.status === 'empty'
                                ? 'Empty' 
                                : 'Disconnected'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Data Quality */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Data Quality Metrics</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Data Freshness</span>
                            <span className="text-sm font-medium">
                              {qualityReport.data?.metrics?.dataFreshness 
                                ? `${Math.round(qualityReport.data.metrics.dataFreshness * 100)}%`
                                : 'N/A'}
                            </span>
                          </div>
                          <Progress 
                            value={qualityReport.data?.metrics?.dataFreshness 
                              ? qualityReport.data.metrics.dataFreshness * 100
                              : 0} 
                            className="h-2" 
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Source Reliability</span>
                            <span className="text-sm font-medium">
                              {qualityReport.data?.metrics?.sourceReliability 
                                ? `${Math.round(qualityReport.data.metrics.sourceReliability * 100)}%`
                                : 'N/A'}
                            </span>
                          </div>
                          <Progress 
                            value={qualityReport.data?.metrics?.sourceReliability 
                              ? qualityReport.data.metrics.sourceReliability * 100
                              : 0} 
                            className="h-2" 
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Cross-Reference Accuracy</span>
                            <span className="text-sm font-medium">
                              {qualityReport.data?.metrics?.crossReferenceAccuracy 
                                ? `${Math.round(qualityReport.data.metrics.crossReferenceAccuracy * 100)}%`
                                : 'N/A'}
                            </span>
                          </div>
                          <Progress 
                            value={qualityReport.data?.metrics?.crossReferenceAccuracy 
                              ? qualityReport.data.metrics.crossReferenceAccuracy * 100
                              : 0} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Critical Issues */}
                    {qualityReport.data?.criticalIssues && qualityReport.data.criticalIssues.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Critical Issues</h3>
                        <div className="space-y-2">
                          {qualityReport.data.criticalIssues.map((issue, index) => (
                            <Alert key={index} className="border-red-200 bg-red-50">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <AlertDescription className="text-red-700">
                                {issue}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Recommendations */}
                    {qualityReport.data?.recommendations && qualityReport.data.recommendations.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Recommendations</h3>
                        <div className="space-y-2">
                          {qualityReport.data.recommendations.map((recommendation, index) => (
                            <Alert key={index} className="border-blue-200 bg-blue-50">
                              <AlertCircle className="h-4 w-4 text-blue-500" />
                              <AlertDescription className="text-blue-700">
                                {recommendation}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Vector Database Tab */}
            <TabsContent value="vector-database" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vector Search</CardTitle>
                  <CardDescription>
                    Search the vector database for relevant content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Search query..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                      />
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Content Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Content</SelectItem>
                          <SelectItem value="destination">Destinations</SelectItem>
                          <SelectItem value="phrases">Phrases</SelectItem>
                          <SelectItem value="customs">Customs</SelectItem>
                          <SelectItem value="city">Cities</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </Button>
                    </div>
                    
                    {/* Content Type Distribution */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">Content Type Distribution</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {vectorStats.data?.content?.contentTypes && Object.entries(vectorStats.data.content.contentTypes)
                          .slice(0, 8)
                          .map(([type, count]) => (
                            <div key={type} className="p-3 bg-gray-50 rounded-lg text-center">
                              <div className="text-lg font-bold">{count}</div>
                              <div className="text-xs text-gray-500 truncate">{type}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Ingestion</CardTitle>
                    <CardDescription>
                      Ingest data into the vector database
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                        <FileUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          Drag & drop files or click to upload
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Supports JSON, CSV, and TXT
                        </p>
                      </div>
                      
                      <div className="flex justify-between">
                        <Button variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download Template
                        </Button>
                        <Button disabled>
                          Start Ingestion
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Recent changes to the vector database
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">Data updated</div>
                          <div className="text-xs text-gray-500">Today, 10:30 AM</div>
                        </div>
                        <Badge>+128 items</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">Quality check</div>
                          <div className="text-xs text-gray-500">Yesterday, 4:12 PM</div>
                        </div>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">Manual update</div>
                          <div className="text-xs text-gray-500">Yesterday, 1:23 PM</div>
                        </div>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Data Management Tab */}
            <TabsContent value="data-management" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cities Data Management</CardTitle>
                  <CardDescription>
                    Add, update, or manage city information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-between">
                      <div className="flex space-x-2">
                        <Input placeholder="Search cities..." className="w-64" />
                        <Button variant="outline">
                          <Search className="w-4 h-4 mr-2" />
                          Search
                        </Button>
                      </div>
                      <Button>
                        Add New City
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Country
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quality
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Updated
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {['Pushkar', 'Rishikesh', 'Mussoorie', 'Tokyo', 'Paris', 'Ubud'].map((city, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {city}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {index < 3 ? 'India' : index === 3 ? 'Japan' : index === 4 ? 'France' : 'Indonesia'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
                                  Good
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                1 day ago
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button variant="ghost" size="sm">Edit</Button>
                                <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Add City Manually</CardTitle>
                  <CardDescription>
                    Add a new city to the knowledge base
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">City Name</label>
                        <Input placeholder="e.g., Bangkok" />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Country</label>
                        <Input placeholder="e.g., Thailand" />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Region</label>
                        <Input placeholder="e.g., Central Thailand" />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Population</label>
                        <Input type="number" placeholder="e.g., 8000000" />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea placeholder="Brief description of the city" />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button>
                        Add City
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Knowledge Base Usage</CardTitle>
                  <CardDescription>
                    Insights about the usage and performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                        <div className="text-3xl font-bold text-blue-700">
                          {vectorStats.data?.rag?.totalQueries || 0}
                        </div>
                        <div className="text-sm text-blue-600">Total Queries</div>
                        <div className="mt-2 text-xs text-blue-500">
                          {vectorStats.data?.rag?.recentActivity || 0} in the last 24 hours
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                        <div className="text-3xl font-bold text-green-700">
                          {vectorStats.data?.rag?.avgConfidence
                            ? `${Math.round(vectorStats.data.rag.avgConfidence * 100)}%`
                            : 'N/A'}
                        </div>
                        <div className="text-sm text-green-600">Average Confidence</div>
                        <div className="mt-2 text-xs text-green-500">
                          Based on recent queries
                        </div>
                      </div>
                      
                      <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
                        <div className="text-3xl font-bold text-purple-700">
                          {qualityReport.data?.userSatisfaction?.averageRating
                            ? qualityReport.data.userSatisfaction.averageRating.toFixed(1)
                            : 'N/A'}
                        </div>
                        <div className="text-sm text-purple-600">User Satisfaction</div>
                        <div className="mt-2 text-xs text-purple-500">
                          {qualityReport.data?.userSatisfaction?.totalRatings || 0} ratings
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional analysis could go here in a real implementation */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Popular Content Types</h3>
                      <div className="space-y-2">
                        {vectorStats.data?.rag?.topContentTypes?.map((item, index) => (
                          <div key={index} className="flex items-center">
                            <div className="flex-1">
                              <div className="text-sm font-medium">{item.type}</div>
                              <Progress
                                value={item.count / (vectorStats.data?.content?.totalContent || 1) * 100}
                                className="h-2 mt-1"
                              />
                            </div>
                            <div className="ml-4 text-sm font-medium">{item.count}</div>
                          </div>
                        ))}
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