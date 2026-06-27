'use client';

import React, { useState, useEffect } from 'react';
import { getServicesContent, updateServicesContent } from '@/lib/firebase/services';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Loader2, Save, Plus, Trash2, Image as ImageIcon, UploadCloud } from 'lucide-react';

export interface ServiceItem {
  title: string;
  title_ha?: string;
  subtitle: string;
  subtitle_ha?: string;
  description: string;
  description_ha?: string;
  items: string[];
  items_ha?: string[];
  image: string;
  cta: string;
  cta_ha?: string;
  link: string;
}

export interface ServicesContent {
  heroTitle: string;
  heroTitle_ha?: string;
  heroSubtitle: string;
  heroSubtitle_ha?: string;
  services: ServiceItem[];
}

const DEFAULT_CONTENT: ServicesContent = {
  heroTitle: "Services",
  heroTitle_ha: "Ayyukanmu",
  heroSubtitle: "What We Do",
  heroSubtitle_ha: "Abubuwan da Wild Hausa Ke Yi",
  services: [
    {
      title: "Digital Media & Nature Filmmaking",
      title_ha: "Kafofin Yada Labaru da Fina-finai",
      subtitle: "VISUAL STORYTELLING",
      subtitle_ha: "GUDANAR DA LABARI NA HOTO",
      description: "We create visually stunning multimedia assets that tell the story of our natural world.",
      description_ha: "Muna samar da kyawawan fina-finan daji da bidiyoyi na musamman da ke nuna kyawun halittar Arewacin Najeriya.",
      items: [
        "Nature & Wildlife Documentaries: Full-scale production of documentaries focusing on ecosystems, wildlife, and environmental conservation.",
        "Digital Content Creation: Videos, animations, and graphics tailored for various platforms.",
        "Conservation Videography: Highlighting sustainability efforts and raising awareness for biodiversity through compelling visual media."
      ],
      items_ha: [
        "Fina-finan Daji da Halitta: Shirya cikakkun fina-finai game da dabbobi da kiyaye muhalli.",
        "Samar da Kafofin Dijital: Bidiyoyi, hotuna, da zane-zane don shafuka daban-daban.",
        "Bidiyon Kiyaye Muhalli: Nuna ayyukan kiyaye dabbobi da wayar da kan al'umma."
      ],
      image: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1200",
      cta: "Explore Documentaries",
      cta_ha: "Kalli Fina-finanmu",
      link: "/documentaries"
    },
    {
      title: "Eco-Tourism & Safaris",
      title_ha: "Yawon Bude Ido na Daji & Safaris",
      subtitle: "IMMERSIVE EXPERIENCES",
      subtitle_ha: "YAWON BUDE IDO NA DAJI",
      description: "We provide responsible, guided travel experiences that immerse you in natural and cultural wonders.",
      description_ha: "Muna samar da tafiye-tafiye na yawon bude ido na daji masu aminci karkashin jagorancin kwararru.",
      items: [
        "Guided Safaris: Expert-led wildlife viewing expeditions.",
        "Eco-Tourism Packages: Sustainable travel tours designed to support local communities and environmental conservation.",
        "Cultural & Natural Expeditions: Curated trips to breathtaking, off-the-beaten-path destinations."
      ],
      items_ha: [
        "Jagorancin Safari: Tafiyar safari tare da kwararrun guides.",
        "Tsarin Yawon Bude Ido: Tafiye-tafiye masu dorewa don tallafa wa al'ummomin gari.",
        "Kasadar Al'ada da Halitta: Ziyarar wurare masu ban sha'awa da ke boye."
      ],
      image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1200",
      cta: "View Safari Packages",
      cta_ha: "Duba Shirye-shiryen Safari",
      link: "/safaris"
    },
    {
      title: "Adventure Parks & Recreation",
      title_ha: "Wuraren Kasada & Wasanni",
      subtitle: "THRILL & LEISURE",
      subtitle_ha: "KASADA DA SHAKATAWA",
      description: "We build and manage facilities designed for thrill-seekers and nature lovers alike.",
      description_ha: "Muna gina da sarrafa wuraren wasanni da aka tsara don masu son kasada da halitta.",
      items: [
        "Adventure Park Operations: Safe, innovative, and eco-friendly outdoor recreation centers.",
        "Outdoor Fitness & Leisure: Activities designed to promote physical well-being and a love for the outdoors."
      ],
      items_ha: [
        "Ayyukan Wurin Kasada: Wuraren wasannin kasada masu aminci a sararin samaniya.",
        "Motsa Jiki da Shakatawa: Ayyukan motsa jiki da ke inganta lafiya a cikin daji."
      ],
      image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=1200",
      cta: "Visit Adventure Park",
      cta_ha: "Ziyarci Wurin Kasada",
      link: "/adventure-park"
    },
    {
      title: "Zoological & Conservation Facilities",
      title_ha: "Kiyaye Muhalli & Gidajen Dabbobi",
      subtitle: "WILDLIFE PRESERVATION",
      subtitle_ha: "KIYAYE DABBOBIN DAJI",
      description: "We are committed to the protection and study of wildlife through hands-on facility management.",
      description_ha: "Muna sadaukar da kanmu don karewa da nazarin dabbobin daji ta hanyar lura da gidajen dabbobi.",
      items: [
        "Zoological Gardens: Establishing and operating animal parks that prioritize animal welfare and natural habitats.",
        "Educational Conservation: Using our physical parks as educational hubs to teach the public about wildlife preservation."
      ],
      items_ha: [
        "Gidajen Dabbobi: Gina da lura da wuraren dabbobi da ke ba da fifiko ga jin dadinsu.",
        "Ilimin Kiyaye Daji: Amfani da wurarenmu don koya wa jama'a kiyaye dabbobi."
      ],
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1200",
      cta: "Join the Conservation Circle",
      cta_ha: "Shiga Masu Kare Daji",
      link: "/conservation"
    }
  ]
};

export default function AdminServicesPage() {
  const [content, setContent] = useState<ServicesContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    setUploadingImageIndex(index);
    setUploadProgress(0);

    try {
      const storageRef = ref(storage, `services/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot: any) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error: any) => {
          console.error("Upload failed", error);
          alert('Failed to upload image. Please check Firebase CORS configuration.');
          setUploadingImageIndex(null);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          handleServiceChange(index, 'image', downloadURL);
          setUploadingImageIndex(null);
        }
      );
    } catch (err) {
      console.error(err);
      setUploadingImageIndex(null);
      alert('Failed to initialize upload.');
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getServicesContent();
        if (data && Object.keys(data).length > 0) {
          // Merge to ensure array structure exists
          setContent({ 
            ...DEFAULT_CONTENT, 
            ...data,
            services: data.services || DEFAULT_CONTENT.services
          });
        }
      } catch (error) {
        console.error('Failed to load services content:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleChange = (field: keyof ServicesContent, value: any) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceChange = (index: number, field: keyof ServiceItem, value: any) => {
    const newServices = [...content.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setContent(prev => ({ ...prev, services: newServices }));
  };

  const handleServiceItemsChange = (index: number, lang: 'en'|'ha', itemsText: string) => {
    const itemsArray = itemsText.split('\\n').filter(i => i.trim() !== '');
    handleServiceChange(index, lang === 'en' ? 'items' : 'items_ha', itemsArray);
  };

  const addService = () => {
    setContent(prev => ({
      ...prev,
      services: [...prev.services, { 
        title: 'New Service', 
        subtitle: 'SUBTITLE', 
        description: 'Description', 
        items: [], 
        image: '', 
        cta: 'Click Here', 
        link: '#' 
      }]
    }));
  };

  const removeService = (index: number) => {
    const newServices = [...content.services];
    newServices.splice(index, 1);
    setContent(prev => ({ ...prev, services: newServices }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await updateServicesContent(content as unknown as Record<string, unknown>);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save services content:', error);
      alert('Failed to save changes. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-wild-sunset animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-wild-deep-forest mb-2">Services Page Content</h1>
          <p className="text-gray-500">Manage the content and translations for the public Services / Worlds page.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-wild-sunset text-white px-6 py-3 rounded-lg font-medium hover:bg-[#FF8C42] transition-colors disabled:opacity-70"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
          Successfully saved changes to the Services page content.
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-wild-deep-forest">Page Header</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (e.g., 'Services' or 'What We Do')</label>
                <input type="text" value={content.heroTitle || ''} onChange={(e) => handleChange('heroTitle', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (e.g., 'Wild Hausa operates across...')</label>
                <textarea rows={3} value={content.heroSubtitle || ''} onChange={(e) => handleChange('heroSubtitle', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Hausa)</label>
                <input type="text" value={content.heroTitle_ha || ''} onChange={(e) => handleChange('heroTitle_ha', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (Hausa)</label>
                <textarea rows={3} value={content.heroSubtitle_ha || ''} onChange={(e) => handleChange('heroSubtitle_ha', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-wild-deep-forest">Service Domains</h2>
          <button onClick={addService} className="flex items-center gap-2 text-sm font-medium bg-white border border-gray-200 px-4 py-2 rounded-lg text-wild-sunset hover:border-wild-sunset transition-colors">
            <Plus size={16} /> Add Domain
          </button>
        </div>

        {content.services.map((service, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
            <button 
              onClick={() => removeService(index)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 z-10 bg-white p-1 rounded-md"
              title="Remove Service"
            >
              <Trash2 size={20} />
            </button>
            
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
              <h3 className="text-md font-bold text-wild-deep-forest">Domain {index + 1}: {service.title || 'Untitled'}</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* English Column */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 border-b pb-2">English Content</h4>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Domain Title (e.g., 'Digital Media & Nature Filmmaking')</label>
                    <input type="text" value={service.title || ''} onChange={(e) => handleServiceChange(index, 'title', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Domain Subtitle/Tagline (e.g., 'VISUAL STORYTELLING')</label>
                    <input type="text" value={service.subtitle || ''} onChange={(e) => handleServiceChange(index, 'subtitle', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Domain Description (e.g., 'We create visually stunning...')</label>
                    <textarea rows={3} value={service.description || ''} onChange={(e) => handleServiceChange(index, 'description', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Bullet Points (one per line, e.g., 'Nature & Wildlife Documentaries')</label>
                    <textarea 
                      rows={4} 
                      value={(service.items || []).join('\n')} 
                      onChange={(e) => handleServiceItemsChange(index, 'en', e.target.value)} 
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded" 
                      placeholder="Item 1\nItem 2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">CTA Button Text</label>
                    <input type="text" value={service.cta || ''} onChange={(e) => handleServiceChange(index, 'cta', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded" />
                  </div>
                </div>

                {/* Hausa Column */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 border-b pb-2">Hausa Content</h4>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                    <input type="text" value={service.title_ha || ''} onChange={(e) => handleServiceChange(index, 'title_ha', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Subtitle (Uppercase Tagline)</label>
                    <input type="text" value={service.subtitle_ha || ''} onChange={(e) => handleServiceChange(index, 'subtitle_ha', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                    <textarea rows={3} value={service.description_ha || ''} onChange={(e) => handleServiceChange(index, 'description_ha', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Bullet Points (one per line)</label>
                    <textarea 
                      rows={4} 
                      value={(service.items_ha || []).join('\n')} 
                      onChange={(e) => handleServiceItemsChange(index, 'ha', e.target.value)} 
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded" 
                      placeholder="Sashe 1\nSashe 2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">CTA Button Text</label>
                    <input type="text" value={service.cta_ha || ''} onChange={(e) => handleServiceChange(index, 'cta_ha', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded" />
                  </div>
                </div>
              </div>

              {/* Shared Fields */}
              <div className="pt-4 border-t border-gray-200 mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Image</label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <ImageIcon className="text-gray-400" size={20} />
                        <input 
                          type="text" 
                          placeholder="Image URL"
                          value={service.image || ''} 
                          onChange={(e) => handleServiceChange(index, 'image', e.target.value)} 
                          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm" 
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 bg-white border border-gray-300 hover:border-wild-sunset text-gray-700 px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm text-sm font-medium">
                          <UploadCloud size={16} className="text-wild-sunset" />
                          {uploadingImageIndex === index 
                            ? `Uploading... ${uploadProgress}%` 
                            : 'Upload Image'}
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleImageUpload(index, e)}
                            className="hidden"
                            disabled={uploadingImageIndex !== null}
                          />
                        </label>
                        {uploadingImageIndex === index && (
                          <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                            <div className="bg-wild-sunset h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Link (e.g., /safaris)</label>
                    <input type="text" value={service.link || ''} onChange={(e) => handleServiceChange(index, 'link', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
