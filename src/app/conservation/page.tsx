"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, FileDown } from 'lucide-react';
import { getConservationNotes } from '@/lib/firebase/services';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { translateConservationNote } from '@/lib/translations';
import { WildCTA } from '@/components/ui/WildCTA';

export default function ConservationPage() {
  const { language, t, settings } = useLanguage();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNote, setActiveNote] = useState<any>(null);

  useEffect(() => {
    async function loadNotes() {
      try {
        const fetched = await getConservationNotes();
        setNotes(fetched);
      } catch (err) {
        console.error('Error fetching conservation notes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNotes();
  }, []);

  const translatedNotes = notes.map(note => translateConservationNote(note, language));

  if (activeNote) {
    return (
      <div className="flex flex-col min-h-screen bg-wild-sand">
        {/* Full Page Blog Post Header Banner */}
        <section className="pt-44 pb-24 bg-wild-deep-forest relative overflow-hidden flex items-end min-h-[40vh] md:min-h-[45vh]">
          {/* Overlay for premium dark cinematic atmosphere */}
          <div className="absolute inset-0 bg-black/55 z-10 pointer-events-none" />
          <div className="absolute inset-0 opacity-60" style={{
            backgroundImage: `url("${activeNote.image || "https://images.unsplash.com/photo-1602491453979-54a3a1a7220c?auto=format&fit=crop&q=80&w=2000"}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 35%',
          }} />
          
          <div className="relative z-20 container mx-auto px-6 lg:px-16">
            {activeNote.category && (
              <span className="inline-block mb-4 px-3 py-1 bg-wild-sunset text-white text-xs font-bold tracking-widest uppercase rounded">
                {activeNote.category}
              </span>
            )}
            <h1 className="font-serif text-4xl md:text-6xl text-white font-bold leading-tight drop-shadow-lg max-w-4xl">
              {activeNote.title}
            </h1>
          </div>
        </section>

        {/* Blog Post Detailed Content Section */}
        <section className="py-16 container mx-auto px-6 lg:px-16 flex-grow">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button 
              onClick={() => {
                setActiveNote(null);
                window.scrollTo(0, 0);
              }}
              className="inline-flex items-center gap-2 text-wild-forest hover:text-wild-sunset font-bold text-sm mb-8 transition-colors duration-300 group cursor-pointer"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>{t('back_to_blog')}</span>
            </button>

            {/* Premium detailed card layout */}
            <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-wild-sand flex flex-col">
              {/* Tagline / Subtitle Details */}
              {activeNote.subtitle && (
                <p className="text-sm font-sans text-wild-muted mb-8 leading-relaxed italic border-l-4 border-wild-sunset pl-4">
                  {activeNote.subtitle}
                </p>
              )}

              {/* Body Text */}
              <div className="text-wild-forest/90 text-lg leading-relaxed whitespace-pre-wrap font-sans mb-10">
                {activeNote.text}
              </div>

              {/* Action Buttons Row */}
              <div className="border-t border-wild-sand/80 pt-8 flex flex-wrap gap-4 mt-auto">
                {activeNote.downloadUrl && (
                  <WildCTA 
                    variant="primary"
                    href={activeNote.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileDown size={18} />
                    <span>{t('download_journal')}</span>
                  </WildCTA>
                )}
                <WildCTA 
                  variant="outline"
                  onClick={() => {
                    setActiveNote(null);
                    window.scrollTo(0, 0);
                  }}
                >
                  {t('back_to_blog')}
                </WildCTA>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-wild-sand">
      {/* Blog Page Hero Banner */}
      <section className="pt-44 pb-20 bg-wild-deep-forest relative overflow-hidden">
        {/* Overlay for premium dark cinematic atmosphere */}
        <div className="absolute inset-0 bg-black/45 z-10 pointer-events-none" />
        <div className="absolute inset-0 opacity-55" style={{
          backgroundImage: `url("${settings?.hero_images?.blog || "https://images.unsplash.com/photo-1602491453979-54a3a1a7220c?auto=format&fit=crop&q=80&w=2000"}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
        }} />
        <div className="relative z-20 container mx-auto px-6 lg:px-16">
          <h1 className="font-serif text-5xl md:text-7xl text-white font-normal tracking-wide">
            {t('cons_hero_title')}
          </h1>
        </div>
      </section>

      {/* Blog Grid Content Section */}
      <section className="py-24 container mx-auto px-6 lg:px-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-wild-sunset border-t-transparent rounded-full animate-spin" />
            <p className="text-wild-forest text-lg">{t('cons_loading')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto">
            {translatedNotes.map((note, idx) => (
              <FieldNoteCard
                key={note.id || idx}
                title={note.title}
                text={note.text}
                category={note.category}
                subtitle={note.subtitle}
                image={note.image}
                downloadUrl={note.downloadUrl}
                onReadMore={() => {
                  setActiveNote(note);
                  window.scrollTo(0, 0);
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FieldNoteCard({ title, text, category, subtitle, image, downloadUrl, onReadMore }: any) {
  const fallbackImage = "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800";
  const { t } = useLanguage();
  
  return (
    <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-wild-sand hover:shadow-xl transition-all duration-500 flex flex-col h-full group p-2">
      {/* Image container */}
      <div 
        className="relative h-64 w-full rounded-[1.5rem] overflow-hidden shrink-0 cursor-pointer"
        onClick={onReadMore}
      >
        <Image 
          src={image || fallbackImage} 
          alt={title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      </div>
      
      {/* Text Content container */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Title */}
        <h3 
          className="font-serif text-2xl text-wild-forest font-bold leading-tight group-hover:text-wild-sunset transition-colors duration-300 mb-3 cursor-pointer"
          onClick={onReadMore}
        >
          {title}
        </h3>

        {/* Subtitle details */}
        {subtitle && (
          <p className="text-xs text-wild-muted/80 font-medium mb-4">
            {subtitle}
          </p>
        )}
        
        {/* Excerpt */}
        <p className="text-wild-muted text-sm leading-relaxed mb-6 line-clamp-3 flex-grow font-sans">
          {text}
        </p>

        {/* Action Row separated by line */}
        <div className="border-t border-wild-sand/50 pt-5 mt-auto flex items-center justify-between">
          <button 
            onClick={onReadMore}
            className="inline-flex items-center gap-2 text-wild-sunset font-bold text-sm tracking-wide group-hover:underline"
          >
            <span>{t('read_more')}</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
