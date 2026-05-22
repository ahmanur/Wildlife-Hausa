"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, pathname]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  // Hide on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header className="fixed top-6 left-0 right-0 z-[9999] px-6 pointer-events-none flex justify-center">
        <div className="w-full max-w-7xl bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg rounded-full pointer-events-auto transition-all duration-300">
          <div className="px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group" onClick={closeMenu}>
              <div className="relative w-16 h-16 transition-transform duration-300 group-hover:scale-105 drop-shadow-md">
                <Image
                  src="/logo.png"
                  alt="Wild Hausa Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-serif text-lg font-bold text-wild-forest tracking-tight leading-tight">WILD HAUSA</span>
                <span className="text-[9px] text-wild-forest/50 tracking-[0.12em] font-sans uppercase">Duniyar Dabbobin Daji</span>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8">
              <NavLink href="/">{t('home')}</NavLink>
              <NavLink href="/about">{t('our_story')}</NavLink>
              <NavLink href="/services">{t('worlds')}</NavLink>
              <NavLink href="/safaris">{t('expeditions')}</NavLink>
              <NavLink href="/documentaries">{t('films')}</NavLink>
              <NavLink href="/expedition-map">{t('map')}</NavLink>
            </nav>
            
            <div className="flex items-center gap-4">
              {/* Premium Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'ha' : 'en')}
                className="hidden md:flex items-center gap-1.5 text-xs font-bold tracking-wider text-wild-forest hover:text-wild-sunset transition-all px-3 py-1.5 rounded-full border border-wild-forest/15 hover:border-wild-sunset bg-white/40 shadow-sm cursor-pointer"
                title={language === 'en' ? 'Fassara zuwa Hausa' : 'Translate to English'}
              >
                <span className={language === 'en' ? 'text-wild-sunset font-extrabold' : 'text-wild-forest/60'}>EN</span>
                <span className="text-wild-forest/20">|</span>
                <span className={language === 'ha' ? 'text-wild-sunset font-extrabold' : 'text-wild-forest/60'}>HA</span>
              </button>

              <div className="hidden md:flex">
                <Link 
                  href="/contact" 
                  className="px-6 py-2.5 rounded-full bg-wild-forest text-white hover:bg-wild-sunset hover:shadow-md transition-all duration-300 text-sm font-semibold tracking-wide"
                >
                  {t('plan_journey')}
                </Link>
              </div>
              
              {/* Mobile menu button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-wild-forest p-2 hover:bg-black/5 rounded-full transition-colors relative z-[9999]"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div 
        className={`fixed inset-0 z-[9998] bg-white/98 backdrop-blur-xl transition-all duration-500 ease-in-out flex flex-col md:hidden pt-32 pb-8 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div 
          className={`flex-1 flex flex-col items-center justify-center gap-8 overflow-y-auto px-6 transition-transform duration-500 delay-100 ${
            isMobileMenuOpen ? 'translate-y-0' : 'translate-y-8'
          }`}
        >
          <nav className="flex flex-col items-center gap-6 w-full">
            <Link href="/" onClick={closeMenu} className="text-2xl font-serif font-bold text-wild-forest hover:text-wild-sunset transition-colors">{t('home')}</Link>
            <Link href="/about" onClick={closeMenu} className="text-2xl font-serif font-bold text-wild-forest hover:text-wild-sunset transition-colors">{t('our_story')}</Link>
            <Link href="/services" onClick={closeMenu} className="text-2xl font-serif font-bold text-wild-forest hover:text-wild-sunset transition-colors">{t('worlds')}</Link>
            <Link href="/safaris" onClick={closeMenu} className="text-2xl font-serif font-bold text-wild-forest hover:text-wild-sunset transition-colors">{t('expeditions')}</Link>
            <Link href="/documentaries" onClick={closeMenu} className="text-2xl font-serif font-bold text-wild-forest hover:text-wild-sunset transition-colors">{t('films')}</Link>
            <Link href="/expedition-map" onClick={closeMenu} className="text-2xl font-serif font-bold text-wild-forest hover:text-wild-sunset transition-colors">{t('map')}</Link>
          </nav>

          <div className="w-12 h-px bg-wild-forest/20 my-2"></div>

          <div className="flex flex-col items-center gap-6 w-full">
            <button
              onClick={() => {
                setLanguage(language === 'en' ? 'ha' : 'en');
              }}
              className="flex items-center justify-center gap-3 w-full max-w-xs text-sm font-bold tracking-wider text-wild-forest px-6 py-3 rounded-full border border-wild-forest/20 hover:border-wild-sunset hover:bg-wild-sunset/5 transition-colors"
            >
              <span className={language === 'en' ? 'text-wild-sunset font-extrabold' : 'text-wild-forest/60'}>ENGLISH</span>
              <span className="text-wild-forest/20">|</span>
              <span className={language === 'ha' ? 'text-wild-sunset font-extrabold' : 'text-wild-forest/60'}>HAUSA</span>
            </button>

            <Link 
              href="/contact" 
              onClick={closeMenu}
              className="w-full max-w-xs text-center px-8 py-4 rounded-full bg-wild-forest text-white hover:bg-wild-sunset shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold tracking-wide"
            >
              {t('plan_journey')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="text-wild-forest/80 hover:text-wild-sunset transition-colors font-sans font-semibold text-sm tracking-wide relative group"
    >
      {children}
      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-1 bg-wild-sunset rounded-t-full transition-all duration-300 group-hover:w-1/2" />
    </Link>
  );
}
