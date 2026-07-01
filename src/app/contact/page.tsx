"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WildSectionHeader } from '@/components/ui/WildSectionHeader';
import { WildCTA } from '@/components/ui/WildCTA';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { submitEnquiry } from '@/lib/firebase/services';
import { Loader2 } from 'lucide-react';

function ContactContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'General Enquiry',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const interestParam = searchParams.get('interest');
    if (interestParam) {
      let mappedInterest = 'General Enquiry';
      if (interestParam === 'adventure' || interestParam === 'Adventure Park') {
        mappedInterest = 'Adventure Park';
      } else if (interestParam === 'school-tour' || interestParam === 'School Programme') {
        mappedInterest = 'School Programme';
      } else if (interestParam === 'resources') {
        mappedInterest = 'General Enquiry';
      } else {
        const validInterests = ['Safari Booking', 'Documentary / Media', 'Adventure Park', 'School Programme', 'Partnership', 'General Enquiry'];
        const decoded = decodeURIComponent(interestParam);
        if (validInterests.includes(decoded)) {
          mappedInterest = decoded;
        }
      }
      setFormData(prev => ({ ...prev, interest: mappedInterest }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError(t('contact_error_fields', 'Please fill in all required fields.'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      await submitEnquiry({
        ...formData,
        status: 'unread'
      });
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        interest: 'General Enquiry',
        message: ''
      });
    } catch (err) {
      console.error(err);
      setError(t('contact_error_submit', 'Failed to submit enquiry. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-wild-cream">
      <section className="pt-32 pb-20 bg-wild-forest text-wild-cream text-center relative">
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6">{t('contact_hero_title')}</h1>
          <p className="text-xl text-wild-sand/80 font-sans leading-relaxed">
            {t('contact_hero_subtitle')}
          </p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/3">
            <WildSectionHeader title={t('contact_get_in_touch')} subtitle={t('contact_get_in_touch_desc')} />
            
            <div className="mt-8 space-y-6 text-wild-forest">
              <div>
                <h4 className="font-bold font-serif text-xl mb-2">{t('contact_hq')}</h4>
                <p className="text-wild-muted">{t('contact_hq_val')}</p>
              </div>
              <div>
                <h4 className="font-bold font-serif text-xl mb-2">{t('contact_us')}</h4>
                <p className="text-wild-muted">{t('contact_val')}</p>
              </div>
              
              <div className="pt-4">
                <h4 className="font-bold font-serif text-xl mb-3">Follow Us</h4>
                <div className="flex items-center gap-3">
                  <a href={t('social_facebook', 'https://facebook.com')} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-wild-forest hover:bg-wild-sunset flex items-center justify-center text-white transition-all duration-300 shadow-sm" aria-label="Facebook">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>

                  <a href={t('social_youtube', 'https://youtube.com')} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-wild-forest hover:bg-wild-sunset flex items-center justify-center text-white transition-all duration-300 shadow-sm" aria-label="YouTube">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" clipRule="evenodd" />
                    </svg>
                  </a>

                  <a href={t('social_instagram', 'https://instagram.com')} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-wild-forest hover:bg-wild-sunset flex items-center justify-center text-white transition-all duration-300 shadow-sm" aria-label="Instagram">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.22 2.428.47a4.902 4.902 0 0 1 1.77 1.15 4.902 4.902 0 0 1 1.15 1.77c.25.637.42 1.363.47 2.428.05 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.22 1.79-.47 2.428a4.902 4.902 0 0 1-1.15 1.77 4.902 4.902 0 0 1-1.77 1.15c-.637.25-1.363.42-2.428.47-1.066.05-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.22-2.428-.47a4.902 4.902 0 0 1-1.77-1.15 4.902 4.902 0 0 1-1.15-1.77c-.25-.637-.42-1.363-.47-2.428C2.01 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.065.22-1.79.47-2.428a4.902 4.902 0 0 1 1.15-1.77 4.902 4.902 0 0 1 1.77-1.15c.637-.25 1.363-.42 2.428-.47C8.944 2.01 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm5-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" clipRule="evenodd" />
                    </svg>
                  </a>

                  <a href={t('social_tiktok', 'https://tiktok.com')} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-wild-forest hover:bg-wild-sunset flex items-center justify-center text-white transition-all duration-300 shadow-sm" aria-label="TikTok">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.52-4.06-1.39-.24-.18-.45-.38-.66-.6V12.1c.01 2.58-.78 5.25-2.67 7.03-2.15 2.05-5.46 2.65-8.22 1.63-2.91-1.05-4.99-4.14-4.83-7.25.13-3.32 2.61-6.26 5.89-6.73 1.18-.18 2.39-.08 3.52.28V11.2c-.89-.48-1.94-.6-2.91-.32-1.48.4-2.58 1.83-2.61 3.37-.02 1.89 1.48 3.55 3.39 3.57 1.9.04 3.55-1.41 3.63-3.3V0z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-2/3">
            <form className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-wild-sand" onSubmit={handleSubmit}>
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg font-medium">
                  ✓ {t('contact_success_msg', 'Enquiry has been sent successfully')}
                  <button type="button" onClick={() => setSuccess(false)} className="block mt-2 text-sm text-green-700 underline">{t('contact_success_another', 'Send another message')}</button>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg font-medium">
                  ✗ {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="contact_name" className="block text-sm font-bold text-wild-forest mb-2">{t('contact_form_name')} *</label>
                  <input 
                    id="contact_name"
                    type="text" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-wild-sand/30 border border-wild-brown/20 rounded-lg focus:outline-none focus:border-wild-sunset text-wild-charcoal" 
                    placeholder="Amina Bello" 
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="contact_email" className="block text-sm font-bold text-wild-forest mb-2">{t('contact_form_email')} *</label>
                  <input 
                    id="contact_email"
                    type="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-wild-sand/30 border border-wild-brown/20 rounded-lg focus:outline-none focus:border-wild-sunset text-wild-charcoal" 
                    placeholder="amina@example.com" 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="contact_phone" className="block text-sm font-bold text-wild-forest mb-2">{t('contact_form_phone')}</label>
                  <input 
                    id="contact_phone"
                    type="tel" 
                    name="phone" 
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-wild-sand/30 border border-wild-brown/20 rounded-lg focus:outline-none focus:border-wild-sunset text-wild-charcoal" 
                    placeholder="+234..." 
                  />
                </div>
                <div>
                  <label htmlFor="contact_interest" className="block text-sm font-bold text-wild-forest mb-2">{t('contact_form_interest')}</label>
                  <select 
                    id="contact_interest"
                    name="interest" 
                    value={formData.interest}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-wild-sand/30 border border-wild-brown/20 rounded-lg focus:outline-none focus:border-wild-sunset text-wild-charcoal"
                  >
                    <option value="Safari Booking">{t('contact_interest_safari')}</option>
                    <option value="Documentary / Media">{t('contact_interest_doc')}</option>
                    <option value="Adventure Park">{t('contact_interest_park')}</option>
                    <option value="School Programme">{t('contact_interest_school')}</option>
                    <option value="Partnership">{t('contact_interest_partner')}</option>
                    <option value="General Enquiry">{t('contact_interest_general')}</option>
                  </select>
                </div>
              </div>

              <div className="mb-8">
                <label htmlFor="contact_message" className="block text-sm font-bold text-wild-forest mb-2">{t('contact_form_message')} *</label>
                <textarea 
                  id="contact_message"
                  rows={5} 
                  name="message" 
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-wild-sand/30 border border-wild-brown/20 rounded-lg focus:outline-none focus:border-wild-sunset resize-none text-wild-charcoal" 
                  placeholder={t('contact_form_placeholder')}
                  required
                ></textarea>
              </div>

              <WildCTA variant="primary" className="w-full md:w-auto flex items-center justify-center gap-2" type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('contact_form_send')}
              </WildCTA>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-wild-cream items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-wild-sunset" />
      </div>
    }>
      <ContactContent />
    </Suspense>
  );
}
