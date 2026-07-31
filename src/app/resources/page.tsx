'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { WildSectionHeader } from '@/components/ui/WildSectionHeader';
import { 
  FileText, Download, Image as ImageIcon, Calendar, X, ChevronLeft, ChevronRight, Search, 
  Lock, CheckCircle, CreditCard, ShieldCheck, Loader2, Copy, UploadCloud, Building2, Clock, AlertCircle 
} from 'lucide-react';
import { getResources, createPaymentRecord, getPayments } from '@/lib/firebase/services';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { translateResource } from '@/lib/translations';

export default function ResourcesPage() {
  const { language, t, settings } = useLanguage();
  const [resources, setResources] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // User Payment Status Map: resourceId -> { status: 'pending'|'approved'|'rejected', receiptUrl }
  const [userPaymentsMap, setUserPaymentsMap] = useState<Record<string, { status: string; receiptUrl?: string }>>({});
  const [userEmail, setUserEmail] = useState<string>('');

  // Lightbox State
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Payment Modal & Transfer Upload State
  const [purchaseTarget, setPurchaseTarget] = useState<any | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmailInput, setBuyerEmailInput] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState<'NGN' | 'USD'>('NGN');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentSubmittedSuccess, setPaymentSubmittedSuccess] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const fetched = await getResources();
        setResources(fetched);
      } catch (err) {
        console.error('Error fetching resources:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Check stored user email & load payments status
    try {
      const savedEmail = localStorage.getItem('wildlife_user_email');
      if (savedEmail) {
        setUserEmail(savedEmail);
        fetchUserPayments(savedEmail);
      }
    } catch (e) {
      console.error('Error loading local storage:', e);
    }
  }, []);

  async function fetchUserPayments(email: string) {
    if (!email) return;
    try {
      const allPayments = await getPayments();
      const userPayments = allPayments.filter((p: any) => p.payerEmail?.toLowerCase() === email.toLowerCase());
      
      const map: Record<string, { status: string; receiptUrl?: string }> = {};
      userPayments.forEach((p: any) => {
        // If approved exists for resource, prioritize approved over pending
        if (!map[p.resourceId] || p.status === 'approved') {
          map[p.resourceId] = { status: p.status, receiptUrl: p.receiptUrl };
        }
      });
      setUserPaymentsMap(map);
    } catch (err) {
      console.error('Failed to load user payments:', err);
    }
  }

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

  // Copy Account Number
  const handleCopyAccount = (accNumber: string) => {
    navigator.clipboard.writeText(accNumber);
    setCopiedAccount(accNumber);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  // Open Purchase Modal
  const handleOpenPurchase = (res: any) => {
    setPurchaseTarget(res);
    setBuyerName('');
    setBuyerEmailInput(userEmail || '');
    setSelectedAccountType('NGN');
    setReceiptFile(null);
    setUploadingReceipt(false);
    setUploadProgress(0);
    setIsSubmittingPayment(false);
    setPaymentSubmittedSuccess(false);
  };

  // Close Purchase Modal
  const handleClosePurchase = () => {
    setPurchaseTarget(null);
    setPaymentSubmittedSuccess(false);
  };

  // Handle Bank Transfer Receipt Submission
  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerEmailInput) {
      alert(language === 'en' ? 'Please enter your Full Name and Email Address.' : 'Da fatan za a shigar da Cikakken Suna da Adireshin Imel.');
      return;
    }

    if (!receiptFile) {
      alert(language === 'en' ? 'Please upload your bank transfer payment receipt file.' : 'Da fatan za a dorawa shaidar biyan kuɗin banki.');
      return;
    }

    setIsSubmittingPayment(true);

    try {
      // 1. Save user email in localStorage for persistent payment status check
      localStorage.setItem('wildlife_user_email', buyerEmailInput.trim().toLowerCase());
      setUserEmail(buyerEmailInput.trim().toLowerCase());

      // 2. Upload receipt image/PDF to Firebase Storage
      const filename = `receipts/${Date.now()}_${receiptFile.name}`;
      const storageRef = ref(storage, filename);
      const uploadTask = uploadBytesResumable(storageRef, receiptFile);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (err) => {
            console.error('Receipt upload error:', err);
            reject(err);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // 3. Create Payment record in Firestore
            const amount = selectedAccountType === 'USD' 
              ? Math.max(5, Math.round((purchaseTarget.price || 5000) / 1000))
              : (purchaseTarget.price || 5000);

            await createPaymentRecord({
              resourceId: purchaseTarget.id,
              resourceTitle: purchaseTarget.title,
              payerName: buyerName.trim(),
              payerEmail: buyerEmailInput.trim().toLowerCase(),
              currency: selectedAccountType,
              amount: amount,
              receiptUrl: downloadURL,
              paymentMethod: `Bank Transfer (${selectedAccountType})`,
              status: 'pending',
              createdAt: new Date().toISOString()
            });

            resolve();
          }
        );
      });

      setIsSubmittingPayment(false);
      setPaymentSubmittedSuccess(true);
      fetchUserPayments(buyerEmailInput.trim().toLowerCase());
    } catch (err) {
      console.error('Error submitting payment receipt:', err);
      setIsSubmittingPayment(false);
      alert(language === 'en' ? 'Failed to submit payment receipt. Please try again.' : 'An sami matsala gurin tura shaidar biya.');
    }
  };

  // Filter unique years
  const uniqueYears = Array.from(
    new Set(
      resources
        .map(res => (res.tripDate ? res.tripDate.substring(0, 4) : null))
        .filter(Boolean)
    )
  ).sort((a: any, b: any) => b - a);

  // Filter resources dynamically
  const displayResources = resources.filter(res => {
    if (activeFilter !== 'All') {
      const matchCat = activeFilter === 'Reports' ? 'reports' : (activeFilter === 'Photos' ? 'photos' : 'downloads');
      if (res.category?.toLowerCase() !== matchCat) return false;
    }
    if (selectedYear !== 'All') {
      const itemYear = res.tripDate?.substring(0, 4);
      if (itemYear !== selectedYear) return false;
    }
    if (searchQuery.trim() !== '') {
      const queryLower = searchQuery.toLowerCase();
      const titleMatch = res.title?.toLowerCase().includes(queryLower) || res.title_ha?.toLowerCase().includes(queryLower);
      const descMatch = res.description?.toLowerCase().includes(queryLower) || res.description_ha?.toLowerCase().includes(queryLower);
      const catMatch = res.category?.toLowerCase().includes(queryLower) || res.category_ha?.toLowerCase().includes(queryLower);
      if (!titleMatch && !descMatch && !catMatch) return false;
    }
    return true;
  });

  const translatedFiltered = displayResources.map(r => translateResource(r, language));

  const resourcesByYear: Record<string, any[]> = {};
  translatedFiltered.forEach(res => {
    const year = res.tripDate ? res.tripDate.substring(0, 4) : 'Other';
    if (!resourcesByYear[year]) {
      resourcesByYear[year] = [];
    }
    resourcesByYear[year].push(res);
  });

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

                  // Determine payment status for this user
                  const paymentInfo = userPaymentsMap[res.id];
                  const isApproved = !isPaid || (paymentInfo && paymentInfo.status === 'approved');
                  const isPending = isPaid && paymentInfo && paymentInfo.status === 'pending';
                  const isRejected = isPaid && paymentInfo && paymentInfo.status === 'rejected';

                  const priceNGN = Number(res.price || 5000).toLocaleString();

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
                            isApproved ? (
                              <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full font-bold border border-green-200 flex items-center gap-1">
                                <CheckCircle size={12} /> {language === 'en' ? 'Payment Approved & Unlocked' : 'An Tabbatar da Biyan Kudi'}
                              </span>
                            ) : isPending ? (
                              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold border border-amber-200 flex items-center gap-1 animate-pulse">
                                <Clock size={12} /> {language === 'en' ? 'Receipt Under Admin Review' : 'Ana Binciken Biyan Kudi'}
                              </span>
                            ) : isRejected ? (
                              <span className="px-2.5 py-0.5 bg-red-100 text-red-800 rounded-full font-bold border border-red-200 flex items-center gap-1">
                                <AlertCircle size={12} /> {language === 'en' ? 'Payment Rejected (Re-submit)' : 'Aka Kina Biyan Kudi'}
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold border border-amber-200 flex items-center gap-1">
                                <Lock size={12} /> {language === 'en' ? `Paid Resource • ₦${priceNGN}` : `Sayarwa • ₦${priceNGN}`}
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
                            isApproved ? (
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
                            ) : isPending ? (
                              <div className="inline-flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-sm">
                                <Clock size={14} className="animate-spin" />
                                <span>{language === 'en' ? 'Receipt Under Review (Pending Approval)' : 'Ana Bincikar Shaida (Neman Amincewa)'}</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleOpenPurchase(res)}
                                className="inline-flex items-center gap-2 bg-wild-deep-forest hover:bg-wild-sunset text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 group cursor-pointer shadow-sm"
                              >
                                <Building2 size={14} className="text-wild-sunset group-hover:scale-110 transition-transform" />
                                <span>{language === 'en' ? `Bank Transfer to Purchase (₦${priceNGN})` : `Hanyar Biya ta Banki (₦${priceNGN})`}</span>
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

      {/* Bank Transfer & Receipt Upload Modal */}
      {purchaseTarget && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-wild-sand flex flex-col">
            {/* Header */}
            <div className="bg-wild-deep-forest text-wild-cream px-6 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-wild-forest/30">
              <div className="flex items-center gap-2">
                <Building2 size={20} className="text-wild-sunset" />
                <h3 className="font-serif font-bold text-lg">
                  {paymentSubmittedSuccess 
                    ? (language === 'en' ? 'Receipt Submitted Successfully' : 'An Tura Shaidar Biya') 
                    : (language === 'en' ? 'Bank Transfer Payment & Receipt' : 'Biyan Kudin Banki da Tura Shaida')}
                </h3>
              </div>
              <button 
                onClick={handleClosePurchase}
                className="text-wild-cream/70 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            {paymentSubmittedSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Clock size={36} className="animate-spin" />
                </div>
                <h4 className="font-serif text-xl font-bold text-wild-forest">
                  {language === 'en' ? 'Payment Receipt Pending Approval' : 'Ana Binciken Shaidar Biya'}
                </h4>
                <p className="text-sm text-wild-muted leading-relaxed max-w-md mx-auto">
                  {language === 'en' 
                    ? `Thank you, ${buyerName}! Your bank transfer receipt for "${purchaseTarget.title}" has been submitted to Zenith Bank verification team. Once our admin approves your payment, your resource download link will automatically unlock and be sent to ${buyerEmailInput}.`
                    : `Mungode, ${buyerName}! An tura shaidar biyan kuɗinka don "${purchaseTarget.title}". Za a duba kuma za a ba ka samun damar saukewa da zaran admin ya amince da biyan kuɗin.`}
                </p>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-800 font-medium space-y-1">
                  <p className="font-bold">📋 Status Check Tip:</p>
                  <p>You can check status anytime on this Resources page. Upon admin approval, the button will automatically change to &quot;Download Report&quot;.</p>
                </div>

                <button
                  onClick={handleClosePurchase}
                  className="w-full bg-wild-sunset hover:bg-[#FF8C42] text-white font-bold py-3 rounded-xl text-sm transition-all cursor-pointer shadow-md mt-2"
                >
                  {language === 'en' ? 'Got it / Close' : 'Na Fahimta / Rufe'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReceipt} className="p-6 space-y-5">
                {/* Resource Title & Price Banner */}
                <div className="p-4 bg-wild-sand/30 rounded-xl border border-wild-sand/70 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-wild-sunset tracking-wider">
                    {purchaseTarget.category} • {purchaseTarget.tripDate ? purchaseTarget.tripDate.substring(0, 4) : ''}
                  </span>
                  <h4 className="font-serif font-bold text-wild-forest text-base leading-snug">
                    {purchaseTarget.title}
                  </h4>
                  <div className="pt-2 flex justify-between items-center border-t border-wild-sand/80 mt-2">
                    <span className="text-xs text-wild-muted font-medium">{language === 'en' ? 'Required Payment:' : 'Abinda Ake Bukata Biyan Kudi:'}</span>
                    <span className="text-lg font-mono font-bold text-wild-forest">
                      ₦{Number(purchaseTarget.price || 5000).toLocaleString()} NGN
                    </span>
                  </div>
                </div>

                {/* Bank Account Selection & Instructions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-wild-forest uppercase block">
                      {language === 'en' ? 'Select Bank Account to Transfer' : 'Zabi Asusun Banki da Zaka Tura'}
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedAccountType('NGN')}
                        className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                          selectedAccountType === 'NGN'
                            ? 'bg-wild-sunset text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Naira (NGN ₦)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedAccountType('USD')}
                        className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                          selectedAccountType === 'USD'
                            ? 'bg-wild-sunset text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Dollar (USD $)
                      </button>
                    </div>
                  </div>

                  {/* Bank Account Details Display Card */}
                  {selectedAccountType === 'NGN' ? (
                    <div className="p-4 bg-wild-deep-forest text-white rounded-xl border border-wild-forest/50 space-y-2 relative shadow-inner">
                      <div className="flex items-center justify-between text-xs text-wild-sand/80 border-b border-white/10 pb-2">
                        <span className="font-bold tracking-wider uppercase">Zenith Bank (Naira NGN)</span>
                        <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold">Local Transfer</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-wild-sand/70">Account Name: <strong className="text-white">Wild Hausa Limited</strong></p>
                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <span className="text-[10px] uppercase text-wild-sand/60 block">Account Number:</span>
                            <span className="text-xl font-mono font-bold text-wild-sunset tracking-wider">1310240719</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyAccount('1310240719')}
                            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border border-white/10"
                          >
                            <Copy size={12} />
                            <span>{copiedAccount === '1310240719' ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-wild-deep-forest text-white rounded-xl border border-wild-forest/50 space-y-2 relative shadow-inner">
                      <div className="flex items-center justify-between text-xs text-wild-sand/80 border-b border-white/10 pb-2">
                        <span className="font-bold tracking-wider uppercase">Zenith Bank (Dollar USD)</span>
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold">Domiciliary</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-wild-sand/70">Account Name: <strong className="text-white">Wild Hausa Limited</strong></p>
                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <span className="text-[10px] uppercase text-wild-sand/60 block">Account Number:</span>
                            <span className="text-xl font-mono font-bold text-wild-sunset tracking-wider">5076146735</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyAccount('5076146735')}
                            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border border-white/10"
                          >
                            <Copy size={12} />
                            <span>{copiedAccount === '5076146735' ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payer Details */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-xs font-bold text-wild-forest uppercase block mb-1">
                      {language === 'en' ? 'Your Full Name *' : 'Cikakken Sunanka *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="e.g. Abubakar Isah"
                      className="w-full px-3.5 py-2.5 bg-white border border-wild-sand rounded-xl text-sm focus:outline-none focus:border-wild-sunset text-wild-forest"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-wild-forest uppercase block mb-1">
                      {language === 'en' ? 'Your Email Address (For Delivery) *' : 'Adireshin Imel (Na Samun Fayil) *'}
                    </label>
                    <input
                      type="email"
                      required
                      value={buyerEmailInput}
                      onChange={(e) => setBuyerEmailInput(e.target.value)}
                      placeholder="e.g. user@example.com"
                      className="w-full px-3.5 py-2.5 bg-white border border-wild-sand rounded-xl text-sm focus:outline-none focus:border-wild-sunset text-wild-forest"
                    />
                  </div>
                </div>

                {/* Receipt Upload Input */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-wild-forest uppercase block">
                    {language === 'en' ? 'Upload Bank Transfer Receipt (Image / PDF) *' : 'Dora Shaidar Biya ta Banki (Hoto / PDF) *'}
                  </label>
                  <label className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-wild-sand hover:border-wild-sunset rounded-xl bg-wild-sand/10 hover:bg-wild-sand/20 cursor-pointer transition-colors text-xs font-semibold text-wild-forest">
                    <UploadCloud size={20} className="text-wild-sunset" />
                    <span>
                      {receiptFile ? `Receipt Attached: ${receiptFile.name}` : (language === 'en' ? 'Click to select transfer receipt image/PDF' : 'Latsa don zabar shaidar biya')}
                    </span>
                    <input
                      type="file"
                      required
                      accept="image/*,.pdf"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={handleClosePurchase}
                    className="flex-1 py-3 border border-wild-sand text-wild-forest rounded-xl font-semibold text-xs hover:bg-wild-sand/30 transition-colors cursor-pointer"
                  >
                    {language === 'en' ? 'Cancel' : 'Soke'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPayment}
                    className="flex-2 py-3 bg-wild-sunset hover:bg-[#FF8C42] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {isSubmittingPayment ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>{language === 'en' ? `Uploading (${uploadProgress}%)...` : `Ana turawa (${uploadProgress}%)...`}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span>{language === 'en' ? 'Submit Receipt for Verification' : 'Tura Shaidar Biya don Amintawa'}</span>
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
          <button 
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow"
          >
            <X size={24} />
          </button>

          {lightboxImages.length > 1 && (
            <button 
              onClick={prevLightboxImage}
              className="absolute left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow z-10"
            >
              <ChevronLeft size={24} />
            </button>
          )}

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

          {lightboxImages.length > 1 && (
            <button 
              onClick={nextLightboxImage}
              className="absolute right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow z-10"
            >
              <ChevronRight size={24} />
            </button>
          )}

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-xs font-semibold select-none font-mono">
            {lightboxIndex + 1} / {lightboxImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
