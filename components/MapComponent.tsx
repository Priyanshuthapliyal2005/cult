'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  center: [number, number];
  zoom?: number;
  destinations: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    description: string;
    culture: string;
  }>;
}

export default function MapComponent({ center, zoom = 13, destinations }: MapComponentProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full h-96 bg-gray-100 rounded-lg animate-pulse" />;
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {destinations.map((destination) => (
          <Marker
            key={destination.id}
            position={[destination.latitude, destination.longitude]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{destination.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{destination.description}</p>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {destination.culture}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}