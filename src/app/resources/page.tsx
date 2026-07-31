'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { WildSectionHeader } from '@/components/ui/WildSectionHeader';
import { FileText, Download, Image as ImageIcon, Calendar, X, ChevronLeft, ChevronRight, Search, Lock, CheckCircle, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';
import { getResources } from '@/lib/firebase/services';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { translateResource } from '@/lib/translations';

export default function ResourcesPage() {
  const { language, t, settings } = useLanguage();
  const [resources, setResources] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Purchased Resource IDs (Persisted in localStorage)
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);

  // Lightbox State
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Payment / Purchase Modal State
  const [purchaseTarget, setPurchaseTarget] = useState<any | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paystack' | 'transfer'>('paystack');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    async function loadResources() {
      try {
        const fetched = await getResources();
        setResources(fetched);
      } catch (err) {
        console.error('Error fetching resources:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResources();

    // Load purchased items from localStorage
    try {
      const savedPurchases = localStorage.getItem('wildlife_purchased_resources');
      if (savedPurchases) {
        setPurchasedIds(JSON.parse(savedPurchases));
      }
    } catch (e) {
      console.error('Error reading purchased resources from localStorage:', e);
    }
  }, []);

  const openLightbox = (imagesList: string[], startIndex: number) => {
    setLightboxImages(imagesList);
    setLightboxIndex(startIndex);
  };

  const closeLightbox = () => {
    setLightboxImages([]);
    setLightboxIndex(null);
  };

  const nextLightboxImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && lightboxImages.length > 0) {
      setLightboxIndex((lightboxIndex + 1) % lightboxImages.length);
    }
  };

  const prevLightboxImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && lightboxImages.length > 0) {
      setLightboxIndex((lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length);
    }
  };

  // Open Purchase Modal
  const handleOpenPurchase = (res: any) => {
    setPurchaseTarget(res);
    setBuyerName('');
    setBuyerEmail('');
    setIsProcessing(false);
    setPaymentSuccess(false);
  };

  // Close Purchase Modal
  const handleClosePurchase = () => {
    setPurchaseTarget(null);
    setPaymentSuccess(false);
  };

  // Simulate Payment Process
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerEmail) {
      alert(language === 'en' ? 'Please fill in your Name and Email.' : 'Da fatan za a cika sunanka da imel.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);

      if (purchaseTarget && purchaseTarget.id) {
        setPurchasedIds(prev => {
          const updated = Array.from(new Set([...prev, purchaseTarget.id]));
          try {
            localStorage.setItem('wildlife_purchased_resources', JSON.stringify(updated));
          } catch (err) {
            console.error('Failed to save purchase to localStorage', err);
          }
          return updated;
        });
      }
    }, 1500);
  };

  // Get all unique years from resources for the filter dropdown
  const uniqueYears = Array.from(
    new Set(
      resources
        .map(res => (res.tripDate ? res.tripDate.substring(0, 4) : null))
        .filter(Boolean)
    )
  ).sort((a: any, b: any) => b - a);

  // Filter resources dynamically
  const displayResources = resources.filter(res => {
    // 1. Category Filter
    if (activeFilter !== 'All') {
      const matchCat = activeFilter === 'Reports' ? 'reports' : (activeFilter === 'Photos' ? 'photos' : 'downloads');
      if (res.category?.toLowerCase() !== matchCat) return false;
    }
    
    // 2. Year Filter
    if (selectedYear !== 'All') {
      const itemYear = res.tripDate?.substring(0, 4);
      if (itemYear !== selectedYear) return false;
    }
    
    // 3. Search Filter
    if (searchQuery.trim() !== '') {
      const queryLower = searchQuery.toLowerCase();
      const titleMatch = res.title?.toLowerCase().includes(queryLower) || res.title_ha?.toLowerCase().includes(queryLower);
      const descMatch = res.description?.toLowerCase().includes(queryLower) || res.description_ha?.toLowerCase().includes(queryLower);
      const catMatch = res.category?.toLowerCase().includes(queryLower) || res.category_ha?.toLowerCase().includes(queryLower);
      if (!titleMatch && !descMatch && !catMatch) return false;
    }
    
    return true;
  });

  // Translate filtered resources
  const translatedFiltered = displayResources.map(r => translateResource(r, language));

  // Group translated resources by year
  const resourcesByYear: Record<string, any[]> = {};
  translatedFiltered.forEach(res => {
    const year = res.tripDate ? res.tripDate.substring(0, 4) : 'Other';
    if (!resourcesByYear[year]) {
      resourcesByYear[year] = [];
    }
    resourcesByYear[year].push(res);
  });

  // Sort years in descending order
  const sortedYears = Object.keys(resourcesByYear).sort((a, b) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return b.localeCompare(a);
  });

  const filters = [
    { key: 'All', label: language === 'en' ? 'All Resources' : 'Duk Albarkatu' },
    { key: 'Reports', label: t('filter_reports', 'Reports') },
    { key: 'Photos', label: t('filter_photos', 'Gallery') },
    { key: 'Downloads', label: t('filter_downloads', 'Downloads') }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-wild-cream">
      {/* Hero Header */}
      <section className="relative pt-32 pb-20 bg-wild-deep-forest text-wild-cream overflow-hidden">
        <div className="absolute inset-0 opacity-25" style={{
          backgroundImage: `url("${settings?.hero_images?.about || "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=2000"}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div className="relative z-10 container mx-auto px-6 max-w-4xl text-center">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6">
            {t('resources_hero_title', 'Field Trip Resources')}
          </h1>
          <p className="text-xl text-wild-sand/90 font-sans leading-relaxed max-w-2xl mx-auto">
            {t('resources_hero_subtitle', 'Access field trip reports, maps, research papers, and photographs from our expeditions.')}
          </p>
        </div>
      </section>

      {/* Filter and Resources List */}
      <section className="py-20 container mx-auto px-6 lg:px-12 max-w-6xl">
        
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-wild-forest/15 pb-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-3 items-center">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer shadow-sm ${
                  activeFilter === f.key
                    ? 'bg-wild-sunset text-white border-transparent'
                    : 'bg-white border border-wild-forest/10 text-wild-forest hover:bg-wild-forest/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search and Year Select */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wild-forest/40 w-4 h-4" />
              <input
                type="text"
                placeholder={language === 'en' ? "Search resources..." : "Nemi albarkatu..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-wild-forest/10 rounded-full text-sm text-wild-forest focus:outline-none focus:border-wild-sunset focus:ring-1 focus:ring-wild-sunset shadow-sm"
              />
            </div>
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white border border-wild-forest/10 text-wild-forest text-sm font-semibold rounded-full px-5 py-2.5 outline-none focus:border-wild-sunset focus:ring-1 focus:ring-wild-sunset shadow-sm cursor-pointer"
            >
              <option value="All">{language === 'en' ? "All Years" : "Duk Shekaru"}</option>
              {uniqueYears.map((yr: any) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-wild-sunset border-t-transparent rounded-full animate-spin" />
            <p className="text-wild-forest font-serif font-bold text-lg">{t('loading_resources', 'Loading field trip resources...')}</p>
          </div>
        ) : sortedYears.length === 0 ? (
          <div className="text-center py-24 text-wild-forest/50 bg-white rounded-3xl p-12 shadow-sm border border-wild-cream">
            <p className="text-lg font-serif italic">{t('no_resources_found', 'No field trip resources available yet.')}</p>
          </div>
        ) : (
          <div className="divide-y divide-wild-forest/10 border-t border-b border-wild-forest/10">
            {sortedYears.map((year) => (
              <React.Fragment key={year}>
                {resourcesByYear[year].map((res: any, idx: number) => {
                  const hasImages = res.images && res.images.length > 0;
                  const firstImage = hasImages ? res.images[0] : null;
                  const isPaid = res.accessType === 'paid';
                  const isUnlocked = !isPaid || purchasedIds.includes(res.id);
                  const priceFormatted = Number(res.price || 0).toLocaleString();

                  return (
                    <div 
                      key={res.id || idx}
                      className="flex flex-col md:flex-row gap-6 py-8 items-start"
                    >
                      {/* Left: Thumbnail Image */}
                      {firstImage && (
                        <div className="relative w-full md:w-56 h-36 rounded-2xl overflow-hidden shrink-0 border border-wild-cream shadow-sm bg-wild-sand/40">
                          <Image
                            src={firstImage}
                            alt={res.title}
                            fill
                            className="object-cover transition-transform duration-500 hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 224px"
                          />
                        </div>
                      )}

                      {/* Right: Content details and actions */}
                      <div className="flex-grow space-y-3">
                        <div className="flex flex-wrap items-center gap-2 text-wild-muted text-xs font-bold uppercase tracking-wider">
                          <span className="text-wild-sunset">{res.category}</span>
                          <span>•</span>
                          <span>{year}</span>
                          <span>•</span>
                          {/* Access Badge */}
                          {isPaid ? (
                            isUnlocked ? (
                              <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full font-bold border border-green-200 flex items-center gap-1">
                                <CheckCircle size={12} /> {language === 'en' ? 'Purchased & Unlocked' : 'An Saya & An Bude'}
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold border border-amber-200 flex items-center gap-1">
                                <Lock size={12} /> {language === 'en' ? `Paid • ₦${priceFormatted}` : `Wadanda Aka Biya • ₦${priceFormatted}`}
                              </span>
                            )
                          ) : (
                            <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full font-bold border border-green-200">
                              🟢 {language === 'en' ? 'Free Download' : 'Kyauta Za A Iya Saukewa'}
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif text-xl md:text-2xl text-wild-forest font-bold leading-snug">
                          {res.title}
                        </h3>
                        {res.description && (
                          <p className="text-sm text-wild-muted leading-relaxed font-sans font-medium">
                            {res.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          {res.fileUrl && (
                            isUnlocked ? (
                              <a 
                                href={res.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-wild-sunset text-white hover:bg-[#FF8C42] hover:shadow px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 group cursor-pointer"
                              >
                                <FileText size={14} className="text-wild-sand group-hover:scale-110 transition-transform" />
                                <span>{res.category?.toLowerCase() === 'downloads' ? t('download_file', 'Download File') : t('download_report', 'Download Report')}</span>
                                <Download size={12} className="opacity-75" />
                              </a>
                            ) : (
                              <button
                                onClick={() => handleOpenPurchase(res)}
                                className="inline-flex items-center gap-2 bg-wild-deep-forest hover:bg-wild-sunset text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 group cursor-pointer shadow-sm"
                              >
                                <Lock size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
                                <span>{language === 'en' ? `Purchase to Download (₦${priceFormatted})` : `Biya Domin Saukewa (₦${priceFormatted})`}</span>
                              </button>
                            )
                          )}

                          {hasImages && (
                            <button 
                              onClick={() => openLightbox(res.images, 0)}
                              className="inline-flex items-center gap-2 bg-wild-forest hover:bg-wild-sunset text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 group cursor-pointer"
                            >
                              <ImageIcon size={14} className="text-wild-sand group-hover:scale-110 transition-transform" />
                              <span>{t('view_photos', 'View Gallery')} ({res.images.length})</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        )}
      </section>

      {/* Resource Purchase & Payment Modal */}
      {purchaseTarget && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-wild-sand">
            {/* Header */}
            <div className="bg-wild-deep-forest text-wild-cream px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-wild-sunset" />
                <h3 className="font-serif font-bold text-lg">
                  {paymentSuccess ? (language === 'en' ? 'Payment Successful!' : 'An Kammala Biya!') : (language === 'en' ? 'Purchase Resource Access' : 'Biyan Kudin Samun Albarkatu')}
                </h3>
              </div>
              <button 
                onClick={handleClosePurchase}
                className="text-wild-cream/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            {paymentSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle size={36} />
                </div>
                <h4 className="font-serif text-xl font-bold text-wild-forest">
                  {language === 'en' ? 'Access Granted!' : 'An Ba Ka Samun Dama!'}
                </h4>
                <p className="text-sm text-wild-muted leading-relaxed">
                  {language === 'en' 
                    ? `Thank you, ${buyerName}. Your payment of ₦${Number(purchaseTarget.price || 0).toLocaleString()} for "${purchaseTarget.title}" was verified.`
                    : `Mungode, ${buyerName}. An tabbatar da biyan kudinka na ₦${Number(purchaseTarget.price || 0).toLocaleString()} don "${purchaseTarget.title}".`}
                </p>

                {purchaseTarget.fileUrl && (
                  <a
                    href={purchaseTarget.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full bg-wild-sunset hover:bg-[#FF8C42] text-white py-3 px-6 rounded-xl font-bold text-sm shadow-md transition-all mt-2"
                  >
                    <Download size={16} />
                    <span>{language === 'en' ? 'Download Resource File Now' : 'Sauke Fayil Din Yanzu'}</span>
                  </a>
                )}

                <button
                  onClick={handleClosePurchase}
                  className="block w-full text-center text-xs text-wild-muted hover:underline pt-2 font-medium"
                >
                  {language === 'en' ? 'Close Window' : 'Rufe'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleProcessPayment} className="p-6 space-y-4">
                {/* Product Summary Card */}
                <div className="p-4 bg-wild-sand/30 rounded-xl border border-wild-sand/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-wild-sunset tracking-wider">
                    {purchaseTarget.category} • {purchaseTarget.tripDate ? purchaseTarget.tripDate.substring(0, 4) : ''}
                  </span>
                  <h4 className="font-serif font-bold text-wild-forest text-base leading-snug">
                    {purchaseTarget.title}
                  </h4>
                  <div className="pt-2 flex justify-between items-center border-t border-wild-sand/80 mt-2">
                    <span className="text-xs text-wild-muted font-medium">{language === 'en' ? 'Total Price:' : 'Jimillar Kudi:'}</span>
                    <span className="text-lg font-mono font-bold text-wild-forest">₦{Number(purchaseTarget.price || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Buyer Information */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-xs font-bold text-wild-forest uppercase block mb-1">
                      {language === 'en' ? 'Full Name *' : 'Cikakken Suna *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="e.g. Amina Umar"
                      className="w-full px-3 py-2 bg-white border border-wild-sand rounded-lg text-sm focus:outline-none focus:border-wild-sunset text-wild-forest"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-wild-forest uppercase block mb-1">
                      {language === 'en' ? 'Email Address *' : 'Adireshin Imel *'}
                    </label>
                    <input
                      type="email"
                      required
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      placeholder="e.g. amina@example.com"
                      className="w-full px-3 py-2 bg-white border border-wild-sand rounded-lg text-sm focus:outline-none focus:border-wild-sunset text-wild-forest"
                    />
                  </div>
                </div>

                {/* Payment Option Selection */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-wild-forest uppercase block">
                    {language === 'en' ? 'Select Payment Method' : 'Zabi Hanyar Biya'}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paystack')}
                      className={`p-2.5 rounded-lg border flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                        paymentMethod === 'paystack'
                          ? 'border-wild-sunset bg-wild-sunset/10 text-wild-sunset'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <CreditCard size={14} />
                      <span>Paystack / Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('transfer')}
                      className={`p-2.5 rounded-lg border flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                        paymentMethod === 'transfer'
                          ? 'border-wild-sunset bg-wild-sunset/10 text-wild-sunset'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <ShieldCheck size={14} />
                      <span>Bank Transfer</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={handleClosePurchase}
                    className="flex-1 py-2.5 border border-wild-sand text-wild-forest rounded-xl font-semibold text-xs hover:bg-wild-sand/30 transition-colors"
                  >
                    {language === 'en' ? 'Cancel' : 'Soke'}
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-2 py-2.5 bg-wild-sunset hover:bg-[#FF8C42] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-75"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>{language === 'en' ? 'Processing...' : 'Ana Aiki...'}</span>
                      </>
                    ) : (
                      <>
                        <Lock size={14} />
                        <span>{language === 'en' ? `Pay ₦${Number(purchaseTarget.price || 0).toLocaleString()}` : `Biya ₦${Number(purchaseTarget.price || 0).toLocaleString()}`}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Full-Screen Gallery Lightbox Overlay */}
      {lightboxIndex !== null && lightboxImages.length > 0 && (
        <div 
          onClick={closeLightbox}
          className="fixed inset-0 z-[200000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        >
          {/* Close button */}
          <button 
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow"
          >
            <X size={24} />
          </button>

          {/* Left Arrow */}
          {lightboxImages.length > 1 && (
            <button 
              onClick={prevLightboxImage}
              className="absolute left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow z-10"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* High-res Image Display */}
          <div className="relative w-full max-w-5xl aspect-video max-h-[80vh] md:max-h-[85vh]">
            <Image 
              src={lightboxImages[lightboxIndex]} 
              alt="High-resolution gallery screenshot" 
              fill 
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Right Arrow */}
          {lightboxImages.length > 1 && (
            <button 
              onClick={nextLightboxImage}
              className="absolute right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow z-10"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Image index numbering label */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-xs font-semibold select-none font-mono">
            {lightboxIndex + 1} / {lightboxImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
