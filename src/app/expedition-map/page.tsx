"use client";

import React from 'react';
import { ExpeditionMap } from '@/components/map/ExpeditionMap';
import { Compass, Map as MapIcon, Navigation } from 'lucide-react';
import { WildSectionHeader } from '@/components/ui/WildSectionHeader';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function ExpeditionMapPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-wild-sand pt-32 pb-24">
      <div className="container-wild">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-wild-cream text-wild-sunset rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <Compass size={14} />
            {t('map_badge')}
          </div>
          <WildSectionHeader 
            title={t('map_title')}
            subtitle={t('map_subtitle')}
          />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-xl">
          <ExpeditionMap />
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-wild-cream">
            <div className="w-12 h-12 bg-wild-sand text-wild-sunset rounded-full flex items-center justify-center mb-6">
              <Navigation size={24} />
            </div>
            <h3 className="text-xl font-serif font-bold text-wild-forest mb-3">{t('map_col1_title')}</h3>
            <p className="text-wild-charcoal text-sm leading-relaxed">
              {t('map_col1_text')}
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-md border border-wild-cream">
            <div className="w-12 h-12 bg-wild-sand text-wild-moss rounded-full flex items-center justify-center mb-6">
              <MapIcon size={24} />
            </div>
            <h3 className="text-xl font-serif font-bold text-wild-forest mb-3">{t('map_col2_title')}</h3>
            <p className="text-wild-charcoal text-sm leading-relaxed">
              {t('map_col2_text')}
            </p>
          </div>

          <div className="bg-wild-forest p-8 rounded-2xl shadow-md text-white">
            <h3 className="text-xl font-serif font-bold mb-3">{t('map_col3_title')}</h3>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              {t('map_col3_text')}
            </p>
            <a href="/safaris" className="inline-block px-6 py-3 bg-wild-sunset hover:bg-wild-sun-soft text-white font-bold rounded-lg transition-colors text-sm">
              {t('map_col3_btn')}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
