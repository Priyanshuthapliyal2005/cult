'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation, Clock, MapPin, Route } from 'lucide-react';
import MapSearch from './MapSearch';

interface RoutePoint {
  lat: number;
  lng: number;
  name: string;
  type: 'start' | 'waypoint' | 'end';
}

interface RouteInfo {
  distance: number;
  duration: number;
  instructions: string[];
}

interface RouteMapperProps {
  center: [number, number];
  zoom?: number;
  height?: string;
}

// Route calculation component
function RouteCalculator({ points, onRouteCalculated }: {
  points: RoutePoint[];
  onRouteCalculated: (coordinates: [number, number][], info: RouteInfo) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (points.length >= 2) {
      calculateRoute();
    }
  }, [points]);

  const calculateRoute = async () => {
    if (points.length < 2) return;

    try {
      // Create coordinate string for routing service
      const coordinates = points.map(p => `${p.lng},${p.lat}`).join(';');
      
      // Using OSRM demo server (in production, use your own server)
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
        
        const routeInfo: RouteInfo = {
          distance: Math.round(route.distance / 1000 * 10) / 10, // km
          duration: Math.round(route.duration / 60), // minutes
          instructions: route.legs.flatMap((leg: any) => 
            leg.steps.map((step: any) => step.maneuver.instruction)
          )
        };
        
        onRouteCalculated(coordinates, routeInfo);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      // Fallback to straight line
      const coordinates = points.map(p => [p.lat, p.lng] as [number, number]);
      const fallbackInfo: RouteInfo = {
        distance: 0,
        duration: 0,
        instructions: ['Route calculation unavailable - showing direct path']
      };
      onRouteCalculated(coordinates, fallbackInfo);
    }
  };

  return null;
}

export default function RouteMapper({ center, zoom = 13, height = '500px' }: RouteMapperProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const addRoutePoint = (lat: number, lng: number, name: string) => {
    const type = routePoints.length === 0 ? 'start' : 'waypoint';
    const newPoint: RoutePoint = { lat, lng, name, type };
    
    if (routePoints.length > 0) {
      // Update the last point to be a waypoint and make this the end
      const updatedPoints = routePoints.map((point, index) => 
        index === routePoints.length - 1 ? { ...point, type: 'waypoint' as const } : point
      );
      setRoutePoints([...updatedPoints, { ...newPoint, type: 'end' }]);
    } else {
      setRoutePoints([newPoint]);
    }
  };

  const removeRoutePoint = (index: number) => {
    const newPoints = routePoints.filter((_, i) => i !== index);
    // Update types
    if (newPoints.length > 0) {
      newPoints[0].type = 'start';
      if (newPoints.length > 1) {
        newPoints[newPoints.length - 1].type = 'end';
        newPoints.slice(1, -1).forEach(point => point.type = 'waypoint');
      }
    }
    setRoutePoints(newPoints);
  };

  const clearRoute = () => {
    setRoutePoints([]);
    setRouteCoordinates([]);
    setRouteInfo(null);
  };

  const getMarkerIcon = (type: string) => {
    const colors = {
      start: '#10b981',
      waypoint: '#3b82f6', 
      end: '#ef4444'
    };
    
    const icons = {
      start: '🚩',
      waypoint: '📍',
      end: '🏁'
    };
    
    return L.divIcon({
      className: 'custom-route-marker',
      html: `
        <div style="
          background-color: ${colors[type as keyof typeof colors]};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          font-size: 14px;
        ">
          ${icons[type as keyof typeof icons]}
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  if (!isMounted) {
    return (
      <div 
        className="w-full bg-gray-100 rounded-lg animate-pulse flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-gray-500 flex items-center space-x-2">
          <Route className="w-5 h-5" />
          <span>Loading route mapper...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Route Planning Controls */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Route className="w-5 h-5 mr-2" />
              Plan Your Route
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MapSearch
              onLocationSelect={addRoutePoint}
              placeholder="Add destination..."
            />
            
            <div className="flex space-x-2">
              <Button 
                onClick={() => setIsPlanning(!isPlanning)}
                variant={isPlanning ? "default" : "outline"}
                className="flex-1"
              >
                {isPlanning ? 'Stop Planning' : 'Start Planning'}
              </Button>
              <Button 
                onClick={clearRoute} 
                variant="outline"
                disabled={routePoints.length === 0}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Route Information */}
        {routeInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Navigation className="w-5 h-5 mr-2" />
                Route Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {routeInfo.distance} km
                  </div>
                  <div className="text-sm text-gray-500">Distance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {routeInfo.duration} min
                  </div>
                  <div className="text-sm text-gray-500">Duration</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Waypoints:</h4>
                {routePoints.map((point, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        point.type === 'start' ? 'default' : 
                        point.type === 'end' ? 'destructive' : 'secondary'
                      }>
                        {point.type}
                      </Badge>
                      <span className="truncate">{point.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeRoutePoint(index)}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Route Map */}
      <Card>
        <CardContent className="p-0">
          <div className="relative w-full rounded-lg overflow-hidden">
            <MapContainer
              center={center}
              zoom={zoom}
              style={{ height, width: '100%' }}
              className="rounded-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Route Calculation */}
              <RouteCalculator 
                points={routePoints}
                onRouteCalculated={(coords, info) => {
                  setRouteCoordinates(coords);
                  setRouteInfo(info);
                }}
              />
              
              {/* Route Line */}
              {routeCoordinates.length > 0 && (
                <Polyline
                  positions={routeCoordinates}
                  pathOptions={{
                    color: '#3b82f6',
                    weight: 4,
                    opacity: 0.8
                  }}
                />
              )}
              
              {/* Route Points */}
              {routePoints.map((point, index) => (
                <Marker
                  key={index}
                  position={[point.lat, point.lng]}
                  icon={getMarkerIcon(point.type)}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">{point.name}</h3>
                      <Badge variant="outline" className="mt-1">
                        {point.type}
                      </Badge>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {/* Click to add points when planning */}
              {isPlanning && (
                <div className="absolute top-4 left-4 z-[1000]">
                  <Card className="p-2">
                    <div className="text-sm text-blue-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Click on map to add waypoints
                    </div>
                  </Card>
                </div>
              )}
            </MapContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}