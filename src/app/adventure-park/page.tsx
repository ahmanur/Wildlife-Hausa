"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { WildSectionHeader } from '@/components/ui/WildSectionHeader';
import { WildCTA } from '@/components/ui/WildCTA';
import { Tent, Users, Mountain, ShieldAlert, Compass } from 'lucide-react';
import { getAdventureActivities } from '@/lib/firebase/services';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { translateActivity } from '@/lib/translations';

const iconMap: Record<string, React.ReactNode> = {
  'Nature Trails': <Mountain />,
  'Camping Grounds': <Tent />,
  'Team Building': <Users />,
};

export default function AdventureParkPage() {
  const { language, t } = useLanguage();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        const fetched = await getAdventureActivities();
        setActivities(fetched);
      } catch (err) {
        console.error('Error fetching adventure activities:', err);
      } finally {
        setLoading(false);
      }
    }
    loadActivities();
  }, []);

  const translatedActivities = activities.map(act => translateActivity(act, language));

  return (
    <div className="flex flex-col min-h-screen bg-wild-cream">
      <section className="pt-32 pb-20 bg-wild-sand text-center relative">
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <h1 className="font-serif text-5xl md:text-7xl text-wild-forest font-bold mb-6">{t('adventure_hero_title')}</h1>
          <p className="text-xl text-wild-muted font-sans leading-relaxed">
            {t('adventure_hero_subtitle')}
          </p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6 lg:px-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-wild-sunset border-t-transparent rounded-full animate-spin" />
            <p className="text-wild-forest text-lg">{t('adventure_loading')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {translatedActivities.map((act, idx) => {
              const rawAct = activities[idx];
              return (
                <AdventureCard
                  key={act.id || idx}
                  title={act.title}
                  text={act.text}
                  image={act.image}
                  icon={iconMap[rawAct.title] || <Compass />}
                />
              );
            })}
          </div>
        )}
      </section>
      
      <section className="py-16 bg-wild-forest text-wild-cream text-center">
        <div className="container mx-auto px-6 max-w-3xl flex flex-col items-center gap-4">
          <ShieldAlert size={48} className="text-wild-sunset" />
          <h2 className="font-serif text-3xl font-bold">{t('adventure_safety_title')}</h2>
          <p className="text-wild-sand/80 mb-6">{t('adventure_safety_desc')}</p>
          <WildCTA variant="primary" href="/contact?interest=adventure">{t('adventure_book_btn')}</WildCTA>
        </div>
      </section>
    </div>
  );
}

function AdventureCard({ title, text, icon, image }: any) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group">
      <div className="h-48 relative overflow-hidden">
        <Image src={image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
      </div>
      <div className="p-8 relative">
        <div className="absolute -top-8 right-8 w-16 h-16 bg-wild-cream rounded-full flex items-center justify-center text-wild-sunset shadow-sm">
          {icon}
        </div>
        <h3 className="font-serif text-2xl text-wild-forest font-bold mb-3 mt-2">{title}</h3>
        <p className="text-wild-muted">{text}</p>
      </div>
    </div>
  );
}
