"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import { BookOpen, Leaf, HeartHandshake, FileDown } from 'lucide-react';
import { getConservationNotes } from '@/lib/firebase/services';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { translateConservationNote } from '@/lib/translations';

const iconMap: Record<string, React.ReactNode> = {
  Leaf: <Leaf />,
  BookOpen: <BookOpen />,
  HeartHandshake: <HeartHandshake />,
};

export default function ConservationPage() {
  const { language, t } = useLanguage();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      <section className="pt-32 pb-20 bg-wild-moss text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=2000")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div className="relative z-10 container mx-auto px-6 max-w-4xl">
          <div className="inline-block mb-4 px-3 py-1 bg-white text-wild-moss text-xs font-bold tracking-widest uppercase rounded">
            {t('cons_field_notes')}
          </div>
          <h1 className="font-serif text-5xl md:text-7xl text-wild-cream font-bold mb-6">{t('cons_hero_title')}</h1>
          <p className="text-xl text-wild-sand/90 font-sans leading-relaxed">
            {t('cons_hero_subtitle')}
          </p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6 lg:px-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-wild-moss border-t-transparent rounded-full animate-spin" />
            <p className="text-wild-forest text-lg">{t('cons_loading')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8 mb-24 max-w-5xl mx-auto">
            {translatedNotes.map((note, idx) => (
              <FieldNoteCard
                key={note.id || idx}
                title={note.title}
                text={note.text}
                category={note.category}
                subtitle={note.subtitle}
                image={note.image}
                downloadUrl={note.downloadUrl}
              />
            ))}
          </div>
        )}

      </section>
    </div>
  );
}

function FieldNoteCard({ title, text, category, subtitle, image, downloadUrl }: any) {
  const fallbackImage = "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800";
  
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-wild-cream hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row gap-6 p-6">
      {/* Image section */}
      <div className="relative w-full md:w-72 h-48 md:h-auto min-h-[180px] rounded-xl overflow-hidden shrink-0">
        <Image 
          src={image || fallbackImage} 
          alt={title} 
          fill 
          className="object-cover"
        />
      </div>
      
      {/* Content section */}
      <div className="flex flex-col justify-between flex-grow py-1">
        <div>
          {/* Badges/Category */}
          {(category || subtitle) && (
            <div className="flex items-center gap-3 mb-3">
              {category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-wild-cream text-wild-forest tracking-wider uppercase">
                  {category}
                </span>
              )}
              {subtitle && (
                <span className="text-[11px] font-bold text-wild-sunset uppercase tracking-wider">
                  {subtitle.split('·')[0].trim()}
                </span>
              )}
            </div>
          )}
          
          {/* Title */}
          <h3 className="font-serif text-2xl md:text-3xl text-wild-forest font-bold mb-2">
            {title}
          </h3>
          
          {/* Subtitle details */}
          {subtitle && (
            <p className="text-xs text-wild-muted/80 font-medium mb-4">
              {subtitle}
            </p>
          )}
          
          {/* Description */}
          <p className="text-wild-muted text-sm leading-relaxed mb-6">
            {text}
          </p>
        </div>

        {/* Action / Download Button */}
        {downloadUrl && (
          <a 
            href={downloadUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-wild-sunset text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-wild-sunset/90 transition-all duration-300 shadow-sm hover:shadow-md self-start"
          >
            <FileDown size={14} />
            <span>Download Journal</span>
          </a>
        )}
      </div>
    </div>
  );
}
