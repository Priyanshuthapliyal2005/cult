'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Upload, Search, BarChart3, RefreshCw, AlertCircle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import Link from 'next/link';

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newContent, setNewContent] = useState({
    contentId: '',
    contentType: 'custom',
    title: '',
    content: '',
    metadata: '{}'
  });

  // TRPC queries and mutations
  const vectorStats = trpc.vector.getVectorStats.useQuery();
  const testVector = trpc.vector.testVectorServices.useQuery();
  const ingestData = trpc.vector.ingestCulturalData.useMutation();
  const clearContent = trpc.vector.clearAllContent.useMutation();
  const searchSimilar = trpc.vector.searchSimilar.useMutation();
  const addContent = trpc.vector.addContent.useMutation();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const result = await searchSimilar.mutateAsync({
        query: searchQuery,
        limit: 10,
        threshold: 0.3
      });
      setSearchResults(result.results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleIngestData = async () => {
    try {
      await ingestData.mutateAsync();
      vectorStats.refetch();
      testVector.refetch();
    } catch (error) {
      console.error('Ingestion error:', error);
    }
  };

  const handleClearContent = async () => {
    if (confirm('Are you sure you want to clear all vector content? This action cannot be undone.')) {
      try {
        await clearContent.mutateAsync();
        vectorStats.refetch();
        testVector.refetch();
        setSearchResults([]);
      } catch (error) {
        console.error('Clear content error:', error);
      }
    }
  };

  const handleAddContent = async () => {
    try {
      let metadata = {};
      try {
        metadata = JSON.parse(newContent.metadata);
      } catch (e) {
        alert('Invalid JSON in metadata field');
        return;
      }

      await addContent.mutateAsync({
        ...newContent,
        metadata
      });

      // Reset form
      setNewContent({
        contentId: '',
        contentType: 'custom',
        title: '',
        content: '',
        metadata: '{}'
      });

      vectorStats.refetch();
      alert('Content added successfully!');
    } catch (error) {
      console.error('Add content error:', error);
      alert('Failed to add content');
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
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">Vector Database Admin</h1>
              <p className="text-sm text-gray-500">Manage RAG system and vector content</p>
            </div>
          </div>
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
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Vector Store</div>
                    <div className="text-2xl font-bold">
                      {vectorStats.data?.content.totalContent || 0}
                    </div>
                    <div className="text-xs text-gray-500">Documents</div>
                  </div>
                  {getStatusIcon(testVector.data?.vectorStore?.status || 'unknown')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">RAG Queries</div>
                    <div className="text-2xl font-bold">
                      {vectorStats.data?.rag.totalQueries || 0}
                    </div>
                    <div className="text-xs text-gray-500">Total processed</div>
                  </div>
                  {getStatusIcon(testVector.data?.overall?.status || 'unknown')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Avg Confidence</div>
                    <div className="text-2xl font-bold">
                      {((vectorStats.data?.rag.avgConfidence || 0) * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">Response quality</div>
                  </div>
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                System Status
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    testVector.refetch();
                    vectorStats.refetch();
                  }}
                  disabled={testVector.isFetching || vectorStats.isFetching}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${testVector.isFetching ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Embeddings Service</span>
                    <Badge variant={testVector.data?.embeddings?.status === 'success' ? 'default' : 'secondary'}>
                      {testVector.data?.embeddings?.status || 'unknown'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Vector Store</span>
                    <Badge variant={testVector.data?.vectorStore?.status === 'success' ? 'default' : 'secondary'}>
                      {testVector.data?.vectorStore?.status || 'unknown'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">RAG System</span>
                    <Badge variant={testVector.data?.overall?.status === 'success' ? 'default' : 'secondary'}>
                      {testVector.data?.overall?.status || 'unknown'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Content Types</h4>
                  <div className="space-y-1">
                    {Object.entries(vectorStats.data?.content.contentTypes || {}).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-xs">
                        <span className="capitalize">{type}</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Tabs */}
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="search">Vector Search</TabsTrigger>
              <TabsTrigger value="content">Manage Content</TabsTrigger>
              <TabsTrigger value="ingestion">Data Ingestion</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Vector Search Tab */}
            <TabsContent value="search" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vector Similarity Search</CardTitle>
                  <CardDescription>Test the vector search functionality</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter search query..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={isSearching}>
                      <Search className="w-4 h-4 mr-2" />
                      {isSearching ? 'Searching...' : 'Search'}
                    </Button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Search Results ({searchResults.length})</h4>
                      {searchResults.map((result, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium">{result.title}</h5>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{result.contentType}</Badge>
                              <Badge variant="secondary">
                                {(result.similarity * 100).toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                            {result.content}
                          </p>
                          {result.metadata?.location && (
                            <Badge variant="outline" className="text-xs">
                              📍 {result.metadata.location}
                            </Badge>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Management Tab */}
            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Content</CardTitle>
                  <CardDescription>Add custom content to the vector database</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Content ID"
                      value={newContent.contentId}
                      onChange={(e) => setNewContent({...newContent, contentId: e.target.value})}
                    />
                    <Input
                      placeholder="Content Type"
                      value={newContent.contentType}
                      onChange={(e) => setNewContent({...newContent, contentType: e.target.value})}
                    />
                  </div>
                  <Input
                    placeholder="Title"
                    value={newContent.title}
                    onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                  />
                  <Textarea
                    placeholder="Content"
                    value={newContent.content}
                    onChange={(e) => setNewContent({...newContent, content: e.target.value})}
                    rows={6}
                  />
                  <Textarea
                    placeholder="Metadata (JSON)"
                    value={newContent.metadata}
                    onChange={(e) => setNewContent({...newContent, metadata: e.target.value})}
                    rows={3}
                  />
                  <Button 
                    onClick={handleAddContent}
                    disabled={addContent.isLoading || !newContent.title || !newContent.content}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {addContent.isLoading ? 'Adding...' : 'Add Content'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Ingestion Tab */}
            <TabsContent value="ingestion" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Data Ingestion</CardTitle>
                  <CardDescription>Manage bulk data operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-4">
                    <Button 
                      onClick={handleIngestData}
                      disabled={ingestData.isLoading}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {ingestData.isLoading ? 'Ingesting...' : 'Ingest Cultural Data'}
                    </Button>
                    <Button 
                      onClick={handleClearContent}
                      disabled={clearContent.isLoading}
                      variant="destructive"
                      className="flex-1"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      {clearContent.isLoading ? 'Clearing...' : 'Clear All Content'}
                    </Button>
                  </div>

                  {ingestData.data && (
                    <Alert className={ingestData.data.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <div>
                            Ingestion {ingestData.data.success ? 'completed' : 'failed'}: 
                            {ingestData.data.processed} items processed
                          </div>
                          {ingestData.data.errors.length > 0 && (
                            <div className="text-sm">
                              Errors: {ingestData.data.errors.slice(0, 3).join(', ')}
                              {ingestData.data.errors.length > 3 && '...'}
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="text-sm text-gray-600">
                    <h4 className="font-semibold mb-2">System Health</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex justify-between">
                        <span>Vector Store:</span>
                        <span className={vectorStats.data?.ingestion.systemHealth.vectorStore ? 'text-green-600' : 'text-red-600'}>
                          {vectorStats.data?.ingestion.systemHealth.vectorStore ? 'Healthy' : 'Error'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Embeddings:</span>
                        <span className={vectorStats.data?.ingestion.systemHealth.embeddings ? 'text-green-600' : 'text-red-600'}>
                          {vectorStats.data?.ingestion.systemHealth.embeddings ? 'Healthy' : 'Error'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Documents:</span>
                        <span className="font-semibold">{vectorStats.data?.content.totalContent || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recent Content (7d):</span>
                        <span className="font-semibold">{vectorStats.data?.content.recentContent || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Content Types:</span>
                        <span className="font-semibold">
                          {Object.keys(vectorStats.data?.content.contentTypes || {}).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>RAG Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Queries:</span>
                        <span className="font-semibold">{vectorStats.data?.rag.totalQueries || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recent Activity (24h):</span>
                        <span className="font-semibold">{vectorStats.data?.rag.recentActivity || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Confidence:</span>
                        <span className="font-semibold">
                          {((vectorStats.data?.rag.avgConfidence || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {vectorStats.data?.rag.topContentTypes && vectorStats.data.rag.topContentTypes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Most Accessed Content Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {vectorStats.data.rag.topContentTypes.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="capitalize">{item.type}</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={(item.count / vectorStats.data!.content.totalContent) * 100} className="w-20" />
                            <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}