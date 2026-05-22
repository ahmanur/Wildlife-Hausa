'use client';

import React, { useState, useEffect } from 'react';
import { getAboutContent, updateAboutContent } from '@/lib/firebase/services';
import { Loader2, Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { SafariRingBadge } from '@/components/ui/SafariRingBadge';

export interface FieldPrinciple {
  title: string;
  title_ha?: string;
  text: string;
  text_ha?: string;
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
  ]
};

export default function AdminAboutPage() {
  const [content, setContent] = useState<AboutContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Background Image URL</label>
            <div className="flex items-center gap-3">
              <ImageIcon className="text-gray-400" size={20} />
              <input type="text" value={content.heroImage || ''} onChange={(e) => handleChange('heroImage', e.target.value)} className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Mission Image URL</label>
            <div className="flex items-center gap-3">
              <ImageIcon className="text-gray-400" size={20} />
              <input type="text" value={content.missionImage || ''} onChange={(e) => handleChange('missionImage', e.target.value)} className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg" />
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
    </div>
  );
}
