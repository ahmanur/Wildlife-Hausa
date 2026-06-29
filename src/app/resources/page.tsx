'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { WildSectionHeader } from '@/components/ui/WildSectionHeader';
import { FileText, Download, Image as ImageIcon, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getResources } from '@/lib/firebase/services';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { translateResource } from '@/lib/translations';

export default function ResourcesPage() {
  const { language, t, settings } = useLanguage();
  const [resources, setResources] = useState<any[]>([]);
  const [filteredResources, setFilteredResources] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Lightbox State
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadResources() {
      try {
        const fetched = await getResources();
        setResources(fetched);
        setFilteredResources(fetched);
      } catch (err) {
        console.error('Error fetching resources:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResources();
  }, []);

  const handleFilterChange = (category: string) => {
    setActiveFilter(category);
    if (category === 'All') {
      setFilteredResources(resources);
    } else {
      setFilteredResources(resources.filter(r => r.category?.toLowerCase() === category.toLowerCase()));
    }
  };

  const openLightbox = (imagesList: string[], startIndex: number) => {
    setLightboxImages(imagesList);
    setLightboxIndex(startIndex);
  };

  const closeLightbox = () => {
    setLightboxImages([]);
    setLightboxIndex(null);
  };

  const nextLightboxImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && lightboxImages.length > 0) {
      setLightboxIndex((lightboxIndex + 1) % lightboxImages.length);
    }
  };

  const prevLightboxImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && lightboxImages.length > 0) {
      setLightboxIndex((lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length);
    }
  };

  const translatedFiltered = filteredResources.map(r => translateResource(r, language));

  const filters = [
    { key: 'All', label: language === 'en' ? 'All Resources' : 'Duk Albarkatu' },
    { key: 'Reports', label: t('filter_reports', 'Trip Reports') },
    { key: 'Photos', label: t('filter_photos', 'Field Photos') }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-wild-cream">
      {/* Hero Header */}
      <section className="relative pt-32 pb-20 bg-wild-deep-forest text-wild-cream overflow-hidden">
        <div className="absolute inset-0 opacity-25" style={{
          backgroundImage: `url("${settings?.hero_images?.about || "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=2000"}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div className="relative z-10 container mx-auto px-6 max-w-4xl text-center">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6">
            {t('resources_hero_title', 'Field Trip Resources')}
          </h1>
          <p className="text-xl text-wild-sand/90 font-sans leading-relaxed max-w-2xl mx-auto">
            {t('resources_hero_subtitle', 'Access field trip reports, maps, research papers, and photographs from our expeditions.')}
          </p>
        </div>
      </section>

      {/* Filter and Resources List */}
      <section className="py-20 container mx-auto px-6 lg:px-12 max-w-6xl">
        <div className="flex flex-wrap gap-4 mb-12 border-b border-wild-forest/15 pb-8 items-center justify-center sm:justify-start">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer shadow-sm ${
                activeFilter === f.key
                  ? 'bg-wild-sunset text-white border-transparent'
                  : 'bg-white border border-wild-forest/10 text-wild-forest hover:bg-wild-forest/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-wild-sunset border-t-transparent rounded-full animate-spin" />
            <p className="text-wild-forest font-serif font-bold text-lg">{t('loading_resources', 'Loading field trip resources...')}</p>
          </div>
        ) : translatedFiltered.length === 0 ? (
          <div className="text-center py-24 text-wild-forest/50 bg-white rounded-3xl p-12 shadow-sm border border-wild-cream">
            <p className="text-lg font-serif italic">{t('no_resources_found', 'No field trip resources available yet.')}</p>
          </div>
        ) : (
          <div className="space-y-12">
            {translatedFiltered.map((res, idx) => (
              <div 
                key={res.id || idx}
                className="bg-white rounded-3xl shadow-lg border border-wild-cream p-8 md:p-12 hover:shadow-xl transition-all duration-300 flex flex-col gap-8"
              >
                {/* Header Information */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-wild-cream pb-6">
                  <div>
                    <span className="text-wild-sunset font-sans font-bold text-xs uppercase tracking-widest block mb-2">
                      {res.category}
                    </span>
                    <h2 className="font-serif text-3xl text-wild-forest font-bold">{res.title}</h2>
                  </div>
                  <div className="flex items-center gap-2 text-wild-muted text-sm shrink-0 bg-wild-sand/40 px-4 py-2 rounded-full font-medium">
                    <Calendar size={16} className="text-wild-sunset" />
                    <span>{t('trip_date', 'Trip Date')}: {res.tripDate}</span>
                  </div>
                </div>

                {/* Description and Document download */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  <div className="lg:col-span-2 space-y-6">
                    <p className="text-wild-forest/80 text-base leading-relaxed whitespace-pre-line">
                      {res.description || (language === 'en' ? 'No description available for this field trip resource.' : 'Babu bayanin wannan albarkatun.')}
                    </p>
                    {res.fileUrl && (
                      <div className="pt-2">
                        <a 
                          href={res.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 bg-wild-forest text-white hover:bg-wild-sunset hover:shadow-md px-6 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300 group cursor-pointer"
                        >
                          <FileText size={18} className="text-wild-sand group-hover:scale-110 transition-transform" />
                          <span>{t('download_report', 'Download Report')}</span>
                          <Download size={14} className="opacity-75" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Quick file status box if applicable */}
                  {!res.fileUrl && (
                    <div className="bg-wild-sand/20 rounded-2xl p-6 border border-wild-cream text-center lg:col-span-1">
                      <p className="text-xs font-semibold text-wild-forest/60 uppercase tracking-widest mb-1">Status</p>
                      <p className="text-sm font-bold text-wild-forest font-serif italic">Photo Gallery & Summary Only</p>
                    </div>
                  )}
                </div>

                {/* Photo Gallery Grid */}
                {res.images && res.images.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-wild-forest/60 uppercase tracking-widest flex items-center gap-2">
                      <ImageIcon size={14} className="text-wild-sunset" />
                      {t('view_photos', 'View Gallery')} ({res.images.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {res.images.map((img: string, iIndex: number) => (
                        <div 
                          key={iIndex}
                          onClick={() => openLightbox(res.images, iIndex)}
                          className="relative aspect-video rounded-2xl overflow-hidden border border-wild-cream cursor-zoom-in hover:border-wild-sunset/35 hover:shadow-md transition-all duration-300 group"
                        >
                          <Image 
                            src={img} 
                            alt={`${res.title} gallery thumbnail ${iIndex + 1}`} 
                            fill 
                            className="object-cover transition-transform duration-500 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Full-Screen Gallery Lightbox Overlay */}
      {lightboxIndex !== null && lightboxImages.length > 0 && (
        <div 
          onClick={closeLightbox}
          className="fixed inset-0 z-[200000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        >
          {/* Close button */}
          <button 
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow"
          >
            <X size={24} />
          </button>

          {/* Left Arrow */}
          {lightboxImages.length > 1 && (
            <button 
              onClick={prevLightboxImage}
              className="absolute left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow z-10"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* High-res Image Display */}
          <div className="relative w-full max-w-5xl aspect-video max-h-[80vh] md:max-h-[85vh]">
            <Image 
              src={lightboxImages[lightboxIndex]} 
              alt="High-resolution gallery screenshot" 
              fill 
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Right Arrow */}
          {lightboxImages.length > 1 && (
            <button 
              onClick={nextLightboxImage}
              className="absolute right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow z-10"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Image index numbering label */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-xs font-semibold select-none font-mono">
            {lightboxIndex + 1} / {lightboxImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
