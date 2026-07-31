'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, FileText, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { getResources, createResource, updateResource, removeResource } from '@/lib/firebase/services';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface TripResource {
  id: string;
  title: string;
  title_ha?: string;
  description: string;
  description_ha?: string;
  tripDate: string;
  category: string;
  category_ha?: string;
  fileUrl?: string;
  fileName?: string;
  images?: string[];
  accessType?: 'free' | 'paid';
  price?: number;
  createdAt?: any;
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<TripResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState<TripResource | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [title_ha, setTitleHa] = useState('');
  const [category, setCategory] = useState('Reports');
  const [category_ha, setCategoryHa] = useState('');
  const [description, setDescription] = useState('');
  const [description_ha, setDescriptionHa] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [accessType, setAccessType] = useState<'free' | 'paid'>('free');
  const [price, setPrice] = useState<string | number>('');

  // Upload States
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileProgress, setFileProgress] = useState(0);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagesProgress, setImagesProgress] = useState(0);

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    setLoading(true);
    try {
      const data = await getResources();
      setResources(data as TripResource[]);
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setFileProgress(0);

    try {
      const storageRef = ref(storage, `resources/docs/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setFileProgress(Math.round(progress));
        },
        (err) => {
          console.error('File upload failed:', err);
          alert('Failed to upload file.');
          setUploadingFile(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFileUrl(downloadURL);
          setFileName(file.name);
          setUploadingFile(false);
        }
      );
    } catch (err) {
      console.error(err);
      setUploadingFile(false);
      alert('Failed to initialize file upload.');
    }
  };

  const handleMultipleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setImagesProgress(0);

    const uploadedUrls: string[] = [];
    let completedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        const storageRef = ref(storage, `resources/images/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setImagesProgress(Math.round(((completedCount + (progress / 100)) / files.length) * 100));
            },
            (err) => {
              console.error('Image upload error:', err);
              reject(err);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedUrls.push(downloadURL);
              completedCount++;
              resolve();
            }
          );
        });
      } catch (err) {
        console.error(err);
      }
    }

    setImages(prev => [...prev, ...uploadedUrls]);
    setUploadingImages(false);
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const openAddModal = () => {
    setCurrentResource(null);
    setTitle('');
    setTitleHa('');
    setCategory('Reports');
    setCategoryHa('');
    setDescription('');
    setDescriptionHa('');
    setTripDate('');
    setFileUrl('');
    setFileName('');
    setImages([]);
    setAccessType('free');
    setPrice('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (resource: TripResource) => {
    setCurrentResource(resource);
    setTitle(resource.title || '');
    setTitleHa(resource.title_ha || '');
    setCategory(resource.category || 'Reports');
    setCategoryHa(resource.category_ha || '');
    setDescription(resource.description || '');
    setDescriptionHa(resource.description_ha || '');
    setTripDate(resource.tripDate || '');
    setFileUrl(resource.fileUrl || '');
    setFileName(resource.fileName || '');
    setImages(resource.images || []);
    setAccessType(resource.accessType === 'paid' ? 'paid' : 'free');
    setPrice(resource.price !== undefined ? resource.price : '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !tripDate) {
      setError('Title and Trip Date are required.');
      return;
    }

    if (accessType === 'paid' && (!price || Number(price) <= 0)) {
      setError('Please specify a valid price amount for paid resources.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      title,
      title_ha,
      category,
      category_ha,
      description,
      description_ha,
      tripDate,
      fileUrl,
      fileName,
      images,
      accessType,
      price: accessType === 'paid' ? Number(price) || 0 : 0,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (currentResource) {
        await updateResource(currentResource.id, payload);
      } else {
        await createResource({
          ...payload,
          createdAt: new Date().toISOString(),
        });
      }
      setIsModalOpen(false);
      loadResources();
    } catch (err) {
      console.error(err);
      setError('Failed to save resource database entry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this trip resource?')) return;
    try {
      await removeResource(id);
      loadResources();
    } catch (err) {
      console.error('Failed to delete resource:', err);
      alert('Failed to delete resource.');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-wild-deep-forest mb-2">Trip Resources & Field Reports</h1>
          <p className="text-gray-500">Upload reports, documents, and multiple photos of field trip events.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-wild-sunset text-white px-5 py-3 rounded-lg font-medium hover:bg-[#FF8C42] transition-colors shadow-sm cursor-pointer text-sm"
        >
          <Plus size={20} />
          Add Resource
        </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-8 h-8 text-wild-sunset animate-spin" />
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-400 mb-4">No trip resources uploaded yet.</p>
          <button
            onClick={openAddModal}
            className="mt-2 px-4 py-2 bg-wild-sunset hover:bg-opacity-90 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Create First Resource
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Access / Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Files & Photos</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resources.map((res) => (
                  <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      <div>
                        <p className="font-semibold text-gray-800">{res.title}</p>
                        {res.title_ha && <p className="text-xs text-wild-sunset font-mono">{res.title_ha}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {res.tripDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 bg-wild-cream text-wild-brown font-medium rounded text-xs">
                        {res.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {res.accessType === 'paid' ? (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-full text-xs border border-amber-200 inline-flex items-center gap-1">
                          🔒 Paid (₦{Number(res.price || 0).toLocaleString()})
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-green-100 text-green-800 font-bold rounded-full text-xs border border-green-200 inline-flex items-center gap-1">
                          🟢 Free
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col gap-1 text-xs">
                        {res.fileUrl && (
                          <span className="text-blue-600 flex items-center gap-1">
                            <FileText size={12} /> Doc: {res.fileName || 'Report PDF'}
                          </span>
                        )}
                        {res.images && res.images.length > 0 && (
                          <span className="text-green-600 flex items-center gap-1">
                            <ImageIcon size={12} /> {res.images.length} Photos
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditModal(res)}
                          className="text-gray-600 hover:text-gray-900 transition-colors p-1"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(res.id)}
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

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-wild-deep-forest">
                {currentResource ? 'Edit Resource' : 'Create Trip Resource'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              {/* Title Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Yankari Game Reserve Study"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Title (Hausa)</label>
                  <input
                    type="text"
                    value={title_ha}
                    onChange={(e) => setTitleHa(e.target.value)}
                    placeholder="e.g. Ziyara Yankari"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
              </div>

              {/* Date, Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Trip Date *</label>
                  <input
                    type="date"
                    required
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Category (English)</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800 bg-white"
                  >
                    <option value="Reports">Reports</option>
                    <option value="Photos">Photos (Gallery)</option>
                    <option value="Downloads">Downloads</option>
                    <option value="All">All / Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Category (Hausa)</label>
                  <input
                    type="text"
                    value={category_ha}
                    onChange={(e) => setCategoryHa(e.target.value)}
                    placeholder="e.g. Rahotanni"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
              </div>

              {/* Access & Pricing Settings */}
              <div className="space-y-3 p-4 border border-gray-100 rounded-lg bg-gray-50/70">
                <label className="text-xs font-bold text-gray-700 uppercase block">Access & Download Type *</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setAccessType('free')}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      accessType === 'free'
                        ? 'bg-green-600 text-white border-green-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>🟢 Free Access</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccessType('paid')}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      accessType === 'paid'
                        ? 'bg-wild-sunset text-white border-wild-sunset shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>🔒 Purchase Required</span>
                  </button>
                </div>

                {accessType === 'paid' && (
                  <div className="pt-2 space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase">Resource Price (₦ NGN) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">₦</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        required={accessType === 'paid'}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g. 5000"
                        className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800 bg-white font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 italic">
                      Users will be required to make payment of ₦{Number(price || 0).toLocaleString()} before downloading this resource.
                    </p>
                  </div>
                )}
              </div>

              {/* Description Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Description (English)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a brief summary of the field trip resource..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Description (Hausa)</label>
                  <textarea
                    value={description_ha}
                    onChange={(e) => setDescriptionHa(e.target.value)}
                    placeholder="Bayani a harshen Hausa..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
              </div>

              {/* Report Document File Upload */}
              <div className="space-y-2 p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                <label className="text-xs font-bold text-gray-700 uppercase block">Field Report File (PDF / Word)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="File URL"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                  />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 bg-white border border-gray-300 hover:border-wild-sunset text-gray-700 px-3 py-1.5 rounded cursor-pointer transition-colors shadow-sm text-xs font-semibold">
                      <UploadCloud size={14} className="text-wild-sunset" />
                      {uploadingFile ? `Uploading ${fileProgress}%` : 'Upload PDF'}
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" 
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploadingFile}
                      />
                    </label>
                  </div>
                </div>
                {fileName && <p className="text-xs text-gray-500">File Selected: {fileName}</p>}
              </div>

              {/* Image Gallery Uploads */}
              <div className="space-y-2 p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                <label className="text-xs font-bold text-gray-700 uppercase block">Trip Gallery Photos</label>
                <div className="flex items-center gap-4 pb-2">
                  <label className="flex items-center gap-2 bg-white border border-gray-300 hover:border-wild-sunset text-gray-700 px-3 py-1.5 rounded cursor-pointer transition-colors shadow-sm text-xs font-semibold">
                    <UploadCloud size={14} className="text-wild-sunset" />
                    {uploadingImages ? `Uploading ${imagesProgress}%` : 'Upload Gallery Photos'}
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleMultipleImagesUpload}
                      className="hidden"
                      disabled={uploadingImages}
                    />
                  </label>
                </div>

                {/* Display uploaded images list */}
                {images.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-video rounded overflow-hidden border border-gray-200 group">
                        <img src={img} className="object-cover w-full h-full" alt="Uploaded gallery" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save/Cancel Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 bg-wild-deep-forest hover:bg-opacity-95 text-white rounded-lg font-medium transition-all shadow-sm disabled:opacity-70"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {currentResource ? 'Save Changes' : 'Create Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
