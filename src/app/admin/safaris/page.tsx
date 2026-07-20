'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, Compass, Trash, PlusCircle, UploadCloud } from 'lucide-react';
import { getSafariPackages, createDocument, updateDocument, removeDocument } from '@/lib/firebase/services';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { parsePrice } from '@/lib/translations';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface ItineraryDay {
  day: number;
  title: string;
  title_ha?: string;
  description: string;
  description_ha?: string;
}

interface SafariPackage {
  id: string;
  title: string;
  title_ha?: string;
  location: string;
  location_ha?: string;
  duration: string;
  duration_ha?: string;
  bestFor: string;
  bestFor_ha?: string;
  price: string;
  image: string;
  slug: string;
  overview: string;
  overview_ha?: string;
  groupSize: string;
  bestTime: string;
  time?: string;
  itinerary: ItineraryDay[];
  showPricing?: boolean;
  createdAt?: any;
}

export default function AdminSafarisPage() {
  const [safaris, setSafaris] = useState<SafariPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSafari, setCurrentSafari] = useState<SafariPackage | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [title_ha, setTitleHa] = useState('');
  const [location, setLocation] = useState('');
  const [location_ha, setLocationHa] = useState('');
  const [duration, setDuration] = useState('');
  const [duration_ha, setDurationHa] = useState('');
  const [bestFor, setBestFor] = useState('');
  const [bestFor_ha, setBestForHa] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [overview, setOverview] = useState('');
  const [overview_ha, setOverviewHa] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [bestTime, setBestTime] = useState('');
  const [time, setTime] = useState('');
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [showPricing, setShowPricing] = useState(true);

  // Upload States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    setUploadingImage(true);
    setUploadProgress(0);

    try {
      const storageRef = ref(storage, `safaris/${Date.now()}_${file.name}`);
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

  useEffect(() => {
    loadSafaris();
  }, []);

  async function loadSafaris() {
    setLoading(true);
    try {
      const data = await getSafariPackages();
      setSafaris(data as SafariPackage[]);
    } catch (err) {
      console.error('Failed to load safari packages:', err);
    } finally {
      setLoading(false);
    }
  }

  const openAddModal = () => {
    setCurrentSafari(null);
    setTitle('');
    setTitleHa('');
    setLocation('');
    setLocationHa('');
    setDuration('');
    setDurationHa('');
    setBestFor('');
    setBestForHa('');
    setPrice('');
    setImage('');
    setOverview('');
    setOverviewHa('');
    setGroupSize('');
    setBestTime('');
    setTime('');
    setItinerary([{ day: 1, title: '', title_ha: '', description: '', description_ha: '' }]);
    setShowPricing(true);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (safari: SafariPackage) => {
    setCurrentSafari(safari);
    setTitle(safari.title || '');
    setTitleHa(safari.title_ha || '');
    setLocation(safari.location || '');
    setLocationHa(safari.location_ha || '');
    setDuration(safari.duration || '');
    setDurationHa(safari.duration_ha || '');
    setBestFor(safari.bestFor || '');
    setBestForHa(safari.bestFor_ha || '');
    setPrice(safari.price ? parsePrice(safari.price).toString() : '');
    setImage(safari.image || '');
    setOverview(safari.overview || '');
    setOverviewHa(safari.overview_ha || '');
    setGroupSize(safari.groupSize || '');
    setBestTime(safari.bestTime || '');
    setTime(safari.time || '');
    setItinerary(safari.itinerary && safari.itinerary.length > 0 
      ? safari.itinerary 
      : [{ day: 1, title: '', title_ha: '', description: '', description_ha: '' }]
    );
    setShowPricing(safari.showPricing !== false);
    setError('');
    setIsModalOpen(true);
  };

  // Helper to generate slug
  const generateSlug = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  };

  // Itinerary handlers
  const handleAddItineraryDay = () => {
    const nextDay = itinerary.length + 1;
    setItinerary([...itinerary, { day: nextDay, title: '', description: '' }]);
  };

  const handleRemoveItineraryDay = (index: number) => {
    const updated = itinerary.filter((_, i) => i !== index).map((dayObj, i) => ({
      ...dayObj,
      day: i + 1
    }));
    setItinerary(updated.length > 0 ? updated : [{ day: 1, title: '', description: '' }]);
  };

  const handleItineraryChange = (index: number, field: keyof ItineraryDay, value: string | number) => {
    const updated = [...itinerary];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setItinerary(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !duration || !price || !image || !overview) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    setSubmitting(true);
    setError('');

    const slug = generateSlug(title);
    const payload = {
      title,
      title_ha,
      location,
      location_ha,
      duration,
      duration_ha,
      bestFor,
      bestFor_ha,
      price,
      showPricing,
      image,
      slug,
      overview,
      overview_ha,
      groupSize,
      bestTime,
      time,
      itinerary: itinerary.filter(day => day.title.trim() !== '' || day.description.trim() !== '')
    };

    try {
      if (currentSafari) {
        await updateDocument(COLLECTIONS.SAFARI_PACKAGES, currentSafari.id, payload);
      } else {
        await createDocument(COLLECTIONS.SAFARI_PACKAGES, payload);
      }
      setIsModalOpen(false);
      await loadSafaris();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this safari package?')) return;

    try {
      await removeDocument(COLLECTIONS.SAFARI_PACKAGES, id);
      await loadSafaris();
    } catch (err) {
      console.error('Failed to delete safari package:', err);
      alert('Failed to delete package.');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Manage Safaris</h1>
          <p className="text-gray-500 mt-1">Add, edit, or remove safari packages and itineraries.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-wild-sunset hover:bg-opacity-95 text-white rounded-lg font-medium transition-all shadow-sm w-fit"
        >
          <Plus size={18} />
          New Safari
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-10 h-10 animate-spin text-wild-sunset mb-2" />
          <p className="text-gray-500 font-serif">Loading safari packages...</p>
        </div>
      ) : safaris.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Compass className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700">No safaris found</h3>
          <p className="text-gray-500 mt-1">Get started by creating your first safari package.</p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-wild-sunset hover:bg-opacity-90 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Create Safari
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Safari Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {safaris.map((safari) => (
                  <tr key={safari.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {safari.image ? (
                          <img
                            src={safari.image}
                            alt={safari.title}
                            className="w-12 h-8 object-cover rounded bg-gray-100"
                          />
                        ) : (
                          <div className="w-12 h-8 bg-gray-100 flex items-center justify-center rounded text-gray-400">
                            <Compass size={14} />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{safari.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {safari.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {safari.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-wild-brown font-mono">
                      {safari.showPricing === false ? (
                        <span className="text-gray-400 italic">Hidden (₦{parsePrice(safari.price).toLocaleString()})</span>
                      ) : (
                        <span>₦{parsePrice(safari.price).toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditModal(safari)}
                          className="text-gray-600 hover:text-gray-900 transition-colors p-1"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(safari.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-serif font-bold text-xl text-gray-900">
                {currentSafari ? 'Edit Safari Expedition' : 'Create New Safari Expedition'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                  {error}
                </div>
                            )}

              {/* Title & Title HA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase font-sans">Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. The Yankari Grand Tour"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase font-sans">Title (Hausa)</label>
                  <input
                    type="text"
                    value={title_ha}
                    onChange={(e) => setTitleHa(e.target.value)}
                    placeholder="e.g. Babban Ziyaran Yankari"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
              </div>

              {/* Location & Location HA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase font-sans">Location (English) *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bauchi State"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase font-sans">Location (Hausa)</label>
                  <input
                    type="text"
                    value={location_ha}
                    onChange={(e) => setLocationHa(e.target.value)}
                    placeholder="e.g. Jihar Bauchi"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
              </div>

              {/* Duration & Duration HA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase font-sans">Duration (English) *</label>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 3 Days, 2 Nights"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase font-sans">Duration (Hausa)</label>
                  <input
                    type="text"
                    value={duration_ha}
                    onChange={(e) => setDurationHa(e.target.value)}
                    placeholder="e.g. Kwana 3, Dare 2"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
              </div>

              {/* Price, Difficulty & Difficulty HA */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase font-sans">Price Per Person (₦) *</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 150000"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                />
              </div>

              {/* Price Visibility Toggle */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  id="showPricing"
                  checked={showPricing}
                  onChange={(e) => setShowPricing(e.target.checked)}
                  className="w-4 h-4 text-wild-sunset border-gray-300 rounded focus:ring-wild-sunset cursor-pointer"
                />
                <label htmlFor="showPricing" className="text-xs font-bold text-gray-700 uppercase font-sans cursor-pointer select-none">
                  Show Pricing on Website (e.g. on safari cards & details page)
                </label>
              </div>

              {/* Best For, Group Size, Best Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase font-sans">Best For (English)</label>
                  <input
                    type="text"
                    value={bestFor}
                    onChange={(e) => setBestFor(e.target.value)}
                    placeholder="e.g. Families & Tourists"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase font-sans">Best For (Hausa)</label>
                  <input
                    type="text"
                    value={bestFor_ha}
                    onChange={(e) => setBestForHa(e.target.value)}
                    placeholder="e.g. Iyali da Masu Ziyara"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase font-sans">Group Size</label>
                  <input
                    type="text"
                    value={groupSize}
                    onChange={(e) => setGroupSize(e.target.value)}
                    placeholder="e.g. 2 - 12 People"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase font-sans">Date</label>
                  <input
                    type="text"
                    value={bestTime}
                    onChange={(e) => setBestTime(e.target.value)}
                    placeholder="e.g. Nov - March"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase font-sans">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 8:00 AM"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase font-sans">Featured Image URL *</label>
                <div className="space-y-3">
                  <input
                    type="url"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 bg-white border border-gray-300 hover:border-wild-sunset text-gray-700 px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm text-sm font-medium">
                      <UploadCloud size={16} className="text-wild-sunset" />
                      {uploadingImage ? `Uploading... ${uploadProgress}%` : 'Upload Image'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                    {uploadingImage && (
                      <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                        <div className="bg-wild-sunset h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Overview & Overview HA */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase font-sans">Overview Description (English) *</label>
                <textarea
                  required
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  placeholder="Briefly describe what this safari offers..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800 resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase font-sans">Overview Description (Hausa)</label>
                <textarea
                  value={overview_ha}
                  onChange={(e) => setOverviewHa(e.target.value)}
                  placeholder="Bayanin wannan safari a harshen Hausa..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800 resize-none"
                />
              </div>

              {/* Itinerary Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="font-serif font-bold text-gray-800">Itinerary Builder</h3>
                  <button
                    type="button"
                    onClick={handleAddItineraryDay}
                    className="flex items-center gap-1 text-xs font-bold text-wild-sunset hover:text-wild-sunset/80 transition-colors"
                  >
                    <PlusCircle size={14} />
                    Add Next Day
                  </button>
                </div>

                <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-1">
                  {itinerary.map((dayObj, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2 relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveItineraryDay(index)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Remove Day"
                      >
                        <Trash size={14} />
                      </button>

                      <div className="flex items-center gap-3">
                        <span className="bg-wild-sunset text-white w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold">
                          {dayObj.day}
                        </span>
                        <input
                          type="text"
                          required
                          value={dayObj.title}
                          onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                          placeholder="Day Title English (e.g. Arrival & Evening Drive)"
                          className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-xs bg-white text-gray-800"
                        />
                      </div>

                      <div className="pl-9">
                        <input
                          type="text"
                          value={dayObj.title_ha || ''}
                          onChange={(e) => handleItineraryChange(index, 'title_ha', e.target.value)}
                          placeholder="Day Title Hausa (e.g. Zuwa & Yawo da Yamma)"
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-xs bg-white text-gray-800"
                        />
                      </div>

                      <div className="pl-9 space-y-2">
                        <textarea
                          required
                          value={dayObj.description}
                          onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                          placeholder="Detailed explanation (English)..."
                          rows={2}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-xs bg-white text-gray-800 resize-none"
                        />
                        <textarea
                          value={dayObj.description_ha || ''}
                          onChange={(e) => handleItineraryChange(index, 'description_ha', e.target.value)}
                          placeholder="Detailed explanation (Hausa)..."
                          rows={2}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-xs bg-white text-gray-800 resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 bg-wild-deep-forest hover:bg-opacity-95 text-white rounded-lg font-medium transition-all shadow-sm disabled:opacity-70 text-sm"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {currentSafari ? 'Save Changes' : 'Create Safari'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
