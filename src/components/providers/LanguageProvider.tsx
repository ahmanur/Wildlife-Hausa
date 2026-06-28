"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '@/lib/translations';
import { db } from '@/lib/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { usePathname } from 'next/navigation';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  settings: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem('wildhausa_lang') as Language;
    if (saved === 'en' || saved === 'ha') {
      setLanguageState(saved);
      document.documentElement.lang = saved;
    } else {
      document.documentElement.lang = 'en';
    }
    setMounted(true);
  }, []);

  // Listen to global settings in real-time
  useEffect(() => {
    let active = true;
    try {
      const docRef = doc(db, 'settings', 'global');
      const unsub = onSnapshot(docRef, (docSnap) => {
        if (active) {
          if (docSnap.exists()) {
            setSettings(docSnap.data());
          }
          setLoading(false);
        }
      }, (err) => {
        console.warn("Failed to fetch settings from Firestore, using defaults:", err);
        if (active) {
          setLoading(false);
        }
      });
      return () => {
        active = false;
        unsub();
      };
    } catch (e) {
      console.warn("Settings listener setup failed:", e);
      setLoading(false);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('wildhausa_lang', lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string, fallback?: string): string => {
    // Check dynamic settings override first
    if (settings?.overrides?.[key]) {
      const override = settings.overrides[key];
      return override[language] || override['en'] || fallback || key;
    }

    const translation = translations[key];
    if (!translation) {
      return fallback || key;
    }
    return translation[language] || translation['en'] || fallback || key;
  };

  const isAdmin = pathname?.startsWith('/admin');
  const showLoader = (!mounted || loading) && !isAdmin;

  if (showLoader) {
    return (
      <div className="fixed inset-0 z-[99999] bg-[#FAF9F5] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-28 h-28 animate-pulse rounded-full overflow-hidden">
            <img
              src="/logo.png"
              alt="Wild Hausa Logo"
              className="w-full h-full object-contain animate-spin-slow rounded-full"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          
          <div className="flex flex-col items-center gap-1.5">
            <span className="font-serif font-bold text-4xl text-wild-forest tracking-wider">Wild Hausa</span>
            <span className="text-[10px] text-wild-sunset uppercase tracking-widest font-sans font-bold">{t('hero_badge')}</span>
          </div>
          
          <div className="w-16 h-[3px] bg-wild-sunset rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, settings }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
