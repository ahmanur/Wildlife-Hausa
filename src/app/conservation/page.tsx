"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FileDown, X, ArrowRight, BookOpen } from 'lucide-react';
import { getConservationNotes } from '@/lib/firebase/services';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { translateConservationNote } from '@/lib/translations';
import { WildCTA } from '@/components/ui/WildCTA';

export default function ConservationPage() {
  const { language, t } = useLanguage();
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

  return (
    <div className="flex flex-col min-h-screen bg-wild-sand">
      {/* Blog Page Hero Banner */}
      <section className="pt-44 pb-20 bg-wild-deep-forest relative overflow-hidden">
        {/* Overlay for premium dark cinematic atmosphere */}
        <div className="absolute inset-0 bg-black/45 z-10 pointer-events-none" />
        <div className="absolute inset-0 opacity-55" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1602491453979-54a3a1a7220c?auto=format&fit=crop&q=80&w=2000")',
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
                onReadMore={() => setActiveNote(note)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Premium Interactive Detail Modal (Services Design System) */}
      {activeNote && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setActiveNote(null)}
        >
          <div 
            className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl border border-wild-sand flex flex-col p-3 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Hero Image */}
            <div className="relative w-full h-64 md:h-80 shrink-0 rounded-[1.5rem] overflow-hidden bg-wild-sand">
              <Image 
                src={activeNote.image || "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800"} 
                alt={activeNote.title} 
                fill 
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-90" />
              <button 
                onClick={() => setActiveNote(null)}
                className="absolute top-4 right-4 bg-black/35 hover:bg-wild-sunset text-white hover:text-white rounded-full p-2.5 backdrop-blur-md border border-white/10 hover:border-transparent transition-all duration-300 cursor-pointer shadow-lg hover:scale-105 group z-20"
                aria-label="Close modal"
              >
                <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
            
            {/* Modal Body Content */}
            <div className="p-8 overflow-y-auto flex flex-col flex-grow">
              {/* Subtitle / Tagline */}
              {activeNote.category && (
                <span className="text-xs font-bold tracking-widest font-sans uppercase text-wild-sunset mb-2 block">
                  {activeNote.category}
                </span>
              )}
              
              {/* Title */}
              <h2 className="font-serif text-3xl text-wild-forest font-bold mb-3 leading-tight">
                {activeNote.title}
              </h2>
              
              {/* Subtitle details */}
              {activeNote.subtitle && (
                <p className="text-xs font-sans text-wild-muted mb-6">
                  {activeNote.subtitle}
                </p>
              )}

              {/* Separation line */}
              <div className="border-t border-wild-sand/80 my-2" />
              
              {/* Description */}
              <div className="text-wild-forest/80 text-base leading-relaxed mb-8 whitespace-pre-wrap font-sans">
                {activeNote.text}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 border-t border-wild-sand/80 pt-6 mt-auto">
                {activeNote.downloadUrl && (
                  <WildCTA 
                    variant="primary"
                    href={activeNote.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <FileDown size={16} />
                    <span>{t('download_journal')}</span>
                  </WildCTA>
                )}
                <WildCTA 
                  variant="outline"
                  onClick={() => setActiveNote(null)}
                >
                  {t('close_btn')}
                </WildCTA>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldNoteCard({ title, text, category, subtitle, image, downloadUrl, onReadMore }: any) {
  const fallbackImage = "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800";
  
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
        {/* Category Pill Overlay */}
        {category && (
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-wild-forest z-10 shadow-sm flex items-center gap-1.5">
            <BookOpen size={13} className="text-wild-sunset" /> {category}
          </div>
        )}
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
            <span>READ MORE</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          {downloadUrl && (
            <a 
              href={downloadUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-wild-sunset text-white flex items-center justify-center hover:bg-[#FF8C42] hover:scale-105 transition-all shadow-md"
              title="Download Journal"
            >
              <FileDown size={18} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
