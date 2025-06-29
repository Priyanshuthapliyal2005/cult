'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Navigation, Star, DollarSign } from 'lucide-react';
import { getCitiesByFilter, getNearbyCities, type CityData } from '@/lib/cityDatabase';
import { useTranslations } from 'next-intl';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on city characteristics
const createCityIcon = (city: CityData) => {
  const getColorByCostLevel = (level: string) => {
    switch (level) {
      case 'budget': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'expensive': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getIcon = (culture: string) => {
    if (culture.includes('Sacred') || culture.includes('Spiritual')) return '🕉️';
    if (culture.includes('Colonial')) return '🏛️';
    if (culture.includes('Royal')) return '👑';
    if (culture.includes('Coastal')) return '🏖️';
    if (culture.includes('Mountain')) return '⛰️';
    if (culture.includes('Traditional')) return '🏮';
    return '🏙️';
  };

  return L.divIcon({
    className: 'custom-city-marker',
    html: `
      <div style="
        background-color: ${getColorByCostLevel(city.costLevel)};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          transform: rotate(45deg); 
          font-size: 16px;
          line-height: 1;
        ">
          ${getIcon(city.culture)}
        </div>
        <div style="
          position: absolute;
          bottom: -8px;
          right: -8px;
          background: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          color: #333;
          transform: rotate(45deg);
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        ">
          ${city.rating}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

interface DynamicCityMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  onCitySelect?: (city: CityData) => void;
  selectedCityId?: string;
  showSearch?: boolean;
  showNearby?: boolean;
  filters?: {
    country?: string;
    costLevel?: 'budget' | 'moderate' | 'expensive';
    minRating?: number;
  };
}

// Map event handler for clicks
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  const map = useMap();
  
  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };
    
    map.on('click', handleClick);
    
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);
  
  /* This causes a type error in React Leaflet
  const events = useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  */
  
  return null;
}

// Component to handle map center updates
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

// Enhanced popup content for cities
function CityPopup({ city, onSelect }: { city: CityData; onSelect?: (city: CityData) => void }) {
  const t = useTranslations();
  
  return (
    <div className="p-3 min-w-[280px] max-w-[320px]">
      <div className="mb-3">
        <img 
          src={city.image} 
          alt={city.name}
          className="w-full h-32 object-cover rounded-lg"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900">{city.name}</h3>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{city.rating}</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600">{city.description}</p>
        
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {city.culture}
          </Badge>
          <Badge 
            variant="outline" 
            className={`text-xs ${
              city.costLevel === 'budget' ? 'border-green-500 text-green-700' :
              city.costLevel === 'moderate' ? 'border-yellow-500 text-yellow-700' :
              'border-red-500 text-red-700'
            }`}
          >
            {city.costLevel}
          </Badge>
        </div>
        
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            {city.region}, {city.country}
          </div>
          <div className="flex items-center">
            <DollarSign className="w-3 h-3 mr-1" />
            {city.currency} • Population: {city.population.toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Languages:</span> {city.language.join(', ')}
          </div>
          <div>
            <span className="font-medium">Best time:</span> {city.bestTimeToVisit.slice(0, 3).join(', ')}
          </div>
        </div>
        
        <div className="text-xs">
          <span className="font-medium">Highlights:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {city.highlights.slice(0, 3).map((highlight, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {highlight}
              </span>
            ))}
          </div>
        </div>
        
        {onSelect && (
          <div className="flex space-x-2 mt-3 pt-3 border-t">
            <Button size="sm" onClick={() => onSelect(city)} className="flex-1">
              Explore {city.name}
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              Plan Trip
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DynamicCityMap({
  center = [20.5937, 78.9629], // Default center of India
  zoom = 5,
  height = '600px',
  onCitySelect,
  selectedCityId,
  showSearch = true,
  showNearby = true,
  filters = {}
}: DynamicCityMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [cities, setCities] = useState<CityData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [nearbyCities, setNearbyCities] = useState<CityData[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const t = useTranslations();

  useEffect(() => {
    setIsMounted(true);
    // Load all cities with applied filters
    loadCities();
  }, [filters]);

  useEffect(() => {
    if (selectedCityId) {
      const city = cities.find(c => c.id === selectedCityId);
      if (city) {
        setMapCenter([city.latitude, city.longitude]);
        setMapZoom(12);
        setSelectedCity(city);
      }
    }
  }, [selectedCityId, cities]);

  const loadCities = () => {
    const filteredCities = getCitiesByFilter({
      ...filters,
      searchTerm: searchTerm || undefined
    });
    setCities(filteredCities);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCities();
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (showNearby) {
      const nearby = getNearbyCities(lat, lng, 50); // 50km radius
      setNearbyCities(nearby);
      setMapCenter([lat, lng]);
    }
  };

  const handleCitySelect = (city: CityData) => {
    setSelectedCity(city);
    setMapCenter([city.latitude, city.longitude]);
    setMapZoom(12);
    if (onCitySelect) {
      onCitySelect(city);
    }
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation?.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          setMapZoom(10);
          
          // Find nearby cities
          if (showNearby) {
            const nearby = getNearbyCities(latitude, longitude, 100);
            setNearbyCities(nearby);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get current location');
        }
      );
    }
  };

  const getCostLevelColor = (level: string) => {
    switch (level) {
      case 'budget': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'expensive': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isMounted) {
    return (
      <div 
        className="w-full bg-gray-100 rounded-lg animate-pulse flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-gray-500 flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>Loading interactive city map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Search and Controls */}
      {showSearch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Discover Cities Worldwide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex space-x-2 mb-4">
              <Input
                type="text"
                placeholder="Search cities, countries, or cultures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button type="button" variant="outline" onClick={getCurrentLocation}>
                <Navigation className="w-4 h-4 mr-2" />
                My Location
              </Button>
            </form>
            
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">🏛️ Cultural</Badge>
              <Badge variant="outline">⛰️ Mountain</Badge>
              <Badge variant="outline">🏖️ Coastal</Badge>
              <Badge variant="outline">🕉️ Spiritual</Badge>
              <Badge variant="outline" className="text-green-600">💰 Budget</Badge>
              <Badge variant="outline" className="text-yellow-600">💰 Moderate</Badge>
              <Badge variant="outline" className="text-red-600">💰 Luxury</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Container */}
      <div className="relative w-full rounded-lg overflow-hidden border shadow-lg">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height, width: '100%' }}
          className="rounded-lg"
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapCenterUpdater center={mapCenter} />
          <MapClickHandler onMapClick={handleMapClick} />
          
          {/* City Markers */}
          {cities.map((city) => (
            <Marker
              key={city.id}
              position={[city.latitude, city.longitude]}
              icon={createCityIcon(city)}
            >
              <Popup maxWidth={350} className="custom-popup">
                <CityPopup city={city} onSelect={handleCitySelect} />
              </Popup>
            </Marker>
          ))}
          
          {/* Nearby Cities (if any) */}
          {nearbyCities.map((city) => (
            <Marker
              key={`nearby-${city.id}`}
              position={[city.latitude, city.longitude]}
              icon={createCityIcon(city)}
              opacity={0.7}
            >
              <Popup maxWidth={350}>
                <CityPopup city={city} onSelect={handleCitySelect} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Map Legend */}
        <div className="absolute top-4 right-4 z-[1000]">
          <Card className="p-3">
            <h4 className="text-xs font-semibold mb-2">City Types</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span>Budget-friendly</span>
              </div> 
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span>Moderate cost</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span>Luxury destination</span>
              </div> 
            </div>
          </Card>
        </div>
        
        {/* Selected City Info */}
        {selectedCity && (
          <div className="absolute bottom-4 left-4 z-[1000]">
            <Card className="p-3 max-w-xs">
              <div className="flex items-center space-x-2 mb-2">
                <img 
                  src={selectedCity.image} 
                  alt={selectedCity.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <h4 className="font-semibold text-sm">{selectedCity.name}</h4>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs">{selectedCity.rating}</span>
                    <Badge className={`text-xs ${getCostLevelColor(selectedCity.costLevel || 'moderate')}`}>
                      {selectedCity.costLevel}
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-2">{selectedCity.description}</p>
              <Button size="sm" className="w-full text-xs" onClick={() => handleCitySelect(selectedCity)}>
                Explore Details
              </Button>
            </Card>
          </div>
        )}
        
        {/* Statistics */}
        <div className="absolute bottom-4 right-4 z-[1000]">
          <Card className="p-2">
            <div className="text-xs text-gray-600">
              <div>{cities.length} cities displayed</div>
              <div>Click anywhere to find nearby</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}