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
            </div>
          </div>
          
          <div className="lg:w-2/3">
            <form className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-wild-sand" onSubmit={handleSubmit}>
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg font-medium">
                  ✓ {t('book_success_title', 'Enquiry Sent Successfully!')} {t('book_success_p', 'We have received your request and will get back to you shortly.')}
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
                  <label className="block text-sm font-bold text-wild-forest mb-2">{t('contact_form_name')} *</label>
                  <input 
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
                  <label className="block text-sm font-bold text-wild-forest mb-2">{t('contact_form_email')} *</label>
                  <input 
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
                  <label className="block text-sm font-bold text-wild-forest mb-2">{t('contact_form_phone')}</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-wild-sand/30 border border-wild-brown/20 rounded-lg focus:outline-none focus:border-wild-sunset text-wild-charcoal" 
                    placeholder="+234..." 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-wild-forest mb-2">{t('contact_form_interest')}</label>
                  <select 
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
                <label className="block text-sm font-bold text-wild-forest mb-2">{t('contact_form_message')} *</label>
                <textarea 
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
