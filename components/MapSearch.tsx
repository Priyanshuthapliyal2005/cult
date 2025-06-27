'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

interface MapSearchProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void;
  placeholder?: string;
  className?: string;
}

export default function MapSearch({ 
  onLocationSelect, 
  placeholder = "Search for places...", 
  className = "" 
}: MapSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Debounced search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.length > 2) {
        searchLocations(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [query]);

  const searchLocations = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5&countrycodes=in&addressdetails=1`
      );
      const data = await response.json();
      setResults(data);
      setIsOpen(data.length > 0);
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onLocationSelect(lat, lng, result.display_name);
    setQuery(result.display_name.split(',')[0]);
    setIsOpen(false);
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onLocationSelect(latitude, longitude, 'Current Location');
          setQuery('Current Location');
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get current location');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser');
    }
  };

  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-12"
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-8 w-8 p-0"
          onClick={getCurrentLocation}
          title="Use current location"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-3 text-center text-sm text-gray-500">
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y">
                {results.map((result, index) => (
                  <button
                    key={index}
                    className="w-full p-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    onClick={() => handleLocationSelect(result)}
                  >
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {result.display_name.split(',')[0]}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {result.display_name.split(',').slice(1).join(',').trim()}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center text-sm text-gray-500">
                No results found
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}