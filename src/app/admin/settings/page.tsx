'use client';

import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Loader2, Video, Languages, Plus, Trash2, Save, Play, Check, UploadCloud, Compass } from 'lucide-react';

interface OverrideEntry {
  en: string;
  ha: string;
  label: string;
  type?: 'text' | 'textarea';
}

const DEFAULT_OVERRIDES: Record<string, OverrideEntry> = {
  hero_badge: { en: "DUNIYAR DABBOBIN DAJI", ha: "DUNIYAR DABBOBIN DAJI", label: "Homepage Hero Badge Tagline (e.g., 'DUNIYAR DABBOBIN DAJI')", type: 'text' },
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
  contact_hq_val: { en: "123 Savanna Way, Kano, Northern Nigeria", ha: "Lamba 123 Titin Savanna, Kano, Arewacin Najeriya", label: "Contact HQ Address (Footer/Contact Page, e.g., '123 Savanna Way...')", type: 'text' },
  contact_val: { en: "hello@wildhausa.com | +234 800 WILD HAUSA", ha: "hello@wildhausa.com | +234 800 WILD HAUSA", label: "Contact Phone & Email Row (Footer/Contact Page, e.g., 'hello@wildhausa.com | +234...')", type: 'text' },
};

const DEFAULT_VIDEO_CLIPS = [
  "https://videos.pexels.com/video-files/855538/855538-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/7710516/7710516-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/20600021/20600021-uhd_2560_1440_25fps.mp4"
];

const DEFAULT_WORLDS = [
  {
    id: 'film',
    title_en: "Film the Wild",
    title_ha: "Dauki Fim din Daji",
    label_en: "Nature Media",
    label_ha: "Kafofin Yada Labaran Halitta",
    description_en: "Cinematic storytelling bringing the untamed beauty of Northern Nigeria to the world.",
    description_ha: "Hada fina-finan musamman masu nuna kyawun halittar Arewacin Najeriya ga duniya.",
    image: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800",
    link: "/documentaries"
  },
  {
    id: 'journey',
    title_en: "Journey the Wild",
    title_ha: "Tafiya Daji",
    label_en: "Eco-Tourism",
    label_ha: "Yawon Bude Ido na Halitta",
    description_en: "Guided safaris and expeditions into the heart of the savanna and deep forests.",
    description_ha: "Ziyara ta musamman zuwa tsakiyar yankunan daji da manyan dazuzzuka.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
    link: "/safaris"
  },
  {
    id: 'play',
    title_en: "Play in the Wild",
    title_ha: "Wasa a Daji",
    label_en: "Adventure Recreation",
    label_ha: "Wasannin Kasada",
    description_en: "Outdoor recreation, nature trails, and challenges designed for all ages.",
    description_ha: "Wasannin motsa jiki a fili, hanyoyin yawo a daji, da kalubale ga kowane shekaru.",
    image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=800",
    link: "/adventure-park"
  },
  {
    id: 'protect',
    title_en: "Protect the Wild",
    title_ha: "Kare Daji",
    label_en: "Conservation",
    label_ha: "Kiyayewa",
    description_en: "Active efforts to preserve habitats, protect wildlife, and educate communities.",
    description_ha: "Ayyukan kare muhalli, kare dabbobin daji, da ilimantar da al'ummomi.",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800",
    link: "/conservation"
  }
];

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'copy' | 'videos' | 'worlds'>('copy');
  const [error, setError] = useState('');

  // States for edited content
  const [copyOverrides, setCopyOverrides] = useState<Record<string, { en: string; ha: string }>>({});
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [worlds, setWorlds] = useState<any[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingWorldId, setUploadingWorldId] = useState<string | null>(null);
  const [worldUploadProgress, setWorldUploadProgress] = useState<number>(0);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const docRef = doc(db, 'settings', 'global');
        const docSnap = await getDoc(docRef);

        let overridesVal: Record<string, { en: string; ha: string }> = {};
        let videosVal: string[] = DEFAULT_VIDEO_CLIPS;
        let worldsVal: any[] = DEFAULT_WORLDS;

        if (docSnap.exists()) {
          const data = docSnap.data();
          overridesVal = data.overrides || {};
          if ('hero_videos' in data) {
            videosVal = data.hero_videos;
          }
          if ('worlds' in data && Array.isArray(data.worlds)) {
            worldsVal = DEFAULT_WORLDS.map(defWorld => {
              const found = data.worlds.find((w: any) => w.id === defWorld.id);
              if (found) {
                return { ...defWorld, ...found };
              }
              return defWorld;
            });
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

        setCopyOverrides(mergedCopy);
        setVideoUrls(videosVal);
        setWorlds(worldsVal);
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
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error("Upload failed", error);
          alert('Failed to upload video.');
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

  const handleWorldFieldChange = (worldId: string, field: string, value: string) => {
    setWorlds(prev =>
      prev.map(w => w.id === worldId ? { ...w, [field]: value } : w)
    );
  };

  const handleWorldImageUpload = async (worldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    setUploadingWorldId(worldId);
    setWorldUploadProgress(0);

    try {
      const storageRef = ref(storage, `world_images/${worldId}_${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setWorldUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error("Upload failed", error);
          alert('Failed to upload image.');
          setUploadingWorldId(null);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setWorlds(prev => 
            prev.map(w => w.id === worldId ? { ...w, image: downloadURL } : w)
          );
          setUploadingWorldId(null);
        }
      );
    } catch (err) {
      console.error(err);
      setUploadingWorldId(null);
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
        worlds: worlds,
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
          onClick={() => setActiveTab('worlds')}
          className={`pb-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'worlds' 
              ? 'border-wild-sunset text-wild-sunset' 
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Compass size={16} />
          <span>Four Worlds of Wild Hausa</span>
        </button>
      </div>

      {/* Content panes */}
      {activeTab === 'copy' ? (
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
              </div>
            );
          })}
        </div>
      ) : activeTab === 'videos' ? (
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
      ) : (
        <div className="space-y-8 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div>
            <h3 className="font-serif font-bold text-gray-800">Four Worlds of Wild Hausa</h3>
            <p className="text-gray-500 text-xs mt-0.5">Customize the title, label, description, redirect link, and background image for each of the 4 worlds featured on the homepage.</p>
          </div>

          <div className="space-y-8">
            {worlds.map((world) => (
              <div key={world.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200 relative">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-wild-sunset/10 flex items-center justify-center text-wild-sunset font-bold uppercase">
                      {world.id}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-gray-800 text-lg">
                        {world.title_en || world.id}
                      </h4>
                      <p className="text-gray-400 text-xs font-mono">id: {world.id}</p>
                    </div>
                  </div>
                  
                  {world.image && (
                    <div className="relative w-24 h-12 rounded overflow-hidden border border-gray-300">
                      <img src={world.image} alt={world.title_en} className="object-cover w-full h-full animate-fade-in" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* English Fields */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-wild-deep-forest tracking-wider uppercase">English Content</h5>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Title (English)</label>
                      <input
                        type="text"
                        value={world.title_en || ''}
                        onChange={(e) => handleWorldFieldChange(world.id, 'title_en', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-850 focus:outline-none focus:border-wild-sunset"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Label (English)</label>
                      <input
                        type="text"
                        value={world.label_en || ''}
                        onChange={(e) => handleWorldFieldChange(world.id, 'label_en', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-850 focus:outline-none focus:border-wild-sunset"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description (English)</label>
                      <textarea
                        rows={3}
                        value={world.description_en || ''}
                        onChange={(e) => handleWorldFieldChange(world.id, 'description_en', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-850 focus:outline-none focus:border-wild-sunset resize-none"
                      />
                    </div>
                  </div>

                  {/* Hausa Fields */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-wild-sunset tracking-wider uppercase">Hausa Content</h5>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Title (Hausa)</label>
                      <input
                        type="text"
                        value={world.title_ha || ''}
                        onChange={(e) => handleWorldFieldChange(world.id, 'title_ha', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-850 focus:outline-none focus:border-wild-sunset"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Label (Hausa)</label>
                      <input
                        type="text"
                        value={world.label_ha || ''}
                        onChange={(e) => handleWorldFieldChange(world.id, 'label_ha', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-850 focus:outline-none focus:border-wild-sunset"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description (Hausa)</label>
                      <textarea
                        rows={3}
                        value={world.description_ha || ''}
                        onChange={(e) => handleWorldFieldChange(world.id, 'description_ha', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-850 focus:outline-none focus:border-wild-sunset resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
                  {/* Link Redirect Field */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Redirect Destination Link</label>
                    <input
                      type="text"
                      value={world.link || ''}
                      onChange={(e) => handleWorldFieldChange(world.id, 'link', e.target.value)}
                      placeholder="/documentaries"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-850 focus:outline-none focus:border-wild-sunset"
                    />
                  </div>

                  {/* Image Field */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Card Background Image</label>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={world.image || ''}
                        onChange={(e) => handleWorldFieldChange(world.id, 'image', e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-850 focus:outline-none focus:border-wild-sunset bg-white"
                      />
                      
                      <label className="flex items-center justify-center bg-white border border-gray-300 hover:border-wild-sunset text-gray-700 px-4 rounded-lg cursor-pointer transition-colors shadow-sm text-xs font-semibold shrink-0">
                        <UploadCloud size={14} className="text-wild-sunset mr-1.5" />
                        {uploadingWorldId === world.id ? `Uploading ${worldUploadProgress}%` : 'Upload File'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleWorldImageUpload(world.id, e)}
                          className="hidden"
                          disabled={uploadingWorldId !== null}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
