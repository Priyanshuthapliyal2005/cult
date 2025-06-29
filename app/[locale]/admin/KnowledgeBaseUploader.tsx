'use client';

import { useState, useCallback } from 'react';
import { UploadCloud, FileText, Check, X, Info, Database, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';

export default function KnowledgeBaseUploader() {
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState({
    destinationName: '',
    country: '',
    description: '',
    insightType: 'custom' as 'custom' | 'law' | 'phrase' | 'event',
    title: '',
    content: ''
  });

  // tRPC mutations
  const addDestination = trpc.dynamicKnowledgeBase.addDestination.useMutation();
  const addCulturalInsight = trpc.dynamicKnowledgeBase.addCulturalInsight.useMutation();
  const importFromExternalSource = trpc.dynamicKnowledgeBase.importFromExternalSource.useMutation();
  
  // tRPC queries
  const dbStats = trpc.dynamicKnowledgeBase.getStats.useQuery(undefined, { 
    refetchInterval: 10000 // Refresh every 10 seconds
  });
  const testConnection = trpc.dynamicKnowledgeBase.testConnection.useQuery(undefined, {
    staleTime: 60000 // Cache for 1 minute
  });

  // Handle file selection
  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
    setUploadResult(null);
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setError(null);

    try {
      // Read file
      const text = await file.text();
      setUploadProgress(30);
      
      // Parse content
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        // Try to determine if it's CSV, XML, or other format
        if (file.name.endsWith('.csv')) {
          // Basic CSV parsing
          data = parseCSV(text);
        } else {
          throw new Error('Unsupported file format. Please upload JSON, or CSV.');
        }
      }
      
      setUploadProgress(60);
      
      // Import data
      const result = await importFromExternalSource.mutateAsync({
        type: 'custom',
        data: { entries: Array.isArray(data) ? data : [data] },
        mapping: {}
      });
      
      setUploadProgress(100);
      setUploadResult(result);
      
      // Refetch stats
      dbStats.refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [file, importFromExternalSource, dbStats]);

  // Handle manual input submission
  const handleManualSubmit = useCallback(async () => {
    setIsUploading(true);
    setError(null);

    try {
      if (activeTab === 'destination') {
        if (!manualInput.destinationName || !manualInput.country || !manualInput.description) {
          throw new Error('Please fill all required fields');
        }

        // Add destination
        await addDestination.mutateAsync({
          name: manualInput.destinationName,
          country: manualInput.country,
          description: manualInput.description
        });

      } else if (activeTab === 'insight') {
        if (!manualInput.destinationName || !manualInput.country || !manualInput.title || !manualInput.content) {
          throw new Error('Please fill all required fields');
        }

        // Add cultural insight
        await addCulturalInsight.mutateAsync({
          destinationName: manualInput.destinationName,
          country: manualInput.country,
          insightType: manualInput.insightType,
          title: manualInput.title,
          content: manualInput.content
        });
      }

      // Reset form
      setManualInput({
        destinationName: '',
        country: '',
        description: '',
        insightType: 'custom',
        title: '',
        content: ''
      });
      
      // Refetch stats
      dbStats.refetch();
      
      setUploadResult({ success: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
      setUploadResult(null);
    } finally {
      setIsUploading(false);
    }
  }, [activeTab, manualInput, addDestination, addCulturalInsight, dbStats]);

  // Parse CSV helper function
  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {} as Record<string, string>);
    });
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-600" />
            Dynamic Knowledge Base Management
          </CardTitle>
          <CardDescription>
            Add, update, and manage cultural intelligence data
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Connection Status */}
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${testConnection.data?.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div className="text-sm font-medium">
                ChromaDB Status: {testConnection.isLoading ? 'Checking...' : testConnection.data?.status === 'success' ? 'Connected' : 'Not Connected'}
              </div>
              {testConnection.data?.status !== 'success' && (
                <Alert className="mt-2 border-yellow-200 bg-yellow-50">
                  <Info className="h-4 w-4 text-yellow-800" />
                  <AlertDescription className="text-yellow-800">
                    ChromaDB connection issues. Make sure the ChromaDB server is running or add the URL to your environment variables.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            {dbStats.data && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Knowledge Base Stats</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Entries</p>
                    <p className="font-semibold">{dbStats.data.totalEntries}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Collections</p>
                    <p className="font-semibold">{dbStats.data.collections.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Recent Entries</p>
                    <p className="font-semibold">{dbStats.data.recentEntries}</p>
                  </div>
                </div>
                
                {Object.entries(dbStats.data.entriesByType).length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-medium mb-2">Entry Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(dbStats.data.entriesByType).map(([type, count]) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Methods Tabs */}
          <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="upload">
                <UploadCloud className="w-4 h-4 mr-2" />
                File Upload
              </TabsTrigger>
              <TabsTrigger value="destination">
                <Plus className="w-4 h-4 mr-2" />
                Add Destination
              </TabsTrigger>
              <TabsTrigger value="insight">
                <FileText className="w-4 h-4 mr-2" />
                Add Insight
              </TabsTrigger>
            </TabsList>
            
            {/* File Upload */}
            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <Input
                  type="file"
                  id="file"
                  accept=".json,.csv,.txt"
                  onChange={onFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="file"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-1">Upload Data</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Drag and drop or click to select a JSON or CSV file
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file')?.click()}
                  >
                    Select File
                  </Button>
                </label>
              </div>
              
              {file && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setFile(null)}
                    >
                      <Trash className="w-4 h-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
              )}
              
              <Button
                onClick={handleFileUpload}
                disabled={!file || isUploading}
                className="w-full"
              >
                {isUploading ? 'Uploading...' : 'Upload to Knowledge Base'}
              </Button>
              
              {isUploading && (
                <Progress value={uploadProgress} className="h-2" />
              )}
            </TabsContent>
            
            {/* Add Destination */}
            <TabsContent value="destination" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="destinationName">Destination Name *</Label>
                    <Input
                      id="destinationName"
                      value={manualInput.destinationName}
                      onChange={(e) => setManualInput(prev => ({ ...prev, destinationName: e.target.value }))}
                      placeholder="e.g. Paris"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={manualInput.country}
                      onChange={(e) => setManualInput(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="e.g. France"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={manualInput.description}
                    onChange={(e) => setManualInput(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide a detailed description of the destination..."
                    rows={5}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Add Cultural Insight */}
            <TabsContent value="insight" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insightDestination">Destination *</Label>
                    <Input
                      id="insightDestination"
                      value={manualInput.destinationName}
                      onChange={(e) => setManualInput(prev => ({ ...prev, destinationName: e.target.value }))}
                      placeholder="e.g. Paris"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="insightCountry">Country *</Label>
                    <Input
                      id="insightCountry"
                      value={manualInput.country}
                      onChange={(e) => setManualInput(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="e.g. France"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insightType">Insight Type *</Label>
                    <Select 
                      value={manualInput.insightType}
                      onValueChange={(value: any) => setManualInput(prev => ({ ...prev, insightType: value }))}
                    >
                      <SelectTrigger id="insightType">
                        <SelectValue placeholder="Select insight type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">General Cultural Insight</SelectItem>
                        <SelectItem value="law">Local Law or Regulation</SelectItem>
                        <SelectItem value="phrase">Language Phrase</SelectItem>
                        <SelectItem value="event">Cultural Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="insightTitle">Title *</Label>
                    <Input
                      id="insightTitle"
                      value={manualInput.title}
                      onChange={(e) => setManualInput(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Essential Dining Etiquette"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="insightContent">Content *</Label>
                  <Textarea
                    id="insightContent"
                    value={manualInput.content}
                    onChange={(e) => setManualInput(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Provide detailed cultural information..."
                    rows={5}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Action Button for Manual Input */}
          {(activeTab === 'destination' || activeTab === 'insight') && (
            <Button
              onClick={handleManualSubmit}
              disabled={isUploading}
              className="w-full mt-4"
            >
              {isUploading ? 'Submitting...' : 'Add to Knowledge Base'}
            </Button>
          )}
          
          {/* Error Message */}
          {error && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <X className="h-4 w-4 text-red-800" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Success Message */}
          {uploadResult?.success && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-800" />
              <AlertDescription className="text-green-800">
                Successfully added to knowledge base
                {uploadResult.count && ` (${uploadResult.count} items)`}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}