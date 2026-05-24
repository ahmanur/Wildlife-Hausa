"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Search, Calendar, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DEFAULT_VIDEO_CLIPS = [
  "https://videos.pexels.com/video-files/855538/855538-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/7710516/7710516-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/20600021/20600021-uhd_2560_1440_25fps.mp4"
];

function getYouTubeId(url: string): string | null {
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

function BackgroundPlayer({ url, isActive }: { url: string; isActive: boolean }) {
  if (!url) return null;
  const youtubeId = getYouTubeId(url);
  const activeClasses = isActive ? 'opacity-100 z-10' : 'opacity-0 z-0';

  if (youtubeId) {
    const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1&playsinline=1`;
    return (
      <div className={`absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-1000 ${activeClasses}`}>
        <iframe
          src={embedUrl}
          frameBorder="0"
          allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
          className="absolute top-1/2 left-1/2 w-[177.77777778vh] min-w-full h-[56.25vw] min-h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none scale-110"
          title="Background YouTube Video"
        />
      </div>
    );
  }

  return (
    <video
      key={url}
      src={url}
      autoPlay
      muted
      playsInline
      loop
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${activeClasses}`}
    />
  );
}

export function ExpeditionHero() {
  const { t, settings } = useLanguage();
  const videoClips = settings?.hero_videos !== undefined
    ? settings.hero_videos
    : DEFAULT_VIDEO_CLIPS;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [activePlayer, setActivePlayer] = useState<'A' | 'B'>('A');
  const [urlA, setUrlA] = useState<string>('');
  const [urlB, setUrlB] = useState<string>('');

  // Initial trigger
  useEffect(() => {
    if (videoClips[0]) {
      setUrlA(videoClips[0]);
    }
    if (videoClips[1]) {
      setUrlB(videoClips[1]);
    } else {
      setUrlB('');
    }
    setCurrentIdx(0);
    setActivePlayer('A');
  }, [videoClips]);

  // Cross-fade slideshow loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoClips.length <= 1) return;
      const nextIdx = (currentIdx + 1) % videoClips.length;

      if (activePlayer === 'A') {
        setUrlB(videoClips[nextIdx]);
        setActivePlayer('B');
      } else {
        setUrlA(videoClips[nextIdx]);
        setActivePlayer('A');
      }

      setCurrentIdx(nextIdx);
    }, 8000);

    return () => clearInterval(interval);
  }, [currentIdx, activePlayer, videoClips]);

  const handleIndicatorClick = (idx: number) => {
    if (idx === currentIdx) return;

    if (activePlayer === 'A') {
      setUrlB(videoClips[idx]);
      setActivePlayer('B');
    } else {
      setUrlA(videoClips[idx]);
      setActivePlayer('A');
    }

    setCurrentIdx(idx);
  };

  const [searchLocation, setSearchLocation] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.append('location', searchLocation);
    if (searchDate) params.append('date', searchDate);
    
    router.push(`/safaris?${params.toString()}`);
  };

  return (
    <section className="relative w-full h-[95vh] min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Slideshow Layer */}
      <div className="absolute inset-0 w-full h-full bg-wild-forest">
        {/* Fallback image shown behind transparent/loading videos */}
        <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1547471080-7fc2caa6f57e?q=80&w=2000&auto=format&fit=crop")',
          backgroundPosition: 'center 30%',
        }} />

        {/* Video Players */}
        <BackgroundPlayer url={urlA} isActive={activePlayer === 'A'} />
        <BackgroundPlayer url={urlB} isActive={activePlayer === 'B'} />

        {/* Premium Overlay Gradients for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/65 z-10" />
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center pt-20">
        <h1 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] text-white font-bold leading-[1.1] mb-6 drop-shadow-2xl">
          {t('hero_title_1')} <br />
          <span className="text-wild-sand italic font-light">{t('hero_title_2')}</span>
        </h1>
        
        <p className="font-sans text-lg md:text-xl text-white/90 max-w-2xl mb-12 leading-relaxed drop-shadow-lg font-light">
          {t('hero_subtitle')}
        </p>
        
        {/* Glassmorphism Booking/Search Bar */}
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-2 flex flex-col md:flex-row items-center gap-2 md:gap-4 shadow-2xl">
          <div className="flex-1 flex items-center w-full px-6 py-3 md:py-0 border-b md:border-b-0 md:border-r border-white/20">
            <MapPin className="text-wild-sunset mr-3 shrink-0" size={24} />
            <div className="text-left w-full">
              <div className="text-xs text-white/60 font-bold uppercase tracking-wider mb-0.5">{t('hero_location')}</div>
              <input 
                type="text" 
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder={t('hero_location_placeholder')} 
                className="w-full bg-transparent text-white placeholder:text-white/80 focus:outline-none font-semibold text-sm" 
                aria-label={t('hero_location')}
              />
            </div>
          </div>
          
          <div className="flex-1 flex items-center w-full px-6 py-3 md:py-0 border-b md:border-b-0 md:border-r border-white/20">
            <Calendar className="text-wild-sunset mr-3 shrink-0" size={24} />
            <div className="text-left w-full">
              <div className="text-xs text-white/60 font-bold uppercase tracking-wider mb-0.5">{t('hero_date')}</div>
              <input 
                type="date" 
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full bg-transparent text-white focus:outline-none font-semibold text-sm cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" 
                aria-label={t('hero_date')}
              />
            </div>
          </div>
          
          <div className="w-full md:w-auto mt-2 md:mt-0 p-1">
            <button 
              onClick={handleSearch}
              className="w-full md:w-auto h-14 px-8 rounded-full bg-wild-sunset text-white hover:bg-[#FF8C42] transition-colors flex items-center justify-center font-bold tracking-wide shadow-lg hover:shadow-wild-sunset/30 cursor-pointer"
            >
              <Search className="mr-2 shrink-0" size={20} />
              {t('hero_find_safari')}
            </button>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-12 right-12 z-20 flex gap-2">
        {videoClips.map((_: any, idx: number) => (
          <button
            key={idx}
            onClick={() => handleIndicatorClick(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              currentIdx === idx ? 'w-8 bg-wild-sunset' : 'w-2 bg-white/40 hover:bg-white'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
      
      {/* Bottom Gradient Fade to merge with next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-wild-cream to-transparent z-10" />
    </section>
  );
}
