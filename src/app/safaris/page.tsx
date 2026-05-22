"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { WildSectionHeader } from '@/components/ui/WildSectionHeader';
import { WildCTA } from '@/components/ui/WildCTA';
import { Map, ArrowRight } from 'lucide-react';
import { getSafariPackages } from '@/lib/firebase/services';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { translateSafari } from '@/lib/translations';
import { useSearchParams } from 'next/navigation';

function SafarisContent() {
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();
  const searchLocation = searchParams.get('location')?.toLowerCase() || '';
  // Date parameter exists, but usually safaris are not purely date-filtered unless there's a strict schedule. 
  // We'll primarily filter by location/title here to match the hero search.

  const [safaris, setSafaris] = useState<any[]>([]);
  const [filteredSafaris, setFilteredSafaris] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSafaris() {
      try {
        const fetched = await getSafariPackages();
        setSafaris(fetched);
        
        // Initial filter from URL params
        if (searchLocation) {
          setFilteredSafaris(fetched.filter(s => 
            s.location?.toLowerCase().includes(searchLocation) || 
            s.title?.toLowerCase().includes(searchLocation)
          ));
        } else {
          setFilteredSafaris(fetched);
        }
      } catch (err) {
        console.error('Error fetching safaris:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSafaris();
  }, [searchLocation]);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    
    // Start with the base list (either all or location-filtered)
    let baseList = safaris;
    if (searchLocation) {
      baseList = safaris.filter(s => 
        s.location?.toLowerCase().includes(searchLocation) || 
        s.title?.toLowerCase().includes(searchLocation)
      );
    }

    if (filter === 'All') {
      setFilteredSafaris(baseList);
    } else if (filter === 'Family') {
      setFilteredSafaris(baseList.filter(s => 
        s.difficulty?.toLowerCase().includes('family') || 
        s.difficulty?.toLowerCase().includes('beginner') ||
        s.bestFor?.toLowerCase().includes('family')
      ));
    } else if (filter === 'Advanced') {
      setFilteredSafaris(baseList.filter(s => 
        s.difficulty?.toLowerCase().includes('advanced') || 
        s.difficulty?.toLowerCase().includes('expert')
      ));
    } else if (filter === 'Photography') {
      setFilteredSafaris(baseList.filter(s => 
        s.bestFor?.toLowerCase().includes('photograph')
      ));
    }
  };

  const translatedFiltered = filteredSafaris.map(s => translateSafari(s, language));

  return (
    <div className="flex flex-col min-h-screen bg-wild-sand">
      <section className="pt-32 pb-20 bg-wild-deep-forest text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=2000")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div className="relative z-10 container mx-auto px-6 max-w-4xl">
          <h1 className="font-serif text-5xl md:text-7xl text-wild-cream font-bold mb-6">{t('safaris_hero_title')}</h1>
          <p className="text-xl text-wild-sand/90 font-sans leading-relaxed">
            {t('safaris_hero_subtitle')}
          </p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6 lg:px-12">
        {/* Simple Filters */}
        <div className="flex flex-wrap gap-4 mb-12 border-b border-wild-brown/20 pb-8 items-center">
          <span className="font-bold text-wild-forest py-2 mr-2">{t('filter_routes')}</span>
          <button 
            onClick={() => handleFilterChange('All')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              activeFilter === 'All' 
                ? 'bg-wild-sunset text-white' 
                : 'border border-wild-forest/20 text-wild-forest hover:bg-wild-forest/5'
            }`}
          >
            {t('filter_all')}
          </button>
          <button 
            onClick={() => handleFilterChange('Family')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              activeFilter === 'Family' 
                ? 'bg-wild-sunset text-white' 
                : 'border border-wild-forest/20 text-wild-forest hover:bg-wild-forest/5'
            }`}
          >
            {t('filter_family')}
          </button>
          <button 
            onClick={() => handleFilterChange('Advanced')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              activeFilter === 'Advanced' 
                ? 'bg-wild-sunset text-white' 
                : 'border border-wild-forest/20 text-wild-forest hover:bg-wild-forest/5'
            }`}
          >
            {t('filter_advanced')}
          </button>
          <button 
            onClick={() => handleFilterChange('Photography')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              activeFilter === 'Photography' 
                ? 'bg-wild-sunset text-white' 
                : 'border border-wild-forest/20 text-wild-forest hover:bg-wild-forest/5'
            }`}
          >
            {t('filter_photography')}
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white rounded-xl overflow-hidden shadow-sm border border-wild-cream animate-pulse h-[400px]" />
            ))}
          </div>
        ) : translatedFiltered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-wild-cream">
            <p className="text-wild-muted text-lg font-serif">{t('no_safaris_matching')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {translatedFiltered.map((safari) => (
              <SafariCard 
                key={safari.id}
                title={safari.title}
                location={safari.location}
                duration={safari.duration}
                difficulty={safari.difficulty}
                bestFor={safari.bestFor}
                price={safari.price}
                image={safari.image}
                slug={safari.slug}
                durationLabel={t('safari_duration')}
                difficultyLabel={t('safari_difficulty')}
                bestForLabel={t('safari_best_for')}
                startingFromLabel={t('starting_from')}
                viewDetailsLabel={t('view_safari_details')}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SafariCard({ 
  title, 
  location, 
  duration, 
  difficulty, 
  bestFor, 
  price, 
  image, 
  slug,
  durationLabel,
  difficultyLabel,
  bestForLabel,
  startingFromLabel,
  viewDetailsLabel
}: any) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-wild-cream hover:shadow-lg hover:border-wild-sunset/30 transition-all duration-300 flex flex-col h-full">
      <div className="h-56 relative">
        <Image src={image} alt={title} fill className="object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <Map size={16} /> {location}
          </div>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-serif text-2xl text-wild-forest font-bold leading-tight mb-4">{title}</h3>
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-wild-muted mb-6 flex-grow">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-wild-sunset" />
            <span className="font-medium text-wild-charcoal">{durationLabel}</span>
          </div>
          <div>{duration}</div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-wild-sunset" />
            <span className="font-medium text-wild-charcoal">{difficultyLabel}</span>
          </div>
          <div>{difficulty}</div>
          {bestFor && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-wild-sunset" />
                <span className="font-medium text-wild-charcoal">{bestForLabel}</span>
              </div>
              <div className="truncate" title={bestFor}>{bestFor}</div>
            </>
          )}
        </div>
        <div className="border-t border-wild-sand pt-4 mt-auto flex items-center justify-between">
          <div>
            <span className="block text-xs text-wild-muted uppercase tracking-wider">{startingFromLabel}</span>
            <span className="font-serif font-bold text-xl text-wild-forest">{price}</span>
          </div>
          <a href={`/safaris/${slug}`} aria-label={viewDetailsLabel} className="w-10 h-10 rounded-full bg-wild-cream text-wild-forest flex items-center justify-center hover:bg-wild-sunset hover:text-white transition-colors">
            <ArrowRight size={20} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SafarisPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-wild-sand">
        <div className="w-12 h-12 border-4 border-wild-sunset/30 border-t-wild-sunset rounded-full animate-spin" />
      </div>
    }>
      <SafarisContent />
    </Suspense>
  );
}
