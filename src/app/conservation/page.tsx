"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FileDown, X } from 'lucide-react';
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
        <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
        <div className="absolute inset-0 opacity-50" style={{
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
            <div className="w-12 h-12 border-4 border-wild-moss border-t-transparent rounded-full animate-spin" />
            <p className="text-wild-forest text-lg">{t('cons_loading')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto">
            {translatedNotes.map((note, idx) => (
              <FieldNoteCard
                key={note.id || idx}
                title={note.title}
                image={note.image}
                onReadMore={() => setActiveNote(note)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Premium Interactive Detail Modal */}
      {activeNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto relative shadow-2xl border border-wild-forest/5 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Hero Image */}
            <div className="relative w-full h-64 md:h-80 shrink-0 rounded-t-2xl overflow-hidden bg-wild-sand">
              <Image 
                src={activeNote.image || "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800"} 
                alt={activeNote.title} 
                fill 
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-wild-forest/30 via-transparent to-transparent opacity-90" />
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
                <span className="text-[10px] tracking-wider font-bold font-sans uppercase text-wild-sunset mb-2 block">
                  {activeNote.category}
                </span>
              )}
              
              {/* Title */}
              <h2 className="font-serif text-xl md:text-2xl font-bold text-wild-forest mb-3 leading-tight">
                {activeNote.title}
              </h2>
              
              {/* Subtitle details */}
              {activeNote.subtitle && (
                <p className="text-[11px] font-bold text-wild-forest/50 uppercase tracking-wider mb-5">
                  {activeNote.subtitle}
                </p>
              )}
              
              {/* Description */}
              <div className="text-wild-forest/75 text-sm leading-relaxed mb-6 font-sans whitespace-pre-wrap">
                {activeNote.text}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 border-t border-wild-forest/5 pt-6 mt-auto">
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

function FieldNoteCard({ title, image, onReadMore }: any) {
  const fallbackImage = "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800";
  
  return (
    <div className="bg-[#FAF8F5] overflow-hidden flex flex-col h-full group border border-wild-cream/10">
      {/* Image container */}
      <div 
        className="relative w-full aspect-[4/3] overflow-hidden shrink-0 cursor-pointer"
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
      <div className="flex flex-col items-center justify-between flex-grow p-8 text-center bg-[#FAF8F5]">
        <h3 
          className="font-serif text-base md:text-lg text-wild-forest font-bold tracking-wide uppercase leading-snug mb-8 cursor-pointer hover:text-wild-sunset transition-colors flex-grow"
          onClick={onReadMore}
        >
          {title}
        </h3>
        
        {/* Read More button with thin black border */}
        <button 
          onClick={onReadMore}
          className="border border-black px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest font-sans hover:bg-black hover:text-white transition-all duration-300"
        >
          READ MORE
        </button>
      </div>
    </div>
  );
}
