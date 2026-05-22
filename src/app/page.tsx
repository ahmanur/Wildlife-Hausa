"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ExpeditionHero } from '@/components/ui/ExpeditionHero';
import { WildSectionHeader } from '@/components/ui/WildSectionHeader';
import { WildCTA } from '@/components/ui/WildCTA';
import { SafariRingBadge } from '@/components/ui/SafariRingBadge';
import { Play, Map, BookOpen, Compass, Tent, Leaf, ArrowRight } from 'lucide-react';
import { getSafariPackages, getMediaItems } from '@/lib/firebase/services';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { translateSafari, translateMediaItem } from '@/lib/translations';
import { VideoModal } from '@/components/ui/VideoModal';

export default function Home() {
  const { language, t } = useLanguage();
  const [safaris, setSafaris] = useState<any[]>([]);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedSafaris, fetchedMedia] = await Promise.all([
          getSafariPackages(),
          getMediaItems()
        ]);
        setSafaris(fetchedSafaris.slice(0, 3));
        setMediaItems(fetchedMedia);
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const translatedSafaris = safaris.map(s => translateSafari(s, language));
  const translatedMedia = mediaItems.map(m => translateMediaItem(m, language));

  // Find featured documentary or fallback to first item
  const featuredDoc = translatedMedia.find(item => item.featured) || translatedMedia[0];
  const otherDocs = translatedMedia.filter(item => item.id !== (featuredDoc?.id)).slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* 1. Signature Expedition Hero */}
      <ExpeditionHero />

      {/* 2. Mission Strip */}
      <section className="bg-wild-brown text-wild-cream py-6">
        <div className="container mx-auto px-6 overflow-hidden">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm md:text-base font-semibold tracking-wide uppercase whitespace-nowrap opacity-90">
            <span>{t('mission_conservation')}</span>
            <div className="w-2 h-2 rounded-full bg-wild-sunset" />
            <span>{t('mission_ecotourism')}</span>
            <div className="w-2 h-2 rounded-full bg-wild-sunset" />
            <span>{t('mission_media')}</span>
            <div className="w-2 h-2 rounded-full bg-wild-sunset" />
            <span>{t('mission_adventure')}</span>
            <div className="w-2 h-2 rounded-full bg-wild-sunset" />
            <span>{t('mission_education')}</span>
          </div>
        </div>
      </section>

      {/* 3. Four Worlds of Wild Hausa */}
      <section className="py-24 bg-wild-sand relative">
        <div className="container mx-auto px-6 lg:px-12">
          <WildSectionHeader 
            title={t('worlds_title')} 
            subtitle={t('worlds_subtitle')}
            centered
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <WorldCard 
              icon={<Play size={32} />}
              title={t('film_the_wild')}
              label={t('mission_media')}
              description={t('film_desc')}
              image="https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800"
              link="/documentaries"
              exploreText={t('explore_world')}
            />
            <WorldCard 
              icon={<Compass size={32} />}
              title={t('journey_the_wild')}
              label={t('mission_ecotourism')}
              description={t('journey_desc')}
              image="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800"
              link="/safaris"
              exploreText={t('explore_world')}
            />
            <WorldCard 
              icon={<Tent size={32} />}
              title={t('play_in_the_wild')}
              label={t('mission_adventure')}
              description={t('play_desc')}
              image="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=800"
              link="/adventure-park"
              exploreText={t('explore_world')}
            />
            <WorldCard 
              icon={<Leaf size={32} />}
              title={t('protect_the_wild')}
              label={t('mission_conservation')}
              description={t('protect_desc')}
              image="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800"
              link="/conservation"
              exploreText={t('explore_world')}
            />
          </div>
        </div>
      </section>

      {/* 4. Featured Expeditions */}
      <section className="py-24 bg-wild-cream relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none w-1/2 h-full" style={{
          backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
        }} />
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <WildSectionHeader 
            title={t('featured_title')} 
            subtitle={t('featured_subtitle')}
          />
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-white rounded-xl overflow-hidden shadow-sm border border-wild-sand animate-pulse h-96" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {translatedSafaris.map(safari => (
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
                  startingText={t('starting_from')}
                  viewDetailsLabel={t('view_safari_details')}
                />
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center">
            <WildCTA variant="outline" href="/safaris">{t('view_all_routes')}</WildCTA>
          </div>
        </div>
      </section>

      {/* 5. Documentary Reel */}
      <section className="py-24 bg-wild-deep-forest text-wild-cream relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-8 rounded-full border-2 border-wild-sunset flex-shrink-0" />
                <h2 className="font-serif text-3xl md:text-5xl font-bold">{t('stories_title')}</h2>
              </div>
              <p className="text-wild-sand/80 font-sans text-lg">
                {t('stories_subtitle')}
              </p>
            </div>
            <WildCTA variant="primary" href="/documentaries" className="shrink-0 hidden md:inline-flex">
              {t('enter_doc_room')}
            </WildCTA>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-black/45 rounded-xl h-[450px] animate-pulse" />
              <div className="lg:col-span-4 flex flex-col gap-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="bg-black/35 rounded-lg h-24 animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Featured Video */}
              {featuredDoc && (
                <div 
                  onClick={() => {
                    if (featuredDoc.videoUrl) {
                      setActiveVideoUrl(featuredDoc.videoUrl);
                    } else {
                      // Fallback if videoUrl is missing, use default pexels
                      setActiveVideoUrl("https://videos.pexels.com/video-files/855538/855538-hd_1920_1080_25fps.mp4");
                    }
                  }}
                  className="lg:col-span-8 group relative rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl"
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
                  <div className="absolute inset-0 border border-wild-sand/20 z-20 m-6 rounded-[1.5rem] pointer-events-none" />
                  <div className="absolute top-10 left-10 z-20 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> {t('rec_badge')}
                  </div>
                  <div className="relative w-full h-[400px] md:h-[500px]">
                    <Image 
                      src={featuredDoc.image}
                      alt={featuredDoc.title}
                      fill
                      className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-24 h-24 bg-wild-sunset/90 rounded-full flex items-center justify-center text-white backdrop-blur-md group-hover:scale-110 transition-transform shadow-xl">
                      <Play size={40} className="ml-2" />
                    </div>
                  </div>
                  <div className="absolute bottom-10 left-10 right-10 z-20">
                    <h3 className="font-serif text-4xl font-bold mb-3 drop-shadow-lg">{featuredDoc.title}</h3>
                    <p className="text-wild-sand/90 line-clamp-2 text-lg drop-shadow-md font-light">{featuredDoc.description}</p>
                  </div>
                </div>
              )}

              {/* Smaller Cards */}
              <div className="lg:col-span-4 flex flex-col gap-6 justify-center">
                {otherDocs.map(docItem => (
                  <DocMiniCard 
                    key={docItem.id}
                    title={docItem.title}
                    duration={docItem.duration}
                    image={docItem.image}
                    tagText={t('field_recording')}
                    onClick={() => {
                      if (docItem.videoUrl) {
                        setActiveVideoUrl(docItem.videoUrl);
                      } else {
                        // Fallback pexels videos
                        const idx = mediaItems.indexOf(docItem) % 3;
                        const fallbacks = [
                          "https://videos.pexels.com/video-files/7710516/7710516-hd_1920_1080_25fps.mp4",
                          "https://videos.pexels.com/video-files/20600021/20600021-uhd_2560_1440_25fps.mp4",
                          "https://videos.pexels.com/video-files/4038481/4038481-hd_1920_1080_25fps.mp4"
                        ];
                        setActiveVideoUrl(fallbacks[idx]);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="mt-8 text-center md:hidden">
            <WildCTA variant="primary" href="/documentaries">{t('enter_doc_room')}</WildCTA>
          </div>
        </div>
      </section>

      {/* 6. Conservation Classroom */}
      <section className="py-24 bg-wild-cream relative">
        <div className="container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <div className="inline-block mb-4 px-3 py-1 bg-wild-moss text-white text-xs font-bold tracking-widest uppercase rounded">
              {t('classroom_badge')}
            </div>
            <WildSectionHeader 
              title={t('classroom_title')} 
            />
            <div className="space-y-6 text-wild-forest/80 text-lg leading-relaxed font-sans mb-8">
              <p>
                {t('classroom_p1')}
              </p>
              <p>
                {t('classroom_p2')}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <WildCTA variant="secondary" href="/conservation">{t('btn_school')}</WildCTA>
              <WildCTA variant="outline" href="/conservation">{t('btn_volunteer')}</WildCTA>
            </div>
          </div>
          
          <div className="lg:w-1/2 w-full relative">
            <div className="absolute inset-0 bg-wild-sunset/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative bg-white p-10 rounded-[2rem] shadow-xl border border-wild-sand">
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-wild-sunset rounded-full flex items-center justify-center text-white shadow-lg border-4 border-wild-cream">
                <BookOpen size={28} />
              </div>
              <h3 className="font-serif text-3xl text-wild-forest font-bold mb-4">{t('subscribe_title')}</h3>
              <p className="text-wild-muted mb-8 font-medium">{t('subscribe_subtitle')}</p>
              <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder={t('email_placeholder')}
                  aria-label={t('email_placeholder')}
                  className="w-full px-6 py-4 bg-wild-sand/30 border border-wild-brown/20 rounded-full focus:outline-none focus:border-wild-sunset focus:ring-1 focus:ring-wild-sunset transition-colors text-wild-charcoal font-medium"
                />
                <WildCTA variant="primary" className="w-full h-14 text-base">{t('subscribe_btn')}</WildCTA>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="py-32 bg-wild-forest text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=2000")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }} />
        <div className="relative z-10 container mx-auto px-6">
          <SafariRingBadge size="lg" className="mx-auto mb-8 bg-wild-sunset/20 border-wild-sunset" />
          <h2 className="font-serif text-4xl md:text-6xl text-wild-cream font-bold mb-6 drop-shadow-lg">
            {t('final_title')}
          </h2>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <WildCTA variant="primary" href="/safaris">{t('final_btn_plan')}</WildCTA>
            <WildCTA variant="outline" href="/about" className="text-white border-white hover:bg-white hover:text-wild-forest">
              {t('final_btn_partner')}
            </WildCTA>
          </div>
        </div>
      </section>

      <VideoModal videoUrl={activeVideoUrl} onClose={() => setActiveVideoUrl(null)} />
    </div>
  );
}

// Sub-components for Home Page

function WorldCard({ icon, title, label, description, image, link, exploreText }: any) {
  return (
    <a href={link} className="group block relative overflow-hidden rounded-[2rem] bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border border-wild-sand">
      <div className="h-56 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10 duration-500" />
        <Image 
          src={image} 
          alt={title}
          fill
          className="object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-5 left-5 z-20 bg-white/90 backdrop-blur-md text-wild-forest text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-sm">
          {label}
        </div>
      </div>
      <div className="p-8 relative">
        <div className="absolute -top-10 right-8 w-20 h-20 bg-wild-cream border-[6px] border-white rounded-full flex items-center justify-center text-wild-sunset shadow-sm group-hover:bg-wild-sunset group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
        <h3 className="font-serif text-3xl text-wild-forest font-bold mb-3 mt-2">{title}</h3>
        <p className="text-wild-muted text-sm leading-relaxed mb-6 font-medium">{description}</p>
        <span className="inline-flex items-center text-wild-sunset font-bold text-sm tracking-wide group-hover:underline">
          {exploreText} <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </a>
  );
}

function SafariCard({ title, location, duration, difficulty, bestFor, price, image, slug, startingText, viewDetailsLabel }: any) {
  return (
    <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-wild-sand hover:shadow-xl transition-all duration-500 flex flex-col h-full group p-2">
      <div className="h-64 relative rounded-[1.5rem] overflow-hidden">
        <Image src={image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-wild-forest z-10 shadow-sm flex items-center gap-1.5">
          <Map size={14} className="text-wild-sunset" /> {location}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-6">
          <h3 className="font-serif text-3xl text-wild-forest font-bold leading-tight group-hover:text-wild-sunset transition-colors">{title}</h3>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6 flex-grow">
          <div className="px-3 py-1 rounded-full bg-wild-sand/50 text-wild-charcoal text-xs font-semibold tracking-wide border border-wild-sand">
            {duration}
          </div>
          <div className="px-3 py-1 rounded-full bg-wild-sand/50 text-wild-charcoal text-xs font-semibold tracking-wide border border-wild-sand">
            {difficulty}
          </div>
          <div className="px-3 py-1 rounded-full bg-wild-sand/50 text-wild-charcoal text-xs font-semibold tracking-wide border border-wild-sand truncate max-w-[200px]" title={bestFor}>
            {bestFor}
          </div>
        </div>
        
        <div className="border-t border-wild-sand/50 pt-5 mt-auto flex items-center justify-between">
          <div>
            <span className="block text-[10px] text-wild-muted uppercase tracking-[0.2em] font-bold mb-1">{startingText}</span>
            <span className="font-serif font-bold text-2xl text-wild-forest">{price}</span>
          </div>
          <a href={`/safaris/${slug}`} aria-label={viewDetailsLabel} className="w-12 h-12 rounded-full bg-wild-sunset text-white flex items-center justify-center hover:bg-[#FF8C42] hover:scale-105 transition-all shadow-md">
            <ArrowRight size={20} />
          </a>
        </div>
      </div>
    </div>
  );
}

export function DocMiniCard({ title, duration, image, tagText, onClick }: { title: string; duration: string; image?: string; tagText: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-wild-sand/5 transition-colors cursor-pointer border border-transparent hover:border-wild-sand/10">
      <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-wild-forest/20">
        {image && <Image src={image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />}
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="w-8 h-8 text-wild-sand opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" fill="currentColor" />
        </div>
        <div className="absolute bottom-1 right-1 bg-wild-forest/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-medium text-wild-sand">
          {duration}
        </div>
      </div>
      <div>
        <h4 className="font-serif text-xl font-bold group-hover:text-wild-sunset transition-colors text-wild-sand">{title}</h4>
        <p className="text-sm text-wild-sand/60 mt-1">{tagText}</p>
      </div>
    </div>
  );
}
