'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, MapPin, Globe, UploadCloud } from 'lucide-react';
import { getMapLocations, createDocument, updateDocument, removeDocument } from '@/lib/firebase/services';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import dynamic from 'next/dynamic';

// Import MapPicker dynamically with SSR disabled to prevent window object reference errors during build time.
const MapPicker = dynamic(() => import('@/components/admin/MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-300">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-wild-sunset" />
        <span className="text-gray-400 text-xs">Loading coordinate picker map...</span>
      </div>
    </div>
  )
});

interface MapLocation {
  id: string;
  title: string;
  category: string;
  type: string;
  lat: number;
  lng: number;
  state: string;
  description: string;
  image: string;
  link: string;
  cta: string;
  title_ha?: string;
  category_ha?: string;
  description_ha?: string;
  cta_ha?: string;
  createdAt?: any;
}

export default function AdminMapLocationsPage() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<MapLocation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [title_ha, setTitleHa] = useState('');
  const [category, setCategory] = useState('Safari Route');
  const [category_ha, setCategoryHa] = useState('');
  const [type, setType] = useState('safari');
  const [lat, setLat] = useState<number | null>(9.082);
  const [lng, setLng] = useState<number | null>(8.675);
  const [stateName, setStateName] = useState('');
  const [description, setDescription] = useState('');
  const [description_ha, setDescriptionHa] = useState('');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('');
  const [cta, setCta] = useState('View Expedition');
  const [cta_ha, setCtaHa] = useState('');

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
      const storageRef = ref(storage, `map_locations/${Date.now()}_${file.name}`);
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
    loadLocations();
  }, []);

  async function loadLocations() {
    setLoading(true);
    try {
      const data = await getMapLocations();
      setLocations(data as MapLocation[]);
    } catch (err) {
      console.error('Failed to load map locations:', err);
    } finally {
      setLoading(false);
    }
  }

  const openAddModal = () => {
    setCurrentLocation(null);
    setTitle('');
    setTitleHa('');
    setCategory('Safari Route');
    setCategoryHa('');
    setType('safari');
    setLat(9.082);
    setLng(8.675);
    setStateName('');
    setDescription('');
    setDescriptionHa('');
    setImage('');
    setLink('');
    setCta('View Expedition');
    setCtaHa('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (loc: MapLocation) => {
    setCurrentLocation(loc);
    setTitle(loc.title || '');
    setTitleHa(loc.title_ha || '');
    setCategory(loc.category || 'Safari Route');
    setCategoryHa(loc.category_ha || '');
    setType(loc.type || 'safari');
    setLat(loc.lat);
    setLng(loc.lng);
    setStateName(loc.state || '');
    setDescription(loc.description || '');
    setDescriptionHa(loc.description_ha || '');
    setImage(loc.image || '');
    setLink(loc.link || '');
    setCta(loc.cta || 'View Expedition');
    setCtaHa(loc.cta_ha || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !type || lat === null || lng === null || !stateName || !image || !link || !cta) {
      setError('Please fill in all fields and select a point on the map.');
      return;
    }

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError('Latitude must be a valid number between -90 and 90.');
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      setError('Longitude must be a valid number between -180 and 180.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      title,
      title_ha,
      category,
      category_ha,
      type,
      lat,
      lng,
      state: stateName,
      description,
      description_ha,
      image,
      link,
      cta,
      cta_ha
    };

    try {
      if (currentLocation) {
        await updateDocument(COLLECTIONS.MAP_LOCATIONS, currentLocation.id, payload);
      } else {
        await createDocument(COLLECTIONS.MAP_LOCATIONS, payload);
      }
      setIsModalOpen(false);
      await loadLocations();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this map location?')) return;

    try {
      await removeDocument(COLLECTIONS.MAP_LOCATIONS, id);
      await loadLocations();
    } catch (err) {
      console.error('Failed to delete map location:', err);
      alert('Failed to delete map location.');
    }
  };

  const handleMapChange = (selectedLat: number, selectedLng: number) => {
    setLat(selectedLat);
    setLng(selectedLng);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Map Locations</h1>
          <p className="text-gray-500 mt-1">Manage interactive markers for the expedition map.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-wild-deep-forest hover:bg-opacity-95 text-white rounded-lg font-medium transition-all shadow-sm w-fit"
        >
          <Plus size={18} />
          Add Location
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-10 h-10 animate-spin text-wild-sunset mb-2" />
          <p className="text-gray-500 font-serif">Loading map locations...</p>
        </div>
      ) : locations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700">No map locations found</h3>
          <p className="text-gray-500 mt-1">Get started by creating your first interactive map point.</p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-wild-sunset hover:bg-opacity-90 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Create Map Location
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Thumbnail & Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">State / Coordinates</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        {loc.image ? (
                          <img
                            src={loc.image}
                            alt={loc.title}
                            className="w-12 h-8 object-cover rounded bg-gray-100"
                          />
                        ) : (
                          <div className="w-12 h-8 bg-gray-100 flex items-center justify-center rounded text-gray-400">
                            <MapPin size={14} />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{loc.title}</p>
                          {loc.title_ha && <p className="text-xs text-wild-sunset italic">{loc.title_ha}</p>}
                          <p className="text-xs text-gray-400 max-w-[200px] truncate">{loc.description}</p>
                          {loc.description_ha && <p className="text-xs text-gray-400 max-w-[200px] truncate italic">{loc.description_ha}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 bg-wild-cream text-wild-brown font-medium rounded text-xs block mb-1 w-max">
                        {loc.category}
                      </span>
                      {loc.category_ha && (
                        <span className="px-2 py-1 bg-orange-50 text-wild-sunset font-medium rounded text-[10px] italic block w-max">
                          {loc.category_ha}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <p className="text-gray-800">{loc.state}</p>
                        <p className="text-xs font-mono text-gray-400">
                          {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        loc.type === 'safari' ? 'bg-orange-100 text-orange-800' :
                        loc.type === 'conservation' ? 'bg-green-100 text-green-800' :
                        loc.type === 'adventure' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {loc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditModal(loc)}
                          className="text-wild-moss hover:text-opacity-80 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(loc.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <header className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-wild-deep-forest text-white">
              <h2 className="text-xl font-serif font-bold">
                {currentLocation ? 'Edit Map Location' : 'Add Map Location'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-wild-cream/80 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Inputs */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Title (EN) *</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wild-sunset"
                        placeholder="e.g. Yankari Warm Springs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Title (HA)</label>
                      <input
                        type="text"
                        value={title_ha}
                        onChange={(e) => setTitleHa(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wild-sunset"
                        placeholder="e.g. Ruwan Zafi na Yankari"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Category (EN) *</label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wild-sunset"
                        placeholder="e.g. Safari Route"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Category (HA)</label>
                      <input
                        type="text"
                        value={category_ha}
                        onChange={(e) => setCategoryHa(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wild-sunset"
                        placeholder="e.g. Hanyar Safari"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Marker Type *</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wild-sunset bg-white text-gray-800"
                        required
                      >
                        <option value="safari">Safari (Orange)</option>
                        <option value="conservation">Conservation (Green)</option>
                        <option value="adventure">Adventure Ground (Brown)</option>
                        <option value="film">Film Location (Charcoal)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">State / Region *</label>
                      <input
                        type="text"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wild-sunset"
                        placeholder="e.g. Bauchi State"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Image URL *</label>
                    <div className="space-y-3">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wild-sunset text-sm"
                        placeholder="https://images.unsplash.com/..."
                        required
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

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Target Link *</label>
                      <input
                        type="text"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wild-sunset"
                        placeholder="e.g. /safaris/yankari-grand-tour"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">CTA Label (EN) *</label>
                      <input
                        type="text"
                        value={cta}
                        onChange={(e) => setCta(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wild-sunset"
                        placeholder="e.g. View Expedition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">CTA Label (HA)</label>
                      <input
                        type="text"
                        value={cta_ha}
                        onChange={(e) => setCtaHa(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wild-sunset"
                        placeholder="e.g. Duba Tafiya"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Description (EN)</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wild-sunset resize-none"
                        placeholder="Enter a brief story card text for this map location..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Description (HA)</label>
                      <textarea
                        value={description_ha}
                        onChange={(e) => setDescriptionHa(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wild-sunset resize-none"
                        placeholder="Hausa translation of description..."
                      />
                    </div>
                  </div>
                </div>

                {/* Map Coordinates Picker */}
                <div className="flex flex-col space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Location Coordinates *</label>
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-600 mb-2 bg-gray-50 p-2 rounded border border-gray-200">
                      <div>Lat: <span className="font-bold text-gray-900">{lat !== null ? lat.toFixed(6) : 'Not set'}</span></div>
                      <div>Lng: <span className="font-bold text-gray-900">{lng !== null ? lng.toFixed(6) : 'Not set'}</span></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <MapPicker lat={lat} lng={lng} onChange={handleMapChange} />
                  </div>
                </div>
              </div>

              <footer className="pt-6 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50/50 -mx-6 -mb-6 p-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 bg-wild-deep-forest hover:bg-opacity-95 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {currentLocation ? 'Save Changes' : 'Create Location'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
