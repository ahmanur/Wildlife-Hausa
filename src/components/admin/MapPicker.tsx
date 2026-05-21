"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issues in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface MapPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

// Sub-component to handle map click events
function MapEventsHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
    },
  });
  return null;
}

// Sub-component to pan the map to selected coordinates when they change from outside
function MapPanController({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lng !== null) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  // Center of Nigeria
  const defaultCenter: [number, number] = [9.082, 8.675];
  const markerPosition: [number, number] | null = lat !== null && lng !== null ? [lat, lng] : null;

  return (
    <div className="w-full h-80 rounded-lg overflow-hidden border border-gray-300 relative z-0">
      <MapContainer
        center={markerPosition || defaultCenter}
        zoom={6}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventsHandler onChange={onChange} />
        {markerPosition && <MapPanController lat={lat} lng={lng} />}
        {markerPosition && <Marker position={markerPosition} />}
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-[400] bg-white/90 px-2 py-1 text-[10px] text-gray-600 rounded border shadow-sm">
        Click on the map to set or update coordinates.
      </div>
    </div>
  );
}
