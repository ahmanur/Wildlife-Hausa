"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { WildSectionHeader } from '@/components/ui/WildSectionHeader';
import { WildCTA } from '@/components/ui/WildCTA';
import { BookOpen, Leaf, HeartHandshake } from 'lucide-react';
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            {translatedNotes.map((note, idx) => (
              <FieldNoteCard
                key={note.id || idx}
                title={note.title}
                text={note.text}
                icon={iconMap[note.icon] || <BookOpen />}
              />
            ))}
          </div>
        )}

        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-wild-sand flex flex-col lg:flex-row">
          <div className="lg:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
            <h2 className="font-serif text-4xl text-wild-forest font-bold mb-6">{t('cons_school_title')}</h2>
            <p className="text-wild-muted text-lg mb-8 leading-relaxed">
              {t('cons_school_desc')}
            </p>
            <div className="flex gap-4">
              <WildCTA variant="primary" href="/contact?interest=school-tour">{t('cons_school_btn_tour')}</WildCTA>
              <WildCTA variant="outline" href="/contact?interest=resources">{t('cons_school_btn_dl')}</WildCTA>
            </div>
          </div>
          <div className="lg:w-1/2 h-64 lg:h-auto relative">
            <Image src="https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1000" alt="Conservation Education" fill className="object-cover" />
          </div>
        </div>
      </section>
    </div>
  );
}

function FieldNoteCard({ title, text, icon }: any) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-wild-cream hover:shadow-md transition-shadow relative">
      <div className="absolute top-0 right-0 w-16 h-16 bg-wild-cream rounded-bl-3xl flex items-center justify-center text-wild-moss">
        {icon}
      </div>
      <h3 className="font-serif text-2xl text-wild-forest font-bold mb-4 pr-12">{title}</h3>
      <p className="text-wild-muted leading-relaxed">{text}</p>
    </div>
  );
}
