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

export function ExpeditionHero() {
  const { t, settings } = useLanguage();
  const videoClips = settings?.hero_videos !== undefined
    ? settings.hero_videos
    : DEFAULT_VIDEO_CLIPS;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [activePlayer, setActivePlayer] = useState<'A' | 'B'>('A');

  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);

  // Cross-fade slideshow loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoClips.length <= 1) return;
      const nextIdx = (currentIdx + 1) % videoClips.length;

      if (activePlayer === 'A') {
        if (videoRefB.current) {
          videoRefB.current.src = videoClips[nextIdx];
          videoRefB.current.load();
          videoRefB.current.play().catch(err => console.log("Video B autoplay blocked", err));
        }
        setActivePlayer('B');
      } else {
        if (videoRefA.current) {
          videoRefA.current.src = videoClips[nextIdx];
          videoRefA.current.load();
          videoRefA.current.play().catch(err => console.log("Video A autoplay blocked", err));
        }
        setActivePlayer('A');
      }

      setCurrentIdx(nextIdx);
    }, 8000); // Change slide every 8 seconds

    return () => clearInterval(interval);
  }, [currentIdx, activePlayer, videoClips]);

  // Initial trigger to make sure first video plays or resets when dynamic videoClips load
  useEffect(() => {
    if (videoRefA.current && videoClips[0]) {
      videoRefA.current.src = videoClips[0];
      videoRefA.current.load();
      videoRefA.current.play().catch(err => console.log("Initial autoplay blocked", err));
    }
    setCurrentIdx(0);
    setActivePlayer('A');
  }, [videoClips]);

  const handleIndicatorClick = (idx: number) => {
    if (idx === currentIdx) return;

    if (activePlayer === 'A') {
      if (videoRefB.current) {
        videoRefB.current.src = videoClips[idx];
        videoRefB.current.load();
        videoRefB.current.play().catch(err => console.log("Manual Video B play blocked", err));
      }
      setActivePlayer('B');
    } else {
      if (videoRefA.current) {
        videoRefA.current.src = videoClips[idx];
        videoRefA.current.load();
        videoRefA.current.play().catch(err => console.log("Manual Video A play blocked", err));
      }
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

        {/* Video Player A */}
        <video
          ref={videoRefA}
          src={videoClips[0]}
          muted
          playsInline
          loop
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            activePlayer === 'A' ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Video Player B */}
        <video
          ref={videoRefB}
          src={videoClips[1]}
          muted
          playsInline
          loop
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            activePlayer === 'B' ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Premium Overlay Gradients for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/65 z-10" />
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center pt-20">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-[0.2em] uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-wild-sunset animate-pulse" />
          {t('hero_badge')}
        </div>
        
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
