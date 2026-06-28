"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { subscribeNewsletter } from '@/lib/firebase/services';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Hide on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    setMessage('');
    
    try {
      await subscribeNewsletter(email);
      setStatus('success');
      setMessage(t('subscribe_success'));
      setEmail('');
    } catch (err) {
      console.error('Newsletter error:', err);
      setStatus('error');
      setMessage(t('subscribe_error'));
    }
  };

  return (
    <footer className="bg-wild-deep-forest text-wild-cream pt-20 pb-10 border-t-4 border-wild-sunset relative overflow-hidden">
      {/* Decorative Tree Branch Motif */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 0C100 0 80 20 70 50C60 80 30 90 0 100" stroke="currentColor" strokeWidth="2" />
          <path d="M70 50C70 50 50 60 40 80" stroke="currentColor" strokeWidth="1.5" />
          <path d="M85 20C85 20 70 30 65 45" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Col */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Wild Hausa Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-serif text-2xl font-bold tracking-wide">Wild Hausa</span>
            </div>
            <p className="text-wild-sand/70 font-sans text-sm leading-relaxed mb-6">
              {t('footer_tagline')}
            </p>
            <div className="text-wild-sunset text-xs uppercase tracking-widest font-bold mb-6">
              {t('hero_badge')}
            </div>
            {/* Social Media Links */}
            <div className="flex items-center gap-3">
              <a href={t('social_facebook', 'https://facebook.com')} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-wild-forest/50 hover:bg-wild-sunset border border-wild-moss hover:border-wild-sunset flex items-center justify-center text-wild-cream hover:text-white transition-all duration-300 shadow-sm" aria-label="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>

              <a href={t('social_youtube', 'https://youtube.com')} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-wild-forest/50 hover:bg-wild-sunset border border-wild-moss hover:border-wild-sunset flex items-center justify-center text-wild-cream hover:text-white transition-all duration-300 shadow-sm" aria-label="YouTube">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" clipRule="evenodd" />
                </svg>
              </a>

              <a href={t('social_instagram', 'https://instagram.com')} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-wild-forest/50 hover:bg-wild-sunset border border-wild-moss hover:border-wild-sunset flex items-center justify-center text-wild-cream hover:text-white transition-all duration-300 shadow-sm" aria-label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.22 2.428.47a4.902 4.902 0 0 1 1.77 1.15 4.902 4.902 0 0 1 1.15 1.77c.25.637.42 1.363.47 2.428.05 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.22 1.79-.47 2.428a4.902 4.902 0 0 1-1.15 1.77 4.902 4.902 0 0 1-1.77 1.15c-.637.25-1.363.42-2.428.47-1.066.05-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.22-2.428-.47a4.902 4.902 0 0 1-1.77-1.15 4.902 4.902 0 0 1-1.15-1.77c-.25-.637-.42-1.363-.47-2.428C2.01 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.065.22-1.79.47-2.428a4.902 4.902 0 0 1 1.15-1.77 4.902 4.902 0 0 1 1.77-1.15c.637-.25 1.363-.42 2.428-.47C8.944 2.01 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm5-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" clipRule="evenodd" />
                </svg>
              </a>

              <a href={t('social_tiktok', 'https://tiktok.com')} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-wild-forest/50 hover:bg-wild-sunset border border-wild-moss hover:border-wild-sunset flex items-center justify-center text-wild-cream hover:text-white transition-all duration-300 shadow-sm" aria-label="TikTok">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.52-4.06-1.39-.24-.18-.45-.38-.66-.6V12.1c.01 2.58-.78 5.25-2.67 7.03-2.15 2.05-5.46 2.65-8.22 1.63-2.91-1.05-4.99-4.14-4.83-7.25.13-3.32 2.61-6.26 5.89-6.73 1.18-.18 2.39-.08 3.52.28V11.2c-.89-.48-1.94-.6-2.91-.32-1.48.4-2.58 1.83-2.61 3.37-.02 1.89 1.48 3.55 3.39 3.57 1.9.04 3.55-1.41 3.63-3.3V0z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h3 className="font-serif text-xl mb-6 text-wild-sun-soft">{t('footer_quick_links')}</h3>
            <ul className="space-y-4 font-sans text-sm text-wild-sand/80">
              <li><Link href="/safaris" className="hover:text-wild-sunset transition-colors">{t('expeditions')}</Link></li>
              <li><Link href="/documentaries" className="hover:text-wild-sunset transition-colors">{t('films')}</Link></li>
              <li><Link href="/services" className="hover:text-wild-sunset transition-colors">{t('worlds')}</Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h3 className="font-serif text-xl mb-6 text-wild-sun-soft">{t('wild_hausa')}</h3>
            <ul className="space-y-4 font-sans text-sm text-wild-sand/80">
              <li><Link href="/about" className="hover:text-wild-sunset transition-colors">{t('our_story')}</Link></li>
              <li><Link href="/contact" className="hover:text-wild-sunset transition-colors">{t('plan_journey')}</Link></li>
            </ul>
          </div>

          {/* Connect Col */}
          <div>
            <h3 className="font-serif text-xl mb-6 text-wild-sun-soft">{t('subscribe_title')}</h3>
            <p className="text-wild-sand/70 font-sans text-sm leading-relaxed mb-4">
              {t('subscribe_subtitle')}
            </p>
            <form className="flex flex-col gap-2" onSubmit={handleSubscribe}>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('email_placeholder')}
                  aria-label={t('email_placeholder')}
                  className="bg-wild-forest/50 border border-wild-moss text-white px-4 py-2 rounded-full text-sm focus:outline-none focus:border-wild-sunset flex-grow"
                  disabled={status === 'loading'}
                  required
                />
                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-wild-sunset text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-wild-sun-soft transition-colors shrink-0 disabled:opacity-50"
                >
                  {status === 'loading' ? '...' : '+'}
                </button>
              </div>
              {message && (
                <p className={`text-xs mt-1 ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-wild-forest/50 flex flex-col md:flex-row justify-between items-center gap-4 text-wild-sand/50 text-xs font-sans">
          <div className="flex flex-wrap items-start justify-center md:justify-start gap-x-3 gap-y-1">
            <span className="whitespace-pre-line">{t('footer_rights')}</span>
            <span className="text-wild-sand/30">·</span>
            <Link href="#" className="hover:text-wild-sunset transition-colors">{t('footer_privacy')}</Link>
            <span className="text-wild-sand/30">·</span>
            <Link href="#" className="hover:text-wild-sunset transition-colors">{t('footer_terms')}</Link>
          </div>
          <div className="text-wild-sand/60 font-medium">
            {t('designed_by')}
          </div>
        </div>
      </div>
    </footer>
  );
}
