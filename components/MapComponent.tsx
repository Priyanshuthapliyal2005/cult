'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Layers, Search, Route, Star } from 'lucide-react';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="transform: rotate(45deg); color: white; font-size: 14px;">
          ${icon}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const markerIcons = {
  temple: createCustomIcon('#9333ea', '🕉️'),
  restaurant: createCustomIcon('#ef4444', '🍽️'),
  attraction: createCustomIcon('#3b82f6', '📍'),
  hotel: createCustomIcon('#10b981', '🏨'),
  transport: createCustomIcon('#f59e0b', '🚌'),
  shopping: createCustomIcon('#ec4899', '🛒'),
  default: createCustomIcon('#6b7280', '📍')
};

interface MapDestination {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  culture?: string;
  type?: 'temple' | 'restaurant' | 'attraction' | 'hotel' | 'transport' | 'shopping';
  rating?: number;
  image?: string;
}

interface MapComponentProps {
  center: [number, number];
  zoom?: number;
  destinations: MapDestination[];
  height?: string;
  showControls?: boolean;
  showSearch?: boolean;
  onLocationClick?: (lat: number, lng: number) => void;
  clustered?: boolean;
}

// Map controls component
function MapControls({ onLayerChange, onLocationFound }: { 
  onLayerChange: (layer: string) => void;
  onLocationFound: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  const [currentLayer, setCurrentLayer] = useState('streets');

  const layers = {
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  };

  const handleLayerChange = (layerType: string) => {
    setCurrentLayer(layerType);
    onLayerChange(layerType);
    
    // Remove all tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });
    
    // Add new tile layer
    L.tileLayer(layers[layerType as keyof typeof layers], {
      attribution: layerType === 'satellite' 
        ? '&copy; Esri' 
        : layerType === 'terrain'
        ? '&copy; OpenTopoMap'
        : '&copy; OpenStreetMap contributors'
    }).addTo(map);
  };

  const handleGeolocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 15);
          onLocationFound(latitude, longitude);
          
          // Add current location marker
          L.marker([latitude, longitude], {
            icon: createCustomIcon('#ef4444', '📍')
          })
          .addTo(map)
          .bindPopup('Your current location')
          .openPopup();
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] space-y-2">
      <Card className="p-2">
        <div className="flex flex-col space-y-2">
          <div className="flex space-x-1">
            {Object.keys(layers).map((layerType) => (
              <Button
                key={layerType}
                size="sm"
                variant={currentLayer === layerType ? "default" : "outline"}
                onClick={() => handleLayerChange(layerType)}
                className="px-2 py-1 text-xs"
              >
                {layerType === 'streets' && '🗺️'}
                {layerType === 'satellite' && '🛰️'}
                {layerType === 'terrain' && '⛰️'}
                {layerType === 'dark' && '🌙'}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGeolocation}
            className="w-full"
          >
            <Navigation className="w-3 h-3 mr-1" />
            My Location
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Map events handler
function MapEvents({ onLocationClick }: { onLocationClick?: ((lat: number, lng: number) => void) | undefined }) {
  const map = useMap();
  
  useEffect(() => {
    if (!onLocationClick) return;
    
    const handleClick = (e: L.LeafletMouseEvent) => {
      onLocationClick(e.latlng.lat, e.latlng.lng);
    };
    
    map.on('click', handleClick);
    
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onLocationClick]);
  
  return null;
}

// Enhanced popup content
function DestinationPopup({ destination }: { destination: MapDestination }) {
  return (
    <div className="p-3 min-w-[200px]">
      {destination.image && (
        <img 
          src={destination.image} 
          alt={destination.name}
          className="w-full h-24 object-cover rounded-lg mb-2"
        />
      )}
      <h3 className="font-semibold text-lg mb-1">{destination.name}</h3>
      <p className="text-sm text-gray-600 mb-2">{destination.description}</p>
      
      <div className="flex flex-wrap gap-1 mb-2">
        {destination.culture && (
          <Badge variant="secondary" className="text-xs">
            {destination.culture}
          </Badge>
        )}
        {destination.type && (
          <Badge variant="outline" className="text-xs">
            {destination.type}
          </Badge>
        )}
      </div>
      
      {destination.rating && (
        <div className="flex items-center space-x-1 mb-2">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{destination.rating}</span>
        </div>
      )}
      
      <div className="flex space-x-2 mt-3">
        <Button size="sm" className="text-xs">
          <Route className="w-3 h-3 mr-1" />
          Directions
        </Button>
        <Button size="sm" variant="outline" className="text-xs">
          More Info
        </Button>
      </div>
    </div>
  );
}

export default function MapComponent({ 
  center, 
  zoom = 13, 
  destinations, 
  height = '400px',
  showControls = true,
  showSearch = false,
  onLocationClick,
  clustered = false 
}: MapComponentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentLayer, setCurrentLayer] = useState('streets');
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLayerChange = (layer: string) => {
    setCurrentLayer(layer);
  };

  const handleLocationFound = (lat: number, lng: number) => {
    console.log('Location found:', lat, lng);
  }; 

  if (!isMounted) {
    return (
      <div 
        className="w-full bg-gray-100 rounded-lg animate-pulse flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-gray-500 flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>Loading interactive map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height, width: '100%' }}
        className="rounded-lg"
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Map Events */}
        <MapEvents onLocationClick={onLocationClick} />
        
        {/* Destination Markers */}
        {destinations.map((destination) => {
          const icon = markerIcons[destination.type || 'default'];
          
          return (
            <Marker
              key={destination.id}
              position={[destination.latitude, destination.longitude]}
              icon={icon}
            >
              <Popup maxWidth={300} className="custom-popup">
                <DestinationPopup destination={destination} />
              </Popup>
            </Marker>
          );
        })}
        
        {/* Map Controls */}
        {showControls && (
          <MapControls 
            onLayerChange={handleLayerChange}
            onLocationFound={handleLocationFound}
          />
        )}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <Card className="p-3">
          <h4 className="text-xs font-semibold mb-2">Legend</h4>
          <div className="space-y-1">
            {Object.entries(markerIcons).slice(0, -1).map(([type, icon]) => (
              <div key={type} className="flex items-center space-x-2 text-xs">
                <div className="w-4 h-4 flex items-center justify-center">
                  <div dangerouslySetInnerHTML={{ __html: icon.options.html }} 
                       style={{ transform: 'scale(0.5)' }} />
                </div>
                <span className="capitalize">{type}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      {/* Search Bar */}
      {showSearch && (
        <div className="absolute top-4 left-4 z-[1000]">
          <Card className="p-2">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search locations..."
                className="border-none outline-none text-sm bg-transparent"
              />
            </div>
          </Card>
        </div>
      )}
      
      {/* Map Info */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <Card className="p-2">
          <div className="text-xs text-gray-600">
            {destinations.length} location{destinations.length !== 1 ? 's' : ''} • {currentLayer} view
          </div>
        </Card>
      </div>
    </div>
  );
}