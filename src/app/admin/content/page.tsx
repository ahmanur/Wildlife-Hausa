'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, Star, Film, UploadCloud, Video, Image as ImageIcon } from 'lucide-react';
import { getMediaItems, createDocument, updateDocument, removeDocument } from '@/lib/firebase/services';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { MediaThumbnail } from '@/components/ui/MediaThumbnail';
import { extractVideoFrameBlob, isDirectVideoUrl } from '@/lib/utils/videoThumbnail';

interface MediaItem {
  id: string;
  title: string;
  title_ha?: string;
  category: string;
  category_ha?: string;
  image: string;
  duration: string;
  description: string;
  description_ha?: string;
  featured: boolean;
  videoUrl?: string;
  createdAt?: any;
}

export default function AdminContentPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MediaItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [title_ha, setTitleHa] = useState('');
  const [category, setCategory] = useState('Wildlife');
  const [category_ha, setCategoryHa] = useState('');
  const [image, setImage] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [description_ha, setDescriptionHa] = useState('');
  const [featured, setFeatured] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  // Upload States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [extractingThumb, setExtractingThumb] = useState(false);

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
      const storageRef = ref(storage, `content/thumbnails/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot: any) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageProgress(Math.round(progress));
        },
        (err: any) => {
          console.error("Upload failed", err);
          alert('Failed to upload image. Please check Firebase Storage CORS configuration.');
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

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file (e.g. MP4, WebM, MOV).');
      return;
    }

    setUploadingVideo(true);
    setVideoProgress(0);
    setExtractingThumb(true);

    try {
      // 1. Upload the video file
      const timestamp = Date.now();
      const videoStorageRef = ref(storage, `content/videos/${timestamp}_${file.name}`);
      const videoUploadTask = uploadBytesResumable(videoStorageRef, file);

      videoUploadTask.on(
        'state_changed',
        (snapshot: any) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setVideoProgress(Math.round(progress));
        },
        (err: any) => {
          console.error("Video upload failed", err);
          alert('Failed to upload video. Please check Firebase Storage setup.');
          setUploadingVideo(false);
          setExtractingThumb(false);
        },
        async () => {
          const uploadedVideoUrl = await getDownloadURL(videoUploadTask.snapshot.ref);
          setVideoUrl(uploadedVideoUrl);
          setUploadingVideo(false);

          // 2. Extract frame thumbnail from the uploaded video file
          try {
            const thumbBlob = await extractVideoFrameBlob(file, 1);
            const thumbStorageRef = ref(storage, `content/thumbnails/${timestamp}_thumb.jpg`);
            const thumbUploadTask = uploadBytesResumable(thumbStorageRef, thumbBlob);

            thumbUploadTask.on(
              'state_changed',
              null,
              (err) => {
                console.error("Auto thumbnail upload failed", err);
                setExtractingThumb(false);
              },
              async () => {
                const thumbDownloadUrl = await getDownloadURL(thumbUploadTask.snapshot.ref);
                setImage(thumbDownloadUrl);
                setExtractingThumb(false);
              }
            );
          } catch (thumbErr) {
            console.error("Frame extraction error:", thumbErr);
            setExtractingThumb(false);
          }
        }
      );
    } catch (err) {
      console.error(err);
      setUploadingVideo(false);
      setExtractingThumb(false);
      alert('Failed to initialize video upload.');
    }
  };

  const handleExtractFromUrl = async () => {
    if (!videoUrl || !isDirectVideoUrl(videoUrl)) {
      alert('Please enter a valid direct video URL (e.g., MP4 or Firebase video link).');
      return;
    }
    setExtractingThumb(true);
    try {
      const blob = await extractVideoFrameBlob(videoUrl, 1);
      const storageRef = ref(storage, `content/thumbnails/${Date.now()}_extracted.jpg`);
      const uploadTask = uploadBytesResumable(storageRef, blob);
      uploadTask.on(
        'state_changed',
        null,
        (err) => {
          console.error('Upload extracted thumbnail error', err);
          setExtractingThumb(false);
          alert('Failed to upload extracted thumbnail.');
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setImage(downloadUrl);
          setExtractingThumb(false);
        }
      );
    } catch (err) {
      console.error('Extraction failed', err);
      setExtractingThumb(false);
      alert('Could not extract thumbnail frame from the video URL.');
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    try {
      const data = await getMediaItems();
      setItems(data as MediaItem[]);
    } catch (err) {
      console.error('Failed to load media items:', err);
    } finally {
      setLoading(false);
    }
  }

  const openAddModal = () => {
    setCurrentItem(null);
    setTitle('');
    setTitleHa('');
    setCategory('Wildlife');
    setCategoryHa('');
    setImage('');
    setDuration('');
    setDescription('');
    setDescriptionHa('');
    setFeatured(false);
    setVideoUrl('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: MediaItem) => {
    setCurrentItem(item);
    setTitle(item.title || '');
    setTitleHa(item.title_ha || '');
    setCategory(item.category || 'Wildlife');
    setCategoryHa(item.category_ha || '');
    setImage(item.image || '');
    setDuration(item.duration || '');
    setDescription(item.description || '');
    setDescriptionHa(item.description_ha || '');
    setFeatured(item.featured || false);
    setVideoUrl(item.videoUrl || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !duration) {
      setError('Please fill in all required fields (Title, Duration).');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      title,
      title_ha,
      category,
      category_ha,
      image,
      duration,
      description,
      description_ha,
      featured,
      videoUrl,
    };

    try {
      if (currentItem) {
        await updateDocument(COLLECTIONS.MEDIA_ITEMS, currentItem.id, payload);
      } else {
        await createDocument(COLLECTIONS.MEDIA_ITEMS, payload);
      }
      setIsModalOpen(false);
      await loadItems();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media item?')) return;

    try {
      await removeDocument(COLLECTIONS.MEDIA_ITEMS, id);
      await loadItems();
    } catch (err) {
      console.error('Failed to delete media item:', err);
      alert('Failed to delete item.');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Content & Films</h1>
          <p className="text-gray-500 mt-1">Manage documentaries, field notes, and multimedia assets.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-wild-deep-forest hover:bg-opacity-95 text-white rounded-lg font-medium transition-all shadow-sm w-fit"
        >
          <Plus size={18} />
          Upload Content
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-10 h-10 animate-spin text-wild-sunset mb-2" />
          <p className="text-gray-500 font-serif">Loading media library...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700">No media items found</h3>
          <p className="text-gray-500 mt-1">Get started by creating your first documentary film or field note.</p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-wild-sunset hover:bg-opacity-90 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Create Media Item
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Thumbnail & Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Featured</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded overflow-hidden bg-gray-100 shrink-0 border border-gray-200 relative">
                          <MediaThumbnail
                            image={item.image}
                            videoUrl={item.videoUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{item.title}</p>
                          <p className="text-xs text-gray-400 max-w-[200px] truncate">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 bg-wild-cream text-wild-brown font-medium rounded text-xs">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {item.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.featured ? (
                        <span className="inline-flex items-center gap-1 text-wild-sun-soft bg-yellow-50 px-2 py-0.5 rounded text-xs font-bold border border-yellow-200">
                          <Star size={12} fill="currentColor" />
                          Featured
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-gray-600 hover:text-gray-900 transition-colors p-1"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-serif font-bold text-xl text-gray-900">
                {currentItem ? 'Edit Content Details' : 'Upload New Content'}
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

              {/* Video File Upload */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase font-sans flex items-center gap-1">
                  <Video size={14} className="text-wild-sunset" /> Upload Video File
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 hover:border-wild-sunset rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600">
                    <UploadCloud size={18} />
                    {uploadingVideo ? `Uploading Video (${videoProgress}%)...` : 'Choose Video File (MP4, WebM)'}
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={uploadingVideo}
                      className="hidden"
                    />
                  </label>
                </div>
                {extractingThumb && (
                  <p className="text-xs text-wild-sunset flex items-center gap-1 font-medium mt-1">
                    <Loader2 size={12} className="animate-spin" /> Auto-extracting thumbnail frame from video...
                  </p>
                )}
              </div>

              {/* Video Embed URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase font-sans">Or Video URL (YouTube, Vimeo, MP4 URL)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/... or https://.../video.mp4"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                  {isDirectVideoUrl(videoUrl) && (
                    <button
                      type="button"
                      onClick={handleExtractFromUrl}
                      disabled={extractingThumb}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-700 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Extract Frame
                    </button>
                  )}
                </div>
              </div>

              {/* Video Thumbnail Live Preview */}
              {(videoUrl || image) && (
                <div className="p-3 bg-wild-cream/40 border border-wild-sand/40 rounded-lg flex items-center gap-4">
                  <div className="w-24 h-16 rounded bg-black overflow-hidden shrink-0 relative border border-gray-300">
                    <MediaThumbnail
                      image={image}
                      videoUrl={videoUrl}
                      alt="Auto Video Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-wild-deep-forest uppercase tracking-wider block">
                      Video Thumbnail (Auto-Generated)
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      This video frame will be automatically displayed as the thumbnail across the site.
                    </p>
                  </div>
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
                    placeholder="e.g. Shadows of the Savanna"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase font-sans">Title (Hausa)</label>
                  <input
                    type="text"
                    value={title_ha}
                    onChange={(e) => setTitleHa(e.target.value)}
                    placeholder="e.g. Inwar Dajin Savanna"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
              </div>

              {/* Category & Category HA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase font-sans">Category (English)</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  >
                    <option>Wildlife</option>
                    <option>Conservation</option>
                    <option>Culture</option>
                    <option>Eco-Tourism</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase font-sans">Category (Hausa)</label>
                  <input
                    type="text"
                    value={category_ha}
                    onChange={(e) => setCategoryHa(e.target.value)}
                    placeholder="e.g. Rayuwar Daji"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase font-sans">Duration *</label>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 45 min"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>
              </div>

              {/* Description & Description HA */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase font-sans">Description (English)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a brief summary of the film..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800 resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase font-sans">Description (Hausa)</label>
                <textarea
                  value={description_ha}
                  onChange={(e) => setDescriptionHa(e.target.value)}
                  placeholder="Bayanin bidiyo ko rubutu a harshen Hausa..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-wild-sunset focus:ring-wild-sunset"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Feature this film in the spotlight section
                </label>
              </div>

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
                  disabled={submitting || uploadingVideo || uploadingImage}
                  className="flex items-center gap-2 px-5 py-2 bg-wild-deep-forest hover:bg-opacity-95 text-white rounded-lg font-medium transition-all shadow-sm disabled:opacity-70"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {currentItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

