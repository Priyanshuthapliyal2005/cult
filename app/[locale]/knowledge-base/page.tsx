'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Search, MapPin, BarChart3, RefreshCw, AlertCircle, CheckCircle, XCircle, ArrowLeft, Globe, Book, Zap, FileText } from 'lucide-react';
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

  const allowedInterests = [
    'adventure', 'culture', 'food', 'history', 'nature',
    'nightlife', 'shopping', 'spiritual', 'art', 'music',
    'architecture', 'beaches', 'mountains', 'urban', 'rural'
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const filteredInterests = selectedInterests.filter(i => allowedInterests.includes(i)) as (
        | 'adventure'
        | 'culture'
        | 'food'
        | 'history'
        | 'nature'
        | 'nightlife'
        | 'shopping'
        | 'spiritual'
        | 'art'
        | 'music'
        | 'architecture'
        | 'beaches'
        | 'mountains'
        | 'urban'
        | 'rural'
      )[];
      const searchRequest = {
        query: searchQuery,
        context: {
          interests: filteredInterests.length > 0 ? filteredInterests : undefined,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      {/* Loading and error states for system status */}
      {systemStatus.isLoading && (
        <div className="flex items-center justify-center h-32">
          <span className="text-gray-500">Loading system status...</span>
        </div>
      )}
      {systemStatus.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            Error loading system status: {systemStatus.error.message}
          </AlertDescription>
        </Alert>
      )}
      {/* Loading and error states for quality report */}
      {qualityReport.isLoading && (
        <div className="flex items-center justify-center h-16">
          <span className="text-gray-500">Loading quality report...</span>
        </div>
      )}
      {qualityReport.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            Error loading quality report: {qualityReport.error.message}
          </AlertDescription>
        </Alert>
      )}
      {/* Main UI only if data is available */}
      {systemStatus.data && qualityReport.data ? (
        <div>
          {/* ...existing main UI code here... */}
          <div className="text-gray-700">Knowledge base loaded successfully.</div>
        </div>
      ) : null}
      {/* Fallback if no data and not loading or error */}
      {!systemStatus.isLoading && !systemStatus.data && !systemStatus.error && (
        <div className="flex items-center justify-center h-32">
          <span className="text-gray-400">No system status data available.</span>
        </div>
      )}
    </div>
  );
}