'use client';

import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Loader2, Video, Languages, Plus, Trash2, Save, Play, Check, UploadCloud, Compass, Image as ImageIcon } from 'lucide-react';

interface OverrideEntry {
  en: string;
  ha: string;
  label: string;
  type?: 'text' | 'textarea';
  isGlobal?: boolean;
}

const DEFAULT_OVERRIDES: Record<string, OverrideEntry> = {
  hero_badge: { en: "Connecting you to the Wild", ha: "Connecting you to the Wild", label: "Homepage Hero Badge Tagline (e.g., 'Connecting you to the Wild')", type: 'text' },
  hero_title_1: { en: "Explore Majestic", ha: "Bincika Kyawawan", label: "Homepage Hero Title Line 1 (e.g., 'Explore Majestic')", type: 'text' },
  hero_title_2: { en: "Creatures With Us", ha: "Halittu Tare da Mu", label: "Homepage Hero Title Line 2 (e.g., 'Creatures With Us')", type: 'text' },
  hero_subtitle: {
    en: "Experience the untamed beauty of Northern Nigeria. Join our premium guided safaris, witness exclusive wildlife documentaries, and become part of our conservation journey.",
    ha: "Kuyi amfani da damar ganin kyawun yankin Arewacin Najeriya. Kasance tare da mu a shirin tafiya daji na musamman, kallon bidiyon dabbobin daji, kuma ku taimaka wajen kare su.",
    label: "Homepage Hero Subtitle (e.g., 'Experience the untamed beauty...')",
    type: 'textarea'
  },
  about_hero_title: { en: "The Wild Hausa Story", ha: "Tarihin Wild Hausa", label: "About Page Hero Title (e.g., 'The Wild Hausa Story')", type: 'text' },
  about_hero_subtitle: {
    en: "Born from a deep respect for Northern Nigeria's untamed landscapes, Wild Hausa exists to connect people with nature through authentic expeditions, compelling storytelling, and relentless conservation.",
    ha: "An haife shi daga babban girmamawa ga yankunan daji na Arewacin Najeriya. Wild Hausa ya kasance don kusantar da mutane ga halitta ta hanyar tafiye-tafiye na gaskiya.",
    label: "About Page Hero Subtitle (e.g., 'Born from a deep respect...')",
    type: 'textarea'
  },
  contact_hq_val: { en: "123 Savanna Way, Kano, Northern Nigeria", ha: "123 Savanna Way, Kano, Northern Nigeria", label: "Contact HQ Address (Footer/Contact Page, e.g., '123 Savanna Way...')", type: 'text', isGlobal: true },
  contact_val: { en: "hello@wildhausa.com | +234 800 WILD HAUSA", ha: "hello@wildhausa.com | +234 800 WILD HAUSA", label: "Contact Phone & Email Row (Footer/Contact Page, e.g., 'hello@wildhausa.com | +234...')", type: 'text', isGlobal: true },
  social_facebook: { en: "https://facebook.com", ha: "https://facebook.com", label: "Facebook Link (e.g., 'https://facebook.com/...')", type: 'text', isGlobal: true },
  social_youtube: { en: "https://youtube.com", ha: "https://youtube.com", label: "YouTube Link (e.g., 'https://youtube.com/...')", type: 'text', isGlobal: true },
  social_instagram: { en: "https://instagram.com", ha: "https://instagram.com", label: "Instagram Link (e.g., 'https://instagram.com/...')", type: 'text', isGlobal: true },
  social_tiktok: { en: "https://tiktok.com", ha: "https://tiktok.com", label: "TikTok Link (e.g., 'https://tiktok.com/...')", type: 'text', isGlobal: true },
};

const DEFAULT_HERO_IMAGES: Record<string, string> = {
  about: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=2000",
  services: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=2000",
  safaris: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=2000",
  archive: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=2000",
  blog: "https://images.unsplash.com/photo-1602491453979-54a3a1a7220c?auto=format&fit=crop&q=80&w=2000"
};

const DEFAULT_VIDEO_CLIPS = [
  "https://videos.pexels.com/video-files/855538/855538-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/7710516/7710516-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/20600021/20600021-uhd_2560_1440_25fps.mp4"
];

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'copy' | 'videos' | 'hero_images'>('copy');
  const [error, setError] = useState('');

  // States for edited content
  const [copyOverrides, setCopyOverrides] = useState<Record<string, { en: string; ha: string }>>({});
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // States for Hero Section Images
  const [heroImages, setHeroImages] = useState<Record<string, string>>({});
  const [uploadingHero, setUploadingHero] = useState<Record<string, boolean>>({});
  const [heroProgress, setHeroProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const docRef = doc(db, 'settings', 'global');
        const docSnap = await getDoc(docRef);

        let overridesVal: Record<string, { en: string; ha: string }> = {};
        let videosVal: string[] = DEFAULT_VIDEO_CLIPS;
        let heroImagesVal: Record<string, string> = {};

        if (docSnap.exists()) {
          const data = docSnap.data();
          overridesVal = data.overrides || {};
          if ('hero_videos' in data) {
            videosVal = data.hero_videos;
          }
          if ('hero_images' in data) {
            heroImagesVal = data.hero_images || {};
          }
        }

        // Merge overrides with defaults so all keys exist in form
        const mergedCopy: Record<string, { en: string; ha: string }> = {};
        Object.keys(DEFAULT_OVERRIDES).forEach(key => {
          mergedCopy[key] = {
            en: overridesVal[key]?.en || DEFAULT_OVERRIDES[key].en,
            ha: overridesVal[key]?.ha || DEFAULT_OVERRIDES[key].ha,
          };
        });

        // Initialize heroImages with values from firestore, merging with DEFAULT_HERO_IMAGES for keys
        const mergedHeroImages: Record<string, string> = {};
        Object.keys(DEFAULT_HERO_IMAGES).forEach(key => {
          mergedHeroImages[key] = heroImagesVal[key] || DEFAULT_HERO_IMAGES[key];
        });

        setCopyOverrides(mergedCopy);
        setVideoUrls(videosVal);
        setHeroImages(mergedHeroImages);
      } catch (err) {
        console.error('Failed to load settings:', err);
        setError('Failed to fetch settings from Firestore database.');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleCopyChange = (key: string, lang: 'en' | 'ha', value: string) => {
    setCopyOverrides(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [lang]: value
      }
    }));
  };

  const handleAddVideo = () => {
    if (!newVideoUrl) return;
    if (!newVideoUrl.startsWith('http')) {
      alert('Please enter a valid HTTP/HTTPS URL.');
      return;
    }
    setVideoUrls([...videoUrls, newVideoUrl]);
    setNewVideoUrl('');
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file.');
      return;
    }

    setUploadingVideo(true);
    setUploadProgress(0);

    try {
      const storageRef = ref(storage, `hero_videos/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot: any) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error: any) => {
          console.error("Upload failed", error);
          alert('Failed to upload video. This is usually caused by either:\n1. Firebase Storage not being initialized in your Firebase Console (go to Storage -> Get Started), or\n2. Missing CORS configuration on your storage bucket.\n\nCheck the browser console logs for the exact error details.');
          setUploadingVideo(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setVideoUrls(prev => [...prev, downloadURL]);
          setUploadingVideo(false);
        }
      );
    } catch (err) {
      console.error(err);
      setUploadingVideo(false);
      alert('Failed to initialize upload.');
    }
  };

  const handleRemoveVideo = (index: number) => {
    setVideoUrls(videoUrls.filter((_, i) => i !== index));
  };

  const handleHeroImageUrlChange = (pageKey: string, value: string) => {
    setHeroImages(prev => ({ ...prev, [pageKey]: value }));
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, pageKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    setUploadingHero(prev => ({ ...prev, [pageKey]: true }));
    setHeroProgress(prev => ({ ...prev, [pageKey]: 0 }));

    try {
      const storageRef = ref(storage, `hero_images/${pageKey}_${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot: any) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setHeroProgress(prev => ({ ...prev, [pageKey]: Math.round(progress) }));
        },
        (error: any) => {
          console.error("Upload failed", error);
          alert('Failed to upload image. This is usually caused by either:\n1. Firebase Storage not being initialized in your Firebase Console (go to Storage -> Get Started), or\n2. Missing CORS configuration on your storage bucket.\n\nCheck the browser console logs for the exact error details.');
          setUploadingHero(prev => ({ ...prev, [pageKey]: false }));
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setHeroImages(prev => ({ ...prev, [pageKey]: downloadURL }));
          setUploadingHero(prev => ({ ...prev, [pageKey]: false }));
        }
      );
    } catch (err) {
      console.error(err);
      setUploadingHero(prev => ({ ...prev, [pageKey]: false }));
      alert('Failed to initialize upload.');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSavedSuccess(false);

    try {
      const docRef = doc(db, 'settings', 'global');
      await setDoc(docRef, {
        overrides: copyOverrides,
        hero_videos: videoUrls,
        hero_images: heroImages,
        updatedAt: new Date()
      }, { merge: true });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to save settings configurations.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-wild-sunset mb-2" />
        <p className="text-gray-500 font-serif">Loading global settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Global Settings</h1>
          <p className="text-gray-500 mt-1">Configure layout copywriting translations and slideshow video resources.</p>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-wild-sunset hover:bg-wild-sunset/90 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg transition-colors font-medium text-sm shadow-sm"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : savedSuccess ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? 'Saving...' : savedSuccess ? 'Saved!' : 'Save Settings'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm font-medium">
          ✗ {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('copy')}
          className={`pb-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'copy' 
              ? 'border-wild-sunset text-wild-sunset' 
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Languages size={16} />
          <span>Copywriting & Translations</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'videos' 
              ? 'border-wild-sunset text-wild-sunset' 
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Video size={16} />
          <span>Homepage Hero Videos</span>
        </button>

        <button
          onClick={() => setActiveTab('hero_images')}
          className={`pb-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'hero_images' 
              ? 'border-wild-sunset text-wild-sunset' 
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ImageIcon size={16} />
          <span>Hero Images</span>
        </button>
      </div>

      {/* Content panes */}
      {activeTab === 'copy' && (
        <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-serif font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">Static Copy overrides</h3>
          
          {Object.keys(DEFAULT_OVERRIDES).map((key) => {
            const entry = DEFAULT_OVERRIDES[key];
            const current = copyOverrides[key] || { en: '', ha: '' };
            return (
              <div key={key} className="space-y-3 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                <span className="text-xs font-bold text-wild-deep-forest tracking-wider uppercase bg-wild-sand/20 px-2.5 py-1 rounded">
                  {entry.label}
                </span>

                {entry.isGlobal ? (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Global Value (Same for English and Hausa)</label>
                    <input
                      type="text"
                      value={current.en}
                      onChange={(e) => {
                        handleCopyChange(key, 'en', e.target.value);
                        handleCopyChange(key, 'ha', e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-850 focus:outline-none focus:border-wild-sunset"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* English Field */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">English</label>
                      {entry.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={current.en}
                          onChange={(e) => handleCopyChange(key, 'en', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-850 focus:outline-none focus:border-wild-sunset resize-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={current.en}
                          onChange={(e) => handleCopyChange(key, 'en', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-850 focus:outline-none focus:border-wild-sunset"
                        />
                      )}
                    </div>

                    {/* Hausa Field */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Hausa</label>
                      {entry.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={current.ha}
                          onChange={(e) => handleCopyChange(key, 'ha', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-850 focus:outline-none focus:border-wild-sunset resize-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={current.ha}
                          onChange={(e) => handleCopyChange(key, 'ha', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-850 focus:outline-none focus:border-wild-sunset"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div>
            <h3 className="font-serif font-bold text-gray-800">Slideshow Videos List</h3>
            <p className="text-gray-500 text-xs mt-0.5">Videos loop and cross-fade in the background of the main landing hero section. Specify MP4 files.</p>
          </div>

          <div className="space-y-3">
            {videoUrls.map((url, index) => (
              <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="p-2 bg-white rounded border border-gray-100 text-wild-sunset">
                  <Play size={14} />
                </div>
                <span className="text-xs text-gray-600 font-mono flex-1 truncate">{url}</span>
                <button 
                  type="button"
                  onClick={() => handleRemoveVideo(index)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove video link"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Add New Video</label>
            
            {/* Upload Option */}
            <div className="flex flex-col gap-4 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-sm font-semibold text-gray-800">Option 1: Upload Video File</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 bg-white border border-gray-300 hover:border-wild-sunset text-gray-700 px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm text-sm font-medium">
                  <UploadCloud size={16} className="text-wild-sunset" />
                  {uploadingVideo ? `Uploading... ${uploadProgress}%` : 'Select MP4 File'}
                  <input 
                    type="file" 
                    accept="video/mp4,video/webm,video/quicktime" 
                    onChange={handleVideoUpload}
                    className="hidden"
                    disabled={uploadingVideo}
                  />
                </label>
                {uploadingVideo && (
                  <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2.5">
                    <div className="bg-wild-sunset h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}
              </div>
            </div>

            {/* URL Option */}
            <div className="flex flex-col gap-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-sm font-semibold text-gray-800">Option 2: Add Video by URL</span>
              <div className="flex gap-2">
                <input 
                  type="url" 
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="flex-1 px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-wild-sunset bg-white"
                />
                <button 
                  onClick={handleAddVideo}
                  className="flex items-center gap-1 bg-wild-deep-forest hover:bg-wild-deep-forest/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  <Plus size={16} /> Add URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'hero_images' && (
        <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div>
            <h3 className="font-serif font-bold text-gray-800">Navbar Pages Hero Images</h3>
            <p className="text-gray-500 text-xs mt-0.5">Manage the background images displayed in the top hero banner sections of each main page.</p>
          </div>

          <div className="space-y-8">
            {[
              { key: 'about', label: 'About Page (Our Story)', desc: 'Header image for the Our Story page.' },
              { key: 'services', label: 'Services Page (Worlds)', desc: 'Header image for the Services / Our Wild Worlds page.' },
              { key: 'safaris', label: 'Safaris Page (Expeditions)', desc: 'Header image for the Safari Routes & Expeditions page.' },
              { key: 'archive', label: 'Archive Page (Documentaries)', desc: 'Header image for the Film Archive / Documentaries page.' },
              { key: 'blog', label: 'Blog Page (Field Journal)', desc: 'Header image for the Blog / Field Journal page.' }
            ].map((page) => {
              const currentUrl = heroImages[page.key] || DEFAULT_HERO_IMAGES[page.key];
              const isUploading = uploadingHero[page.key] || false;
              const progress = heroProgress[page.key] || 0;

              return (
                <div key={page.key} className="p-5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-6">
                  {/* Left: Input fields */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-wild-deep-forest">{page.label}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{page.desc}</p>
                    </div>

                    <div className="space-y-3">
                      {/* Option 1: URL input */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Image URL</label>
                        <input
                          type="url"
                          value={currentUrl}
                          onChange={(e) => handleHeroImageUrlChange(page.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-wild-sunset bg-white"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      {/* Option 2: Upload file */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Or Upload Image File</label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 bg-white border border-gray-300 hover:border-wild-sunset text-gray-700 px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-sm text-xs font-medium">
                            <UploadCloud size={14} className="text-wild-sunset" />
                            {isUploading ? `Uploading ${progress}%` : 'Select File'}
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleHeroImageUpload(e, page.key)}
                              className="hidden"
                              disabled={isUploading}
                            />
                          </label>
                          {isUploading && (
                            <div className="w-24 bg-gray-200 rounded-full h-1.5">
                              <div className="bg-wild-sunset h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Image Preview */}
                  <div className="w-full md:w-48 shrink-0 flex flex-col justify-center items-center bg-gray-150 rounded-lg border border-gray-200 overflow-hidden relative group min-h-[120px]">
                    {currentUrl ? (
                      <>
                        <img 
                          src={currentUrl} 
                          alt={`${page.label} Preview`} 
                          className="w-full h-full object-cover min-h-[120px]"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-medium pointer-events-none">
                          Image Preview
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">No Image Selected</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
