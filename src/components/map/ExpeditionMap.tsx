"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map client component with SSR disabled
// because Leaflet relies on the window object.
const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-wild-sand/50 rounded-xl animate-pulse">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-wild-sunset border-t-transparent rounded-full animate-spin" />
        <p className="text-wild-forest font-serif font-bold text-xl">Drawing the expedition map...</p>
      </div>
    </div>
  ),
});

export function ExpeditionMap() {
  return (
    <div className="w-full h-[600px] md:h-[700px] rounded-xl overflow-hidden shadow-xl border-4 border-white relative z-0">
      <MapClient />
    </div>
  );
}
