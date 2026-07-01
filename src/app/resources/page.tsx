'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { WildSectionHeader } from '@/components/ui/WildSectionHeader';
import { FileText, Download, Image as ImageIcon, Calendar, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { getResources } from '@/lib/firebase/services';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { translateResource } from '@/lib/translations';

export default function ResourcesPage() {
  const { language, t, settings } = useLanguage();
  const [resources, setResources] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Lightbox State
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadResources() {
      try {
        const fetched = await getResources();
        setResources(fetched);
      } catch (err) {
        console.error('Error fetching resources:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResources();
  }, []);

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

  // Get all unique years from resources for the filter dropdown
  const uniqueYears = Array.from(
    new Set(
      resources
        .map(res => (res.tripDate ? res.tripDate.substring(0, 4) : null))
        .filter(Boolean)
    )
  ).sort((a: any, b: any) => b - a);

  // Filter resources dynamically
  const displayResources = resources.filter(res => {
    // 1. Category Filter
    if (activeFilter !== 'All') {
      const matchCat = activeFilter === 'Reports' ? 'reports' : (activeFilter === 'Photos' ? 'photos' : 'downloads');
      if (res.category?.toLowerCase() !== matchCat) return false;
    }
    
    // 2. Year Filter
    if (selectedYear !== 'All') {
      const itemYear = res.tripDate?.substring(0, 4);
      if (itemYear !== selectedYear) return false;
    }
    
    // 3. Search Filter
    if (searchQuery.trim() !== '') {
      const queryLower = searchQuery.toLowerCase();
      const titleMatch = res.title?.toLowerCase().includes(queryLower) || res.title_ha?.toLowerCase().includes(queryLower);
      const descMatch = res.description?.toLowerCase().includes(queryLower) || res.description_ha?.toLowerCase().includes(queryLower);
      const catMatch = res.category?.toLowerCase().includes(queryLower) || res.category_ha?.toLowerCase().includes(queryLower);
      if (!titleMatch && !descMatch && !catMatch) return false;
    }
    
    return true;
  });

  // Translate filtered resources
  const translatedFiltered = displayResources.map(r => translateResource(r, language));

  // Group translated resources by year
  const resourcesByYear: Record<string, any[]> = {};
  translatedFiltered.forEach(res => {
    const year = res.tripDate ? res.tripDate.substring(0, 4) : 'Other';
    if (!resourcesByYear[year]) {
      resourcesByYear[year] = [];
    }
    resourcesByYear[year].push(res);
  });

  // Sort years in descending order
  const sortedYears = Object.keys(resourcesByYear).sort((a, b) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return b.localeCompare(a);
  });

  const filters = [
    { key: 'All', label: language === 'en' ? 'All Resources' : 'Duk Albarkatu' },
    { key: 'Reports', label: t('filter_reports', 'Reports') },
    { key: 'Photos', label: t('filter_photos', 'Gallery') },
    { key: 'Downloads', label: t('filter_downloads', 'Downloads') }
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
        
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-wild-forest/15 pb-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-3 items-center">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
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

          {/* Search and Year Select */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wild-forest/40 w-4 h-4" />
              <input
                type="text"
                placeholder={language === 'en' ? "Search resources..." : "Nemi albarkatu..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-wild-forest/10 rounded-full text-sm text-wild-forest focus:outline-none focus:border-wild-sunset focus:ring-1 focus:ring-wild-sunset shadow-sm"
              />
            </div>
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white border border-wild-forest/10 text-wild-forest text-sm font-semibold rounded-full px-5 py-2.5 outline-none focus:border-wild-sunset focus:ring-1 focus:ring-wild-sunset shadow-sm cursor-pointer"
            >
              <option value="All">{language === 'en' ? "All Years" : "Duk Shekaru"}</option>
              {uniqueYears.map((yr: any) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-wild-sunset border-t-transparent rounded-full animate-spin" />
            <p className="text-wild-forest font-serif font-bold text-lg">{t('loading_resources', 'Loading field trip resources...')}</p>
          </div>
        ) : sortedYears.length === 0 ? (
          <div className="text-center py-24 text-wild-forest/50 bg-white rounded-3xl p-12 shadow-sm border border-wild-cream">
            <p className="text-lg font-serif italic">{t('no_resources_found', 'No field trip resources available yet.')}</p>
          </div>
        ) : (
          <div className="divide-y divide-wild-forest/10 border-t border-b border-wild-forest/10">
            {sortedYears.map((year) => (
              <React.Fragment key={year}>
                {resourcesByYear[year].map((res: any, idx: number) => {
                  const hasImages = res.images && res.images.length > 0;
                  const firstImage = hasImages ? res.images[0] : null;

                  return (
                    <div 
                      key={res.id || idx}
                      className="flex flex-col md:flex-row gap-6 py-8 items-start"
                    >
                      {/* Left: Thumbnail Image (only rendered if firstImage exists) */}
                      {firstImage && (
                        <div className="relative w-full md:w-56 h-36 rounded-2xl overflow-hidden shrink-0 border border-wild-cream shadow-sm bg-wild-sand/40">
                          <Image
                            src={firstImage}
                            alt={res.title}
                            fill
                            className="object-cover transition-transform duration-500 hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 224px"
                          />
                        </div>
                      )}

                      {/* Right: Content details and actions */}
                      <div className="flex-grow space-y-3">
                        <div className="flex items-center gap-2 text-wild-muted text-xs font-bold uppercase tracking-wider">
                          <span className="text-wild-sunset">{res.category}</span>
                          <span>•</span>
                          <span>{year}</span>
                        </div>

                        <h3 className="font-serif text-xl md:text-2xl text-wild-forest font-bold leading-snug">
                          {res.title}
                        </h3>
                        {res.description && (
                          <p className="text-sm text-wild-muted leading-relaxed font-sans font-medium">
                            {res.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          {res.fileUrl && (
                            <a 
                              href={res.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-wild-sunset text-white hover:bg-[#FF8C42] hover:shadow px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 group cursor-pointer"
                            >
                              <FileText size={14} className="text-wild-sand group-hover:scale-110 transition-transform" />
                              <span>{res.category?.toLowerCase() === 'downloads' ? t('download_file', 'Download File') : t('download_report', 'Download Report')}</span>
                              <Download size={12} className="opacity-75" />
                            </a>
                          )}

                          {hasImages && (
                            <button 
                              onClick={() => openLightbox(res.images, 0)}
                              className="inline-flex items-center gap-2 bg-wild-forest hover:bg-wild-sunset text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 group cursor-pointer"
                            >
                              <ImageIcon size={14} className="text-wild-sand group-hover:scale-110 transition-transform" />
                              <span>{t('view_photos', 'View Gallery')} ({res.images.length})</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
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
