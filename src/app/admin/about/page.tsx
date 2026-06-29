'use client';

import React, { useState, useEffect } from 'react';
import { getAboutContent, updateAboutContent } from '@/lib/firebase/services';
import { Loader2, Save, Plus, Trash2, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { SafariRingBadge } from '@/components/ui/SafariRingBadge';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export interface FieldPrinciple {
  title: string;
  title_ha?: string;
  text: string;
  text_ha?: string;
}

export interface Founder {
  name: string;
  role: string;
  role_ha?: string;
  bio: string;
  bio_ha?: string;
  image: string;
}

export interface AboutContent {
  heroTitle: string;
  heroTitle_ha?: string;
  heroSubtitle: string;
  heroSubtitle_ha?: string;
  heroImage: string;
  missionTitle: string;
  missionTitle_ha?: string;
  missionSubtitle: string;
  missionSubtitle_ha?: string;
  missionP1: string;
  missionP1_ha?: string;
  missionP2: string;
  missionP2_ha?: string;
  missionImage: string;
  principlesTitle: string;
  principlesTitle_ha?: string;
  principles: FieldPrinciple[];
  foundersTitle?: string;
  foundersTitle_ha?: string;
  founders?: Founder[];
}

const DEFAULT_CONTENT: AboutContent = {
  heroTitle: "The Wild Hausa Story",
  heroSubtitle: "Born from a deep respect for Northern Nigeria's untamed landscapes, Wild Hausa exists to connect people with nature through authentic expeditions, compelling storytelling, and relentless conservation.",
  heroImage: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=2000",
  missionTitle: "Our Mission",
  missionSubtitle: "A PURPOSE-DRIVEN EXPEDITION",
  missionP1: "We believe that true conservation begins with connection. Our mission is to bridge the gap between people and the wild through immersive eco-tourism and powerful documentary storytelling.",
  missionP2: "By partnering with local communities, park rangers, and global researchers, we work tirelessly to ensure that the rich biodiversity of Northern Nigeria is preserved for future generations.",
  missionImage: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1000",
  principlesTitle: "Our Field Principles",
  principles: [
    { title: "Leave No Trace", text: "We strictly adhere to zero-impact eco-tourism standards." },
    { title: "Community First", text: "Local communities are our primary conservation partners." },
    { title: "Ethical Wildlife Viewing", text: "We prioritize animal welfare over photo opportunities." },
    { title: "Deep Education", text: "Every expedition is a moving classroom about ecology." },
    { title: "Sustainable Logistics", text: "From solar-powered camps to minimal plastic use." },
    { title: "Scientific Support", text: "A percentage of our revenue funds ecological research." },
  ],
  foundersTitle: "Meet the Founders",
  foundersTitle_ha: "Haɗu da Masu Kafa Wild Hausa",
  founders: [
    {
      name: "Founder Name",
      role: "Co-Founder & Director",
      role_ha: "Mataimakin Kafa & Darakta",
      bio: "Founder biography goes here detailing their background, passion, and role at Wild Hausa.",
      bio_ha: "Tarihin mai kafa zai shiga nan yana bayyana asalinsa, sha'awarsa, da matsayinsa a Wild Hausa.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"
    }
  ]
};

export default function AdminAboutPage() {
  const [content, setContent] = useState<AboutContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Upload States
  const [uploadingHero, setUploadingHero] = useState(false);
  const [heroProgress, setHeroProgress] = useState(0);
  const [uploadingMission, setUploadingMission] = useState(false);
  const [missionProgress, setMissionProgress] = useState(0);
  const [uploadingFounder, setUploadingFounder] = useState<{[key: number]: boolean}>({});
  const [founderProgress, setFounderProgress] = useState<{[key: number]: number}>({});

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    setUploadingHero(true);
    setHeroProgress(0);

    try {
      const storageRef = ref(storage, `about/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot: any) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setHeroProgress(Math.round(progress));
        },
        (error: any) => {
          console.error("Upload failed", error);
          alert('Failed to upload image.');
          setUploadingHero(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          handleChange('heroImage', downloadURL);
          setUploadingHero(false);
        }
      );
    } catch (err) {
      console.error(err);
      setUploadingHero(false);
      alert('Failed to initialize upload.');
    }
  };

  const handleMissionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    setUploadingMission(true);
    setMissionProgress(0);

    try {
      const storageRef = ref(storage, `about/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot: any) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setMissionProgress(Math.round(progress));
        },
        (error: any) => {
          console.error("Upload failed", error);
          alert('Failed to upload image.');
          setUploadingMission(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          handleChange('missionImage', downloadURL);
          setUploadingMission(false);
        }
      );
    } catch (err) {
      console.error(err);
      setUploadingMission(false);
      alert('Failed to initialize upload.');
    }
  };

  const handleFounderImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    setUploadingFounder(prev => ({ ...prev, [index]: true }));
    setFounderProgress(prev => ({ ...prev, [index]: 0 }));

    try {
      const storageRef = ref(storage, `about/founders_${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot: any) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setFounderProgress(prev => ({ ...prev, [index]: Math.round(progress) }));
        },
        (error: any) => {
          console.error("Upload failed", error);
          alert('Failed to upload image.');
          setUploadingFounder(prev => ({ ...prev, [index]: false }));
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          handleFounderChange(index, 'image', downloadURL);
          setUploadingFounder(prev => ({ ...prev, [index]: false }));
        }
      );
    } catch (err) {
      console.error(err);
      setUploadingFounder(prev => ({ ...prev, [index]: false }));
      alert('Failed to initialize upload.');
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAboutContent();
        if (data && Object.keys(data).length > 0) {
          setContent({ ...DEFAULT_CONTENT, ...data });
        }
      } catch (error) {
        console.error('Failed to load about content:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleChange = (field: keyof AboutContent, value: any) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const handlePrincipleChange = (index: number, field: keyof FieldPrinciple, value: string) => {
    const newPrinciples = [...content.principles];
    newPrinciples[index] = { ...newPrinciples[index], [field]: value };
    setContent(prev => ({ ...prev, principles: newPrinciples }));
  };

  const addPrinciple = () => {
    setContent(prev => ({
      ...prev,
      principles: [...prev.principles, { title: 'New Principle', text: 'Description here' }]
    }));
  };

  const removePrinciple = (index: number) => {
    const newPrinciples = [...content.principles];
    newPrinciples.splice(index, 1);
    setContent(prev => ({ ...prev, principles: newPrinciples }));
  };

  const handleFounderChange = (index: number, field: keyof Founder, value: string) => {
    const newFounders = [...(content.founders || [])];
    newFounders[index] = { ...newFounders[index], [field]: value };
    setContent(prev => ({ ...prev, founders: newFounders }));
  };

  const addFounder = () => {
    setContent(prev => ({
      ...prev,
      founders: [...(prev.founders || []), { name: 'New Founder', role: 'Role', bio: 'Biography', image: '' }]
    }));
  };

  const removeFounder = (index: number) => {
    const newFounders = [...(content.founders || [])];
    newFounders.splice(index, 1);
    setContent(prev => ({ ...prev, founders: newFounders }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await updateAboutContent(content as unknown as Record<string, unknown>);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save about content:', error);
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
          <h1 className="text-3xl font-serif font-bold text-wild-deep-forest mb-2">About Page Content</h1>
          <p className="text-gray-500">Manage the content and translations for the public About page.</p>
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
          Successfully saved changes to the About page content.
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-wild-deep-forest">Hero Section</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title (e.g., 'About Us')</label>
                <input type="text" value={content.heroTitle || ''} onChange={(e) => handleChange('heroTitle', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle (e.g., 'Wild Hausa is a dynamic...')</label>
                <textarea rows={3} value={content.heroSubtitle || ''} onChange={(e) => handleChange('heroSubtitle', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title (Hausa)</label>
                <input type="text" value={content.heroTitle_ha || ''} onChange={(e) => handleChange('heroTitle_ha', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle (Hausa)</label>
                <textarea rows={3} value={content.heroSubtitle_ha || ''} onChange={(e) => handleChange('heroSubtitle_ha', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Background Image</label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ImageIcon className="text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Image URL"
                  value={content.heroImage || ''} 
                  onChange={(e) => handleChange('heroImage', e.target.value)} 
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm" 
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 bg-white border border-gray-300 hover:border-wild-sunset text-gray-700 px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm text-sm font-medium">
                  <UploadCloud size={16} className="text-wild-sunset" />
                  {uploadingHero ? `Uploading... ${heroProgress}%` : 'Upload Image'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleHeroImageUpload}
                    className="hidden"
                    disabled={uploadingHero}
                  />
                </label>
                {uploadingHero && (
                  <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                    <div className="bg-wild-sunset h-2 rounded-full transition-all duration-300" style={{ width: `${heroProgress}%` }}></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-wild-deep-forest">Mission & Vision Section</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mission Tagline (e.g., 'A PURPOSE-DRIVEN EXPEDITION')</label>
                <input type="text" value={content.missionSubtitle || ''} onChange={(e) => handleChange('missionSubtitle', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mission Title (e.g., 'Our Mission')</label>
                <input type="text" value={content.missionTitle || ''} onChange={(e) => handleChange('missionTitle', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph 1 (e.g., 'Our mission is to promote...')</label>
                <textarea rows={3} value={content.missionP1 || ''} onChange={(e) => handleChange('missionP1', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph 2 (e.g., 'Whether we are capturing...')</label>
                <textarea rows={3} value={content.missionP2 || ''} onChange={(e) => handleChange('missionP2', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mission Tagline (Hausa)</label>
                <input type="text" value={content.missionSubtitle_ha || ''} onChange={(e) => handleChange('missionSubtitle_ha', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mission Title (Hausa)</label>
                <input type="text" value={content.missionTitle_ha || ''} onChange={(e) => handleChange('missionTitle_ha', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph 1 (Hausa)</label>
                <textarea rows={3} value={content.missionP1_ha || ''} onChange={(e) => handleChange('missionP1_ha', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph 2 (Hausa)</label>
                <textarea rows={3} value={content.missionP2_ha || ''} onChange={(e) => handleChange('missionP2_ha', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mission Image</label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ImageIcon className="text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Image URL"
                  value={content.missionImage || ''} 
                  onChange={(e) => handleChange('missionImage', e.target.value)} 
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm" 
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 bg-white border border-gray-300 hover:border-wild-sunset text-gray-700 px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm text-sm font-medium">
                  <UploadCloud size={16} className="text-wild-sunset" />
                  {uploadingMission ? `Uploading... ${missionProgress}%` : 'Upload Image'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleMissionImageUpload}
                    className="hidden"
                    disabled={uploadingMission}
                  />
                </label>
                {uploadingMission && (
                  <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                    <div className="bg-wild-sunset h-2 rounded-full transition-all duration-300" style={{ width: `${missionProgress}%` }}></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Field Principles Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-wild-deep-forest">Field Principles</h2>
          <button onClick={addPrinciple} className="flex items-center gap-2 text-sm font-medium text-wild-sunset hover:text-[#FF8C42]">
            <Plus size={16} /> Add Principle
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Principles Section Title (e.g., 'Our Field Principles')</label>
              <input type="text" value={content.principlesTitle || ''} onChange={(e) => handleChange('principlesTitle', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Principles Section Title (Hausa)</label>
              <input type="text" value={content.principlesTitle_ha || ''} onChange={(e) => handleChange('principlesTitle_ha', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
            </div>
          </div>
          
          <div className="space-y-6">
            {content.principles.map((principle, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                <button 
                  onClick={() => removePrinciple(index)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                  title="Remove Principle"
                >
                  <Trash2 size={18} />
                </button>
                <div className="font-medium text-gray-500 mb-4 uppercase tracking-wider text-xs">Principle {index + 1}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Title (English)" 
                      value={principle.title} 
                      onChange={(e) => handlePrincipleChange(index, 'title', e.target.value)} 
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded" 
                    />
                    <textarea 
                      placeholder="Description (English)" 
                      rows={2} 
                      value={principle.text} 
                      onChange={(e) => handlePrincipleChange(index, 'text', e.target.value)} 
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded" 
                    />
                  </div>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Title (Hausa)" 
                      value={principle.title_ha || ''} 
                      onChange={(e) => handlePrincipleChange(index, 'title_ha', e.target.value)} 
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded" 
                    />
                    <textarea 
                      placeholder="Description (Hausa)" 
                      rows={2} 
                      value={principle.text_ha || ''} 
                      onChange={(e) => handlePrincipleChange(index, 'text_ha', e.target.value)} 
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Founders Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-wild-deep-forest">Founders Section</h2>
          <button onClick={addFounder} className="flex items-center gap-2 text-sm font-medium text-wild-sunset hover:text-[#FF8C42]">
            <Plus size={16} /> Add Founder
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Founders Section Title (e.g., 'Meet the Founders')</label>
              <input type="text" value={content.foundersTitle || ''} onChange={(e) => handleChange('foundersTitle', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Founders Section Title (Hausa)</label>
              <input type="text" value={content.foundersTitle_ha || ''} onChange={(e) => handleChange('foundersTitle_ha', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
            </div>
          </div>
          
          <div className="space-y-6">
            {(content.founders || []).map((founder, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                <button 
                  onClick={() => removeFounder(index)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                  title="Remove Founder"
                >
                  <Trash2 size={18} />
                </button>
                <div className="font-medium text-gray-500 mb-4 uppercase tracking-wider text-xs font-bold text-wild-sunset">Founder {index + 1}</div>
                <div className="grid grid-cols-1 gap-6">
                  
                  {/* Name and Image URL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Founder Name" 
                        value={founder.name} 
                        onChange={(e) => handleFounderChange(index, 'name', e.target.value)} 
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Founder Photo</label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="text-gray-400" size={16} />
                          <input 
                            type="text" 
                            placeholder="Image URL"
                            value={founder.image} 
                            onChange={(e) => handleFounderChange(index, 'image', e.target.value)} 
                            className="flex-1 px-3 py-1 bg-gray-50 border border-gray-300 rounded text-xs" 
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-1 bg-white border border-gray-300 hover:border-wild-sunset text-gray-700 px-3 py-1 rounded cursor-pointer transition-colors shadow-sm text-xs font-medium">
                            <UploadCloud size={14} className="text-wild-sunset" />
                            {uploadingFounder[index] ? `Uploading... ${founderProgress[index] || 0}%` : 'Upload Photo'}
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleFounderImageUpload(index, e)}
                              className="hidden"
                              disabled={uploadingFounder[index]}
                            />
                          </label>
                          {uploadingFounder[index] && (
                            <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-1">
                              <div className="bg-wild-sunset h-1 rounded-full transition-all duration-300" style={{ width: `${founderProgress[index] || 0}%` }}></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Role/Title */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Role / Title (English)</label>
                      <input 
                        type="text" 
                        placeholder="Co-Founder & CEO" 
                        value={founder.role} 
                        onChange={(e) => handleFounderChange(index, 'role', e.target.value)} 
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Role / Title (Hausa)</label>
                      <input 
                        type="text" 
                        placeholder="Mataimakin Kafa & Shugaba" 
                        value={founder.role_ha || ''} 
                        onChange={(e) => handleFounderChange(index, 'role_ha', e.target.value)} 
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded" 
                      />
                    </div>
                  </div>

                  {/* Biography */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Biography (English)</label>
                      <textarea 
                        placeholder="Founder biography in English..." 
                        rows={4} 
                        value={founder.bio} 
                        onChange={(e) => handleFounderChange(index, 'bio', e.target.value)} 
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Biography (Hausa)</label>
                      <textarea 
                        placeholder="Tarihin mai kafa a Hausa..." 
                        rows={4} 
                        value={founder.bio_ha || ''} 
                        onChange={(e) => handleFounderChange(index, 'bio_ha', e.target.value)} 
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded" 
                      />
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
