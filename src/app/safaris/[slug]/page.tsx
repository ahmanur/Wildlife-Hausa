"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { WildSectionHeader } from '@/components/ui/WildSectionHeader';
import { WildCTA } from '@/components/ui/WildCTA';
import { Map, Clock, CheckCircle, ShieldAlert, Calendar, Users, Info } from 'lucide-react';
import { getSafariPackageBySlug, submitBooking } from '@/lib/firebase/services';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { translateSafari, formatSafariPrice, calculateEstimatedTotal } from '@/lib/translations';

export default function SafariDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const { language, t } = useLanguage();
  const [safari, setSafari] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [guests, setGuests] = useState('2 Explorers');
  
  const [submitting, setSubmitting] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  useEffect(() => {
    async function loadSafari() {
      try {
        const data = await getSafariPackageBySlug(slug);
        setSafari(data);
      } catch (err) {
        console.error('Error fetching safari details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSafari();
  }, [slug]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !name || !email) {
      alert(language === 'en' ? "Please fill all required fields." : "Da fatan za a cika dukkan filayen.");
      return;
    }
    
    setSubmitting(true);
    try {
      await submitBooking({
        safariId: safari.id,
        safariTitle: safari.title,
        name,
        email,
        date: bookingDate,
        guests
      });
      setBookingSubmitted(true);
      setName('');
      setEmail('');
      setBookingDate('');
    } catch (err) {
      console.error("Booking error", err);
      alert(language === 'en' ? "Error submitting booking." : "Kuskure wajen aika bukatar.");
    } finally {
      setSubmitting(false);
    }
  };

  const getGuestsText = (val: string) => {
    if (val === '1 Explorer') return t('book_guests_1');
    if (val === '2 Explorers') return t('book_guests_2');
    if (val === '3 - 5 Explorers') return t('book_guests_3_5');
    if (val === 'Group (6+)') return t('book_guests_6');
    return val;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-wild-sand items-center justify-center py-32">
        <div className="w-16 h-16 border-4 border-wild-sunset border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-wild-forest font-serif text-lg">{t('details_loading')}</p>
      </div>
    );
  }

  const translatedSafari = safari ? translateSafari(safari, language) : null;

  if (!translatedSafari) {
    return (
      <div className="flex flex-col min-h-screen bg-wild-sand items-center justify-center py-32 px-6 text-center">
        <Info size={48} className="text-wild-sunset mb-4" />
        <h1 className="font-serif text-4xl text-wild-forest font-bold mb-4">{t('details_not_found')}</h1>
        <p className="text-wild-muted max-w-md mb-8">{t('details_not_found_desc')}</p>
        <a href="/safaris" className="px-6 py-3 bg-wild-forest text-white rounded-lg hover:bg-wild-sunset transition-colors font-medium">
          {t('details_back_btn')}
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-wild-sand">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[500px] flex items-end pb-16">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <Image 
          src={translatedSafari.image || "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=2000"} 
          alt={translatedSafari.title} 
          fill 
          className="object-cover"
        />
        <div className="container mx-auto px-6 lg:px-12 relative z-20">
          <div className="inline-block mb-4 px-3 py-1 bg-wild-sunset text-white text-xs font-bold tracking-widest uppercase rounded">
            {t('plan_journey')}
          </div>
          <h1 className="font-serif text-5xl md:text-7xl text-white font-bold mb-4 drop-shadow-md">
            {translatedSafari.title}
          </h1>
          <div className="flex flex-wrap gap-6 text-white/90 font-medium">
            <span className="flex items-center gap-2"><Map size={20} /> {translatedSafari.location}</span>
            <span className="flex items-center gap-2"><Clock size={20} /> {translatedSafari.duration}</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-12">
        <div className="lg:w-2/3">
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-wild-cream mb-12">
            <h2 className="font-serif text-3xl font-bold text-wild-forest mb-6">{t('details_overview')}</h2>
            <p className="text-wild-muted text-lg leading-relaxed mb-6">
              {translatedSafari.overview || "Embark on an unforgettable journey. Experience local wildlife up close, guided by our master conservationist trackers."}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-wild-sand">
              <div>
                <span className="block text-xs text-wild-muted uppercase tracking-wider mb-1">{t('details_group_size')}</span>
                <span className="font-bold text-wild-charcoal">{translatedSafari.groupSize || "2 - 8 People"}</span>
              </div>
              <div>
                <span className="block text-xs text-wild-muted uppercase tracking-wider mb-1">{t('details_best_time')}</span>
                <span className="font-bold text-wild-charcoal">{translatedSafari.bestTime || "All Year"}</span>
              </div>
              <div>
                <span className="block text-xs text-wild-muted uppercase tracking-wider mb-1">{t('details_time')}</span>
                <span className="font-bold text-wild-charcoal">{translatedSafari.time || "N/A"}</span>
              </div>
              <div>
                <span className="block text-xs text-wild-muted uppercase tracking-wider mb-1">{t('details_starting_price')}</span>
                <span className="font-bold text-wild-charcoal">
                  {formatSafariPrice(translatedSafari.price, translatedSafari.showPricing, language)}
                </span>
              </div>
            </div>
          </div>

          {translatedSafari.itinerary && translatedSafari.itinerary.length > 0 && (
            <div className="mb-12">
              <WildSectionHeader title={t('details_itinerary_title')} />
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-wild-sunset/30">
                {translatedSafari.itinerary.map((item: any, idx: number) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-wild-sunset text-white font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-md">
                      {item.day || (idx + 1)}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl shadow-sm border border-wild-cream">
                      <h4 className="font-bold text-lg text-wild-forest mb-2">{item.title}</h4>
                      <p className="text-wild-muted text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="bg-wild-forest text-wild-cream p-8 rounded-2xl flex gap-6 items-start">
            <ShieldAlert size={40} className="text-wild-sunset shrink-0" />
            <div>
              <h4 className="font-serif text-2xl font-bold mb-2">{t('details_safety_notes')}</h4>
              <p className="text-wild-sand/80 text-sm leading-relaxed mb-4">
                {t('details_safety_p')}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-wild-sand">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-wild-sunset"/> {t('details_incl_1')}</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-wild-sunset"/> {t('details_incl_2')}</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-wild-sunset"/> {t('details_incl_3')}</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-wild-sunset"/> {t('details_incl_4')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-lg border border-wild-sand p-8 sticky top-24">
            <h3 className="font-serif text-3xl font-bold text-wild-forest mb-2">{t('book_this_safari')}</h3>
            <p className="text-wild-muted mb-6">{t('book_desc')}</p>
            
            {bookingSubmitted ? (
              <div className="bg-wild-cream/50 border border-wild-sunset/30 rounded-xl p-6 text-center">
                <CheckCircle className="mx-auto text-wild-sunset mb-3" size={36} />
                <h4 className="font-bold text-wild-forest mb-2">{t('book_success_title')}</h4>
                <p className="text-sm text-wild-muted mb-4">
                  {language === 'en' 
                    ? `We have received your request for `
                    : `Mun sami bukatarku ta `}
                  <strong>{translatedSafari.title}</strong>
                  {language === 'en'
                    ? ` starting on `
                    : ` farawa ranar `}
                  <strong>{bookingDate}</strong>
                  {language === 'en'
                    ? ` with `
                    : ` tare da `}
                  <strong>{getGuestsText(guests)}</strong>.
                </p>
                <button 
                  onClick={() => setBookingSubmitted(false)}
                  className="text-wild-sunset text-sm font-bold hover:underline cursor-pointer"
                >
                  {t('book_modify_btn')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="booking_name" className="block text-sm font-bold text-wild-forest mb-2">Name</label>
                  <input 
                    id="booking_name"
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3 bg-wild-sand/50 border border-wild-brown/20 rounded-lg focus:outline-none focus:border-wild-sunset text-wild-charcoal" 
                  />
                </div>
                <div>
                  <label htmlFor="booking_email" className="block text-sm font-bold text-wild-forest mb-2">Email</label>
                  <input 
                    id="booking_email"
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-4 py-3 bg-wild-sand/50 border border-wild-brown/20 rounded-lg focus:outline-none focus:border-wild-sunset text-wild-charcoal" 
                  />
                </div>
                <div>
                  <label htmlFor="booking_date" className="block text-sm font-bold text-wild-forest mb-2">{t('book_start_date')}</label>
                  <input 
                    id="booking_date"
                    type="date" 
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-4 py-3 bg-wild-sand/50 border border-wild-brown/20 rounded-lg focus:outline-none focus:border-wild-sunset text-wild-charcoal" 
                  />
                </div>
                <div>
                  <label htmlFor="booking_guests" className="block text-sm font-bold text-wild-forest mb-2">{t('book_guests')}</label>
                  <select 
                    id="booking_guests"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full px-4 py-3 bg-wild-sand/50 border border-wild-brown/20 rounded-lg focus:outline-none focus:border-wild-sunset text-wild-charcoal"
                  >
                    <option value="1 Explorer">{t('book_guests_1')}</option>
                    <option value="2 Explorers">{t('book_guests_2')}</option>
                    <option value="3 - 5 Explorers">{t('book_guests_3_5')}</option>
                    <option value="Group (6+)">{t('book_guests_6')}</option>
                  </select>
                </div>
                <div className="mt-4 border-t border-wild-cream pt-4 pb-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-wild-forest">{t('book_est_total')}</span>
                    <span className="font-serif font-bold text-wild-sunset text-2xl">
                      {translatedSafari.showPricing === false 
                        ? t('price_on_request')
                        : calculateEstimatedTotal(translatedSafari.price, guests, language)
                      }
                    </span>
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full px-6 py-4 bg-wild-sunset text-white font-bold tracking-wider rounded-xl hover:bg-[#FF8C42] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                  {submitting ? (language === 'en' ? 'Submitting...' : 'Ana Aikawa...') : t('book_req_btn')}
                </button>
                <p className="text-center text-xs text-wild-muted mt-2">{t('book_no_payment')}</p>
              </form>
            )}
          </div>
          
          <div className="mt-8 bg-wild-sand rounded-2xl p-6 border border-wild-brown/20 text-center">
            <h4 className="font-bold text-wild-forest mb-2">{t('book_custom_title')}</h4>
            <p className="text-sm text-wild-muted mb-4">{t('book_custom_p')}</p>
            <a href="mailto:info@wildlifehausa.com" className="text-wild-sunset font-bold text-sm hover:underline block">{t('book_contact_guides')}</a>
          </div>
        </div>
      </section>
    </div>
  );
}
