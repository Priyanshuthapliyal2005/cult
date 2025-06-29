'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Users, RefreshCw, Search, BarChart3, Layers, AlertCircle, CheckCircle, Circle, FileUp, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations, useLocale } from 'next-intl';
import { trpc } from '@/lib/trpc';
import { VectorStatsResponse } from '@/types/vector';
import dynamic from 'next/dynamic';

// Dynamically import KnowledgeBaseUploader to avoid SSR issues
const KnowledgeBaseUploader = dynamic(() => import('./KnowledgeBaseUploader'), {
  ssr: false,
  loading: () => <div className="p-4">Loading knowledge base uploader...</div>
});

interface Issue {
  type: string;
  message: string;
  severity: string;
}

interface Recommendation {
  priority: string;
  action: string;
  impact: string;
}

export default function AdminPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [updateRunning, setUpdateRunning] = useState(false);

  const tabs = ["overview", "vector-database", "content", "dynamic-kb", "analytics"];
  const [activeAdminTab, setActiveAdminTab] = useState('overview');

  const systemStatus = trpc.knowledgeBase.getSystemStatus.useQuery(undefined, {
    refetchInterval: 60000 // Refresh every minute
  });
  
  const vectorStats = trpc.vector.getVectorStats.useQuery<VectorStatsResponse>(undefined, {
    refetchInterval: 120000 // Refresh every 2 minutes
  });
  
  const qualityReport = trpc.knowledgeBase.getQualityReport.useQuery();
  const runManualUpdate = trpc.knowledgeBase.runManualUpdate.useMutation();
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
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

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={handleRunUpdate}
            disabled={updateRunning}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${updateRunning ? 'animate-spin' : ''}`} />
            {updateRunning ? 'Updating...' : 'Run Update'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          {tabs.map(tab => (
            <TabsTrigger 
              key={tab}
              value={tab} 
              onClick={() => setActiveAdminTab(tab)}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'vector-database' && 'Vector Database'}
              {tab === 'content' && 'Content'}
              {tab === 'dynamic-kb' && 'Dynamic KB'}
              {tab === 'analytics' && 'Analytics'}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {vectorStats.data?.content?.totalContent.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {vectorStats.data?.content?.recentContent} added recently
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Query Volume</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {vectorStats.data?.rag?.totalQueries?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {vectorStats.data?.rag?.recentActivity} today
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {qualityReport.data?.metrics?.overallScore 
                    ? `${Math.round(qualityReport.data.metrics.overallScore * 100)}%` 
                    : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {qualityReport.data?.metrics?.dataFreshness} days old
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current status of system components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(systemStatus.isLoading ? 'loading' : 'success')}
                      </div>
                      <div>
                        <div className="font-medium">API Status</div>
                        <div className="text-sm text-gray-500">
                          {systemStatus.isLoading ? 'Checking...' : 'Operational'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(vectorStats.data?.ingestion?.systemHealth.embeddings ? 'success' : 'error')}
                      </div>
                      <div>
                        <div className="font-medium">Embeddings Service</div>
                        <div className="text-sm text-gray-500">
                          {vectorStats.data?.ingestion?.systemHealth.embeddings 
                            ? 'Operational' 
                            : 'Unavailable'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(vectorStats.data?.ingestion?.systemHealth.vectorStore ? 'success' : 'error')}
                      </div>
                      <div>
                        <div className="font-medium">Vector Store</div>
                        <div className="text-sm text-gray-500">
                          {vectorStats.data?.ingestion?.systemHealth.vectorStore 
                            ? vectorStats.data?.content?.totalContent > 0 
                              ? 'Connected' 
                              : 'Empty'
                            : 'Disconnected'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(systemStatus.data?.pipelineStatus?.isRunning ? 'warning' : 'success')}
                      </div>
                      <div>
                        <div className="font-medium">Update Pipeline</div>
                        <div className="text-sm text-gray-500">
                          {systemStatus.isLoading 
                            ? 'Checking...' 
                            : systemStatus.data?.pipelineStatus?.isRunning 
                              ? 'Running' 
                              : 'Ready'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Data Quality Metrics</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Data Freshness', value: qualityReport.data?.metrics?.dataFreshness },
                        { label: 'Source Reliability', value: qualityReport.data?.metrics?.sourceReliability },
                        { label: 'User Validation', value: qualityReport.data?.metrics?.userValidation },
                        { label: 'Expert Review', value: qualityReport.data?.metrics?.expertReview },
                        { label: 'Cross-Reference', value: qualityReport.data?.metrics?.crossReferenceAccuracy },
                      ].map((metric, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">{metric.label}</span>
                            <span className="text-sm font-medium">
                              {metric.value ? Math.round(metric.value * 100) : 0}%
                            </span>
                          </div>
                          <Progress 
                            value={metric.value ? metric.value * 100 : 0} 
                            className="h-2" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates and changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Content Types</h3>
                    <div className="space-y-2">
                      {Object.entries(vectorStats.data?.content?.contentTypes || {})
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between">
                            <span className="text-sm">{type}</span>
                            <span className="text-sm font-medium">{count as number}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Top Queries</h3>
                    <div className="space-y-2">
                      {vectorStats.data?.rag?.topContentTypes?.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div className="flex-1">
                            <div className="text-sm">{item.type}</div>
                            <Progress
                              value={(item.count / (vectorStats.data?.rag?.totalQueries || 1)) * 100}
                              className="h-1.5 mt-1"
                            />
                          </div>
                          <div className="text-xs text-gray-500 ml-2">
                            {Math.round((item.count / (vectorStats.data?.rag?.totalQueries || 1)) * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dynamic Knowledge Base Tab */}
        <TabsContent value="dynamic-kb" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dynamic Knowledge Base</CardTitle>
              <CardDescription>
                ChromaDB-powered knowledge base management for real-time updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeAdminTab === 'dynamic-kb' && (
                <div className="dynamic-knowledge-base-container">
                  <KnowledgeBaseUploader />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
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
                
                <div className="rounded-md border">
                  <div className="p-4 bg-gray-50 border-b">
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? `Search results for "${searchQuery}"` : 'Enter a search query to begin'}
                    </p>
                  </div>
                  <div className="p-4">
                    {!searchQuery ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No search query entered
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="p-4 border rounded-lg hover:bg-gray-50">
                            <h4 className="font-medium">Search Result {item}</h4>
                            <p className="text-sm text-muted-foreground">
                              This is a sample search result for "{searchQuery}". In a real application, this would show actual search results from the vector database.
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>
                Manage your knowledge base content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1 max-w-md">
                    <Input 
                      placeholder="Search content..." 
                      className="w-full"
                    />
                  </div>
                  <Button>
                    <FileUp className="w-4 h-4 mr-2" />
                    Import Content
                  </Button>
                </div>
                
                <div className="rounded-md border">
                  <div className="p-4 bg-gray-50 border-b">
                    <p className="text-sm text-muted-foreground">
                      Showing 1-10 of {vectorStats.data?.content?.totalContent || 0} items
                    </p>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((item) => (
                        <div key={item} className="p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">Content Item {item}</h4>
                              <p className="text-sm text-muted-foreground">
                                This is a sample content item. In a real application, this would show actual content from your knowledge base.
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                View usage statistics and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-medium mb-4">Query Volume</h3>
                  <div className="h-[200px] bg-gray-50 rounded flex items-center justify-center text-muted-foreground">
                    Query volume chart would be displayed here
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-4">Content Popularity</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Destinations', value: 45 },
                      { name: 'Cultural Norms', value: 30 },
                      { name: 'Visa Info', value: 15 },
                      { name: 'Safety Tips', value: 10 },
                    ].map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span className="font-medium">{item.value}%</span>
                        </div>
                        <Progress value={item.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-4">System Health</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Vector Store</span>
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">
                          {vectorStats.data?.ingestion?.systemHealth.vectorStore ? 'Healthy' : 'Degraded'}
                        </span>
                        {vectorStats.data?.ingestion?.systemHealth.vectorStore ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Embeddings Service</span>
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">
                          {vectorStats.data?.ingestion?.systemHealth.embeddings ? 'Healthy' : 'Degraded'}
                        </span>
                        {vectorStats.data?.ingestion?.systemHealth.embeddings ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Data Freshness</span>
                      <div className="flex items-center">
                        <span className="text-sm font-medium">
                          {qualityReport.data?.metrics?.dataFreshness 
                            ? `${qualityReport.data.metrics.dataFreshness} days` 
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}