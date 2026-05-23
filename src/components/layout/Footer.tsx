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
              <div className="relative w-12 h-12 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Wild Hausa Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-serif text-2xl font-bold tracking-wide">WILD HAUSA</span>
            </div>
            <p className="text-wild-sand/70 font-sans text-sm leading-relaxed mb-6">
              {t('footer_tagline')}
            </p>
            <div className="text-wild-sunset text-xs uppercase tracking-widest font-bold">
              Duniyar Dabbobin Daji
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
              <li><Link href="/expedition-map" className="hover:text-wild-sunset transition-colors">{t('map')}</Link></li>
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
          <p>{t('footer_rights')} · {t('designed_by')}</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-wild-sunset transition-colors">{t('footer_privacy')}</Link>
            <Link href="#" className="hover:text-wild-sunset transition-colors">{t('footer_terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
