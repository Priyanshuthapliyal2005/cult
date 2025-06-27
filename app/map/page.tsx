'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Route, Search, Layers, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MapComponent from '@/components/MapComponent';
import RouteMapper from '@/components/RouteMapper';
import MapSearch from '@/components/MapSearch';
import Link from 'next/link';

// Enhanced destination data with more details
const destinations = [
  {
    id: 1,
    name: 'Brahma Temple',
    latitude: 26.4899,
    longitude: 74.5511,
    description: 'One of the few temples dedicated to Lord Brahma in the world',
    culture: 'Sacred & Spiritual',
    type: 'temple' as const,
    rating: 4.8,
    image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 2,
    name: 'Pushkar Lake',
    latitude: 26.4902,
    longitude: 74.5514,
    description: 'Holy lake surrounded by 52 ghats, perfect for spiritual reflection',
    culture: 'Sacred & Spiritual',
    type: 'attraction' as const,
    rating: 4.7,
    image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 3,
    name: 'Sunset Cafe',
    latitude: 26.4895,
    longitude: 74.5508,
    description: 'Rooftop dining with stunning lake views and traditional thali',
    culture: 'Culinary',
    type: 'restaurant' as const,
    rating: 4.5,
    image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 4,
    name: 'Laxman Jhula',
    latitude: 30.0869,
    longitude: 78.2676,
    description: 'Iconic suspension bridge over the Ganges in Rishikesh',
    culture: 'Spiritual & Adventure',
    type: 'attraction' as const,
    rating: 4.6,
    image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 5,
    name: 'Beatles Ashram',
    latitude: 30.0895,
    longitude: 78.2845,
    description: 'Historic ashram where The Beatles stayed in 1968',
    culture: 'Historical',
    type: 'attraction' as const,
    rating: 4.4,
    image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 6,
    name: 'Mall Road Mussoorie',
    latitude: 30.4598,
    longitude: 78.0664,
    description: 'Main shopping street with colonial architecture',
    culture: 'Colonial & Shopping',
    type: 'shopping' as const,
    rating: 4.3,
    image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 7,
    name: 'Gun Hill',
    latitude: 30.4615,
    longitude: 78.0642,
    description: 'Second highest peak with cable car and panoramic views',
    culture: 'Scenic Views',
    type: 'attraction' as const,
    rating: 4.5,
    image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState<[number, number]>([26.4899, 74.5511]);
  const [selectedLocationName, setSelectedLocationName] = useState('Pushkar, Rajasthan');
  const [mapCenter, setMapCenter] = useState<[number, number]>([26.4899, 74.5511]);

  const handleLocationSelect = (lat: number, lng: number, name: string) => {
    setSelectedLocation([lat, lng]);
    setSelectedLocationName(name);
    setMapCenter([lat, lng]);
  };

  const handleMapClick = (lat: number, lng: number) => {
    console.log('Map clicked:', lat, lng);
    // You can add functionality here for interactive map clicks
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
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">Interactive Maps</h1>
              <p className="text-sm text-gray-500">Explore destinations with advanced mapping</p>
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
          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Interactive Cultural Maps
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore destinations with enhanced mapping features including route planning, 
              location search, and detailed cultural points of interest.
            </p>
          </div>

          {/* Location Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Search & Navigate
              </CardTitle>
              <CardDescription>
                Search for any location or use current location to explore nearby cultural sites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-1">
                  <MapSearch
                    onLocationSelect={handleLocationSelect}
                    placeholder="Search for cities, landmarks, or addresses..."
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Current:</strong> {selectedLocationName}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Tabs */}
          <Tabs defaultValue="explore" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="explore" className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Explore
              </TabsTrigger>
              <TabsTrigger value="route" className="flex items-center">
                <Route className="w-4 h-4 mr-2" />
                Route Planning
              </TabsTrigger>
              <TabsTrigger value="layers" className="flex items-center">
                <Layers className="w-4 h-4 mr-2" />
                Map Layers
              </TabsTrigger>
            </TabsList>

            {/* Explore Tab */}
            <TabsContent value="explore" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cultural Destinations Map</CardTitle>
                  <CardDescription>
                    Interactive map showing temples, attractions, restaurants, and cultural sites
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MapComponent
                    center={mapCenter}
                    zoom={12}
                    destinations={destinations}
                    height="600px"
                    showControls={true}
                    showSearch={true}
                    onLocationClick={handleMapClick}
                  />
                </CardContent>
              </Card>

              {/* Destination Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{destinations.length}</div>
                    <div className="text-sm text-gray-500">Cultural Sites</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">3</div>
                    <div className="text-sm text-gray-500">Cities Covered</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">5+</div>
                    <div className="text-sm text-gray-500">Categories</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Route Planning Tab */}
            <TabsContent value="route" className="space-y-4">
              <RouteMapper
                center={mapCenter}
                zoom={10}
                height="600px"
              />
            </TabsContent>

            {/* Map Layers Tab */}
            <TabsContent value="layers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Map Features</CardTitle>
                  <CardDescription>
                    Explore different map styles and layer options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MapComponent
                    center={mapCenter}
                    zoom={12}
                    destinations={destinations.slice(0, 3)} // Show fewer markers for layer demo
                    height="600px"
                    showControls={true}
                  />
                  
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Available Map Styles</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>🗺️ Streets - Standard OpenStreetMap view</li>
                        <li>🛰️ Satellite - High-resolution aerial imagery</li>
                        <li>⛰️ Terrain - Topographic with elevation details</li>
                        <li>🌙 Dark - Dark theme for night viewing</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Interactive Features</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>📍 Custom markers by category</li>
                        <li>🔍 Location search with autocomplete</li>
                        <li>📱 Geolocation support</li>
                        <li>🗂️ Detailed popups with images</li>
                        <li>🎯 Click-to-add waypoints</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Features Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="p-4">
                <MapPin className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <h3 className="font-semibold mb-1">Custom Markers</h3>
                <p className="text-sm text-gray-600">Category-specific icons for easy identification</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Route className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <h3 className="font-semibold mb-1">Route Planning</h3>
                <p className="text-sm text-gray-600">Plan multi-stop journeys with turn-by-turn directions</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Search className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                <h3 className="font-semibold mb-1">Smart Search</h3>
                <p className="text-sm text-gray-600">Find locations with intelligent autocomplete</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Layers className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                <h3 className="font-semibold mb-1">Multiple Layers</h3>
                <p className="text-sm text-gray-600">Switch between satellite, terrain, and street views</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}