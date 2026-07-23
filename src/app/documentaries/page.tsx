"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { WildSectionHeader } from '@/components/ui/WildSectionHeader';
import { Play } from 'lucide-react';
import { getMediaItems } from '@/lib/firebase/services';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { translateMediaItem } from '@/lib/translations';
import { VideoModal } from '@/components/ui/VideoModal';
import { MediaThumbnail } from '@/components/ui/MediaThumbnail';

export default function DocumentariesPage() {
  const { language, t, settings } = useLanguage();
  const [films, setFilms] = useState<any[]>([]);
  const [filteredFilms, setFilteredFilms] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadFilms() {
      try {
        const fetched = await getMediaItems();
        setFilms(fetched);
        setFilteredFilms(fetched);
      } catch (err) {
        console.error('Error fetching media items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFilms();
  }, []);

  const handleFilterChange = (category: string) => {
    setActiveFilter(category);
    if (category === 'All') {
      setFilteredFilms(films);
    } else {
      setFilteredFilms(films.filter(f => f.category?.toLowerCase() === category.toLowerCase()));
    }
  };

  const translatedFiltered = filteredFilms.map(f => translateMediaItem(f, language));

  const categories = [
    { key: 'All', label: t('docs_all_films') },
    { key: 'Wildlife', label: t('docs_cat_wildlife') },
    { key: 'Conservation', label: t('docs_cat_conservation') },
    { key: 'Culture', label: t('docs_cat_culture') },
    { key: 'Eco-Tourism', label: t('docs_cat_tourism') }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-wild-deep-forest text-wild-cream">
      <section className="relative pt-32 pb-20 bg-wild-deep-forest text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("${settings?.hero_images?.archive || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=2000"}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div className="relative z-10 container mx-auto px-6 max-w-4xl">
          <h1 className="font-serif text-5xl md:text-7xl text-wild-cream font-bold mb-6">{t('docs_hero_title')}</h1>
          <p className="text-xl text-wild-sand/90 font-sans leading-relaxed">
            {t('docs_hero_subtitle')}
          </p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6 lg:px-12">
        <div className="flex flex-wrap gap-4 mb-12 border-b border-wild-forest pb-8 items-center">
          <span className="font-bold text-wild-sand py-2 mr-2">{t('docs_categories')}</span>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleFilterChange(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                activeFilter === cat.key
                  ? 'bg-wild-sunset text-white'
                  : 'border border-wild-sand/20 text-wild-sand hover:bg-wild-sand/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-wild-sunset border-t-transparent rounded-full animate-spin" />
            <p className="text-wild-sand text-lg">{t('docs_loading')}</p>
          </div>
        ) : translatedFiltered.length === 0 ? (
          <div className="text-center py-20 text-wild-sand/60">
            {t('docs_no_found')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {translatedFiltered.map((film, idx) => (
               <DocCard
                key={film.id || idx}
                title={film.title}
                category={film.category}
                image={film.image}
                duration={film.duration}
                videoUrl={film.videoUrl}
                onClick={() => {
                  if (film.videoUrl) {
                    setActiveVideoUrl(film.videoUrl);
                  }
                }}
              />
            ))}
          </div>
        )}
      </section>

      {activeVideoUrl && (
        <VideoModal videoUrl={activeVideoUrl} onClose={() => setActiveVideoUrl(null)} />
      )}
    </div>
  );
}

function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const shortsMatch = url.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];
  const watchBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (watchBeMatch) return watchBeMatch[1];
  const watchUrlMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchUrlMatch) return watchUrlMatch[1];
  const embedMatch = url.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  return null;
}

function getVimeoId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  return match ? match[1] : null;
}

function DocCard({ title, category, image, duration, videoUrl, onClick, idx }: any) {
  return (
    <div onClick={onClick} className="group relative rounded-xl overflow-hidden cursor-pointer bg-black h-64">
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
      <div className="absolute inset-0 border border-wild-sand/20 z-20 m-3 rounded-lg pointer-events-none" />
      <div className="absolute inset-0 w-full h-full">
        <MediaThumbnail
          fill
          image={image}
          videoUrl={videoUrl}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
      </div>
      {videoUrl && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-16 h-16 bg-wild-sunset/90 rounded-full flex items-center justify-center text-white backdrop-blur-sm group-hover:scale-110 transition-transform">
            <Play size={24} className="ml-1.5" />
          </div>
        </div>
      )}
      <div className="absolute bottom-6 left-6 right-6 z-20">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] text-wild-sunset font-bold uppercase tracking-widest mb-1 block">{category}</span>
            <h3 className="font-serif text-2xl font-bold text-white">{title}</h3>
          </div>
          <span className="bg-black/80 px-2 py-1 rounded text-xs text-white font-mono">{duration}</span>
        </div>
      </div>
    </div>
  );
}
