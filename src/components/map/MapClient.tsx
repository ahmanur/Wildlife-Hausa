"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Image from 'next/image';
import { WildCTA } from '../ui/WildCTA';
import { Compass, Camera, Leaf, Tent, Map as MapIcon, X } from 'lucide-react';
import { getMapLocations } from '@/lib/firebase/services';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { translateMapLocation } from '@/lib/translations';

// Fix for default marker icon issues in Leaflet with Webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Wild Hausa Icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-wild-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const icons = {
  safari: createCustomIcon('#F58220'), // Sunset Orange
  conservation: createCustomIcon('#3F5D3A'), // Moss Green
  adventure: createCustomIcon('#7A4B2A'), // Clay Brown
  film: createCustomIcon('#1D1A16'), // Charcoal
};

export default function MapClient() {
  const { language } = useLanguage();
  const [locations, setLocations] = useState<any[]>([]);
  const [activeLocation, setActiveLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLocations() {
      try {
        const fetched = await getMapLocations();
        setLocations(fetched);
      } catch (err) {
        console.error('Error fetching map locations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLocations();
  }, []);

  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 bg-wild-cream/50 z-[30] flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 border-4 border-wild-sunset border-t-transparent rounded-full animate-spin" />
          <p className="text-wild-forest text-xs font-bold uppercase tracking-wider">Loading Map Data...</p>
        </div>
      )}

      <MapContainer 
        center={[10.5, 8.5]} 
        zoom={6} 
        style={{ width: '100%', height: '100%', zIndex: 10 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />

        {locations.map(rawLoc => {
          const loc = translateMapLocation(rawLoc, language);
          return (
          <Marker 
            key={loc.id} 
            position={[loc.lat, loc.lng]} 
            icon={icons[loc.type as keyof typeof icons] || icons.safari}
            eventHandlers={{
              click: () => setActiveLocation(loc),
            }}
          >
            {/* We disable the default popup in favor of our custom MapStoryDrawer, 
                but keeping it here as a fallback or for simple hover tooltips if needed later */}
          </Marker>
          );
        })}
      </MapContainer>

      {/* Map Story Drawer */}
      {activeLocation && (
        <div className="absolute top-4 left-4 z-[20] w-80 bg-white rounded-xl shadow-2xl overflow-hidden border border-wild-cream transition-all animate-in fade-in slide-in-from-left-4">
          <div className="relative h-40 w-full">
            <Image src={activeLocation.image} alt={activeLocation.title} fill className="object-cover" />
            <button 
              onClick={() => setActiveLocation(null)}
              className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-5">
            <div className="inline-block mb-2 px-2 py-0.5 bg-wild-sand text-wild-forest text-[10px] font-bold tracking-widest uppercase rounded">
              {activeLocation.category}
            </div>
            <h3 className="font-serif text-xl text-wild-forest font-bold mb-1 leading-tight">{activeLocation.title}</h3>
            <p className="text-xs text-wild-muted flex items-center gap-1 mb-3">
              <MapIcon size={12} /> {activeLocation.state}
            </p>
            <p className="text-sm text-wild-charcoal leading-relaxed mb-4">
              {activeLocation.description}
            </p>
            <a href={activeLocation.link} className="block w-full text-center py-2 bg-wild-sunset hover:bg-wild-sun-soft text-white text-sm font-bold rounded-lg transition-colors">
              {activeLocation.cta}
            </a>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[20] bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-wild-sand">
        <h4 className="font-bold text-xs text-wild-forest uppercase tracking-wider mb-2">Legend</h4>
        <div className="space-y-1 text-xs text-wild-charcoal">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-wild-sunset" /> Safari Route</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-wild-moss" /> Conservation Site</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-wild-brown" /> Adventure Ground</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-wild-charcoal" /> Film Location</div>
        </div>
      </div>
    </div>
  );
}
