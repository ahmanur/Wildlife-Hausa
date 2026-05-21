"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '@/lib/translations';
import { db } from '@/lib/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

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
    try {
      const docRef = doc(db, 'settings', 'global');
      const unsub = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }
      }, (err) => {
        console.warn("Failed to fetch settings from Firestore, using defaults:", err);
      });
      return () => unsub();
    } catch (e) {
      console.warn("Settings listener setup failed:", e);
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
