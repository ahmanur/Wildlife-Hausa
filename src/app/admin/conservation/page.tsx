'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, X, Loader2, BookOpen, Leaf, 
  HeartHandshake, Award, Users, Shield, Compass, Save, Check, UploadCloud 
} from 'lucide-react';
import { getConservationNotes, createDocument, updateDocument, removeDocument } from '@/lib/firebase/services';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { db, storage } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface ConservationNote {
  id: string;
  title: string;
  title_ha?: string;
  text: string;
  text_ha?: string;
  icon: string;
  order: number;
  category?: string;
  category_ha?: string;
  subtitle?: string;
  subtitle_ha?: string;
  image?: string;
  downloadUrl?: string;
}

const AVAILABLE_ICONS = [
  { name: 'Leaf', component: <Leaf size={16} /> },
  { name: 'BookOpen', component: <BookOpen size={16} /> },
  { name: 'HeartHandshake', component: <HeartHandshake size={16} /> },
  { name: 'Award', component: <Award size={16} /> },
  { name: 'Users', component: <Users size={16} /> },
  { name: 'Shield', component: <Shield size={16} /> },
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

export default function AdminConservationPage() {
  const [activeTab, setActiveTab] = useState<'notes' | 'worlds'>('notes');
  const [notes, setNotes] = useState<ConservationNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<ConservationNote | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Notes Form Fields
  const [title, setTitle] = useState('');
  const [title_ha, setTitleHa] = useState('');
  const [text, setText] = useState('');
  const [text_ha, setTextHa] = useState('');
  const [icon, setIcon] = useState('Leaf');
  const [order, setOrder] = useState(1);
  const [category, setCategory] = useState('');
  const [category_ha, setCategoryHa] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [subtitle_ha, setSubtitleHa] = useState('');
  const [image, setImage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  // Upload States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docProgress, setDocProgress] = useState(0);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    setUploadingImage(true);
    setImageProgress(0);

    try {
      const storageRef = ref(storage, `journal_images/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageProgress(Math.round(progress));
        },
        (error) => {
          console.error("Upload failed", error);
          alert('Failed to upload image.');
          setUploadingImage(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setImage(downloadURL);
          setUploadingImage(false);
        }
      );
    } catch (err) {
      console.error(err);
      setUploadingImage(false);
      alert('Failed to initialize upload.');
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    setDocProgress(0);

    try {
      const storageRef = ref(storage, `journal_docs/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setDocProgress(Math.round(progress));
        },
        (error) => {
          console.error("Upload failed", error);
          alert('Failed to upload document.');
          setUploadingDoc(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setDownloadUrl(downloadURL);
          setUploadingDoc(false);
        }
      );
    } catch (err) {
      console.error(err);
      setUploadingDoc(false);
      alert('Failed to initialize upload.');
    }
  };

  // Worlds States
  const [worlds, setWorlds] = useState<any[]>([]);
  const [loadingWorlds, setLoadingWorlds] = useState(true);
  const [savingWorlds, setSavingWorlds] = useState(false);
  const [savedWorldsSuccess, setSavedWorldsSuccess] = useState(false);
  const [uploadingWorldId, setUploadingWorldId] = useState<string | null>(null);
  const [worldUploadProgress, setWorldUploadProgress] = useState<number>(0);
  const [worldsError, setWorldsError] = useState('');

  useEffect(() => {
    loadNotes();
    loadWorldsSettings();
  }, []);

  async function loadNotes() {
    setLoading(true);
    try {
      const data = await getConservationNotes();
      setNotes(data as ConservationNote[]);
    } catch (err) {
      console.error('Failed to load conservation notes:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadWorldsSettings() {
    setLoadingWorlds(true);
    setWorldsError('');
    try {
      const docRef = doc(db, 'settings', 'global');
      const docSnap = await getDoc(docRef);
      let worldsVal: any[] = DEFAULT_WORLDS;

      if (docSnap.exists()) {
        const data = docSnap.data();
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
      setWorlds(worldsVal);
    } catch (err) {
      console.error('Failed to load worlds settings:', err);
      setWorldsError('Failed to fetch settings from Firestore database.');
    } finally {
      setLoadingWorlds(false);
    }
  }

  const openAddModal = () => {
    setCurrentNote(null);
    setTitle('');
    setTitleHa('');
    setText('');
    setTextHa('');
    setIcon('Leaf');
    setOrder(notes.length + 1);
    setCategory('');
    setCategoryHa('');
    setSubtitle('');
    setSubtitleHa('');
    setImage('');
    setDownloadUrl('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (note: ConservationNote) => {
    setCurrentNote(note);
    setTitle(note.title || '');
    setTitleHa(note.title_ha || '');
    setText(note.text || '');
    setTextHa(note.text_ha || '');
    setIcon(note.icon || 'Leaf');
    setOrder(note.order || 1);
    setCategory(note.category || '');
    setCategoryHa(note.category_ha || '');
    setSubtitle(note.subtitle || '');
    setSubtitleHa(note.subtitle_ha || '');
    setImage(note.image || '');
    setDownloadUrl(note.downloadUrl || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !text || !icon) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      title,
      title_ha,
      text,
      text_ha,
      icon,
      order: Number(order) || 1,
      category,
      category_ha,
      subtitle,
      subtitle_ha,
      image,
      downloadUrl,
    };

    try {
      if (currentNote) {
        await updateDocument(COLLECTIONS.CONSERVATION_NOTES, currentNote.id, payload);
      } else {
        await createDocument(COLLECTIONS.CONSERVATION_NOTES, payload);
      }
      setIsModalOpen(false);
      await loadNotes();
    } catch (err) {
      console.error(err);
      setError('An error occurred while saving the field journal entry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this field journal entry?')) return;
    try {
      await removeDocument(COLLECTIONS.CONSERVATION_NOTES, id);
      await loadNotes();
    } catch (err) {
      console.error(err);
      alert('Failed to delete entry.');
    }
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

  const handleSaveWorlds = async () => {
    setSavingWorlds(true);
    setWorldsError('');
    setSavedWorldsSuccess(false);

    try {
      const docRef = doc(db, 'settings', 'global');
      await setDoc(docRef, {
        worlds: worlds,
        updatedAt: new Date()
      }, { merge: true });

      setSavedWorldsSuccess(true);
      setTimeout(() => setSavedWorldsSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setWorldsError('Failed to save worlds settings configurations.');
    } finally {
      setSavingWorlds(false);
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Leaf': return <Leaf className="text-wild-moss" size={18} />;
      case 'BookOpen': return <BookOpen className="text-wild-sunset" size={18} />;
      case 'HeartHandshake': return <HeartHandshake className="text-wild-brown" size={18} />;
      case 'Award': return <Award className="text-yellow-600" size={18} />;
      case 'Users': return <Users className="text-indigo-600" size={18} />;
      case 'Shield': return <Shield className="text-emerald-700" size={18} />;
      default: return <BookOpen className="text-gray-600" size={18} />;
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Field Journal</h1>
          <p className="text-gray-500 mt-1">
            {activeTab === 'notes' 
              ? 'Manage entries displayed on the Field Journal page.' 
              : 'Customize titles, descriptions, and media for the Four Worlds of Wild Hausa.'}
          </p>
        </div>
        {activeTab === 'notes' ? (
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-wild-sunset hover:bg-wild-sunset/90 text-white px-4 py-2.5 rounded-lg transition-colors font-medium text-sm shadow-sm self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Add Entry</span>
          </button>
        ) : (
          <button 
            onClick={handleSaveWorlds}
            disabled={savingWorlds}
            className="flex items-center gap-2 bg-wild-sunset hover:bg-wild-sunset/90 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg transition-colors font-medium text-sm shadow-sm self-start sm:self-auto"
          >
            {savingWorlds ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : savedWorldsSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{savingWorlds ? 'Saving...' : savedWorldsSuccess ? 'Saved!' : 'Save Worlds Settings'}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'notes' 
              ? 'border-wild-sunset text-wild-sunset' 
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <BookOpen size={16} />
          <span>Field Journal Entries</span>
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

      {activeTab === 'notes' ? (
        loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-10 h-10 animate-spin text-wild-sunset mb-2" />
            <p className="text-gray-500 font-serif">Loading field journal...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4 w-20 text-center">Cover</th>
                    <th className="px-6 py-4">Title & Details (English / Hausa)</th>
                    <th className="px-6 py-4">Description (English / Hausa)</th>
                    <th className="px-6 py-4 w-20">Order</th>
                    <th className="px-6 py-4 w-24">Download</th>
                    <th className="px-6 py-4 w-28 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {notes.length > 0 ? (
                    notes.map((note) => (
                      <tr key={note.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-center">
                          <div className="w-12 h-10 relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mx-auto shadow-sm">
                            <img 
                              src={note.image || "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=150"} 
                              alt={note.title} 
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 leading-tight">{note.title}</div>
                          {note.subtitle && <div className="text-xs text-gray-500 mt-0.5">{note.subtitle}</div>}
                          {note.category && (
                            <span className="inline-block px-1.5 py-0.5 mt-1 text-[8px] font-bold bg-wild-cream text-wild-forest rounded uppercase tracking-wider">
                              {note.category}
                            </span>
                          )}
                          {note.title_ha && <div className="text-[10px] text-wild-sunset font-medium italic mt-0.5">HA: {note.title_ha}</div>}
                        </td>
                        <td className="px-6 py-4 max-w-xs md:max-w-md truncate">
                          <div className="truncate text-gray-600">{note.text}</div>
                          {note.text_ha && <div className="truncate text-xs text-wild-moss italic mt-0.5">HA: {note.text_ha}</div>}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-600">{note.order}</td>
                        <td className="px-6 py-4">
                          {note.downloadUrl ? (
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                              <Check size={14} /> Yes
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">No</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => openEditModal(note)}
                              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(note.id)}
                              className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-serif">
                        No journal entries found. Create one to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        loadingWorlds ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-10 h-10 animate-spin text-wild-sunset mb-2" />
            <p className="text-gray-500 font-serif">Loading worlds settings...</p>
          </div>
        ) : (
          <div className="space-y-8 bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-fade-in">
            {worldsError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm font-medium">
                ✗ {worldsError}
              </div>
            )}

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
                      <div className="relative w-24 h-12 rounded overflow-hidden border border-gray-300 animate-fade-in">
                        <img src={world.image} alt={world.title_en} className="object-cover w-full h-full" />
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
        )
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl border border-gray-100">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-gray-900">
                {currentNote ? 'Edit Field Journal Entry' : 'Add New Entry'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Entry Title (English) *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-wild-sunset text-sm"
                  placeholder="e.g. Habitat Preservation"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Entry Title (Hausa)</label>
                <input 
                  type="text" 
                  value={title_ha} 
                  onChange={(e) => setTitleHa(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-wild-sunset text-sm"
                  placeholder="e.g. Kiyaye Muhallin Halitta"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Category (English)</label>
                  <input 
                    type="text" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-wild-sunset text-sm"
                    placeholder="e.g. PAST, CONSERVATION"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Category (Hausa)</label>
                  <input 
                    type="text" 
                    value={category_ha} 
                    onChange={(e) => setCategoryHa(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-wild-sunset text-sm"
                    placeholder="e.g. NA DA, KIYAYEWA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Subtitle/Details (English)</label>
                  <input 
                    type="text" 
                    value={subtitle} 
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-wild-sunset text-sm"
                    placeholder="e.g. University of Ilorin · 2018"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Subtitle/Details (Hausa)</label>
                  <input 
                    type="text" 
                    value={subtitle_ha} 
                    onChange={(e) => setSubtitleHa(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-wild-sunset text-sm"
                    placeholder="e.g. Jami'ar Ilorin · 2018"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Cover Image URL</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={image} 
                    onChange={(e) => setImage(e.target.value)}
                    className="flex-1 px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-wild-sunset text-sm bg-white"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <label className="flex items-center justify-center bg-white border border-gray-300 hover:border-wild-sunset text-gray-700 px-4 rounded-lg cursor-pointer transition-colors shadow-sm text-xs font-semibold shrink-0">
                    <UploadCloud size={14} className="text-wild-sunset mr-1.5" />
                    {uploadingImage ? `Uploading ${imageProgress}%` : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Journal File/PDF URL</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={downloadUrl} 
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-wild-sunset text-sm bg-white"
                    placeholder="https://firebasestorage.googleapis.com/..."
                  />
                  <label className="flex items-center justify-center bg-white border border-gray-300 hover:border-wild-sunset text-gray-700 px-4 rounded-lg cursor-pointer transition-colors shadow-sm text-xs font-semibold shrink-0">
                    <UploadCloud size={14} className="text-wild-sunset mr-1.5" />
                    {uploadingDoc ? `Uploading ${docProgress}%` : 'Upload PDF'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleDocUpload}
                      className="hidden"
                      disabled={uploadingDoc}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Description (English) *</label>
                <textarea 
                  rows={3}
                  value={text} 
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-wild-sunset text-sm resize-none"
                  placeholder="Understanding the delicate balance of the Sahel ecosystem..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Description (Hausa)</label>
                <textarea 
                  rows={3}
                  value={text_ha} 
                  onChange={(e) => setTextHa(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-wild-sunset text-sm resize-none"
                  placeholder="Fahimtar daidaiton muhallin Sahel da kokarinmu..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Display Icon *</label>
                  <select 
                    value={icon} 
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-wild-sunset text-sm text-gray-700 bg-white"
                    required
                  >
                    {AVAILABLE_ICONS.map((ico) => (
                      <option key={ico.name} value={ico.name}>
                        {ico.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Display Order *</label>
                  <input 
                    type="number" 
                    value={order} 
                    onChange={(e) => setOrder(Number(e.target.value))}
                    min={1}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-wild-sunset text-sm"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex items-center gap-1.5 bg-wild-sunset hover:bg-wild-sunset/90 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
