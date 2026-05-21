'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, Activity } from 'lucide-react';
import { getAdventureActivities, createDocument, updateDocument, removeDocument } from '@/lib/firebase/services';
import { COLLECTIONS } from '@/lib/firebase/collections';

interface AdventureActivity {
  id: string;
  title: string;
  title_ha?: string;
  text: string;
  text_ha?: string;
  image: string;
  order: number;
}

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<AdventureActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<AdventureActivity | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [title_ha, setTitleHa] = useState('');
  const [text, setText] = useState('');
  const [text_ha, setTextHa] = useState('');
  const [image, setImage] = useState('');
  const [order, setOrder] = useState(1);

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    setLoading(true);
    try {
      const data = await getAdventureActivities();
      setActivities(data as AdventureActivity[]);
    } catch (err) {
      console.error('Failed to load adventure activities:', err);
    } finally {
      setLoading(false);
    }
  }

  const openAddModal = () => {
    setCurrentActivity(null);
    setTitle('');
    setTitleHa('');
    setText('');
    setTextHa('');
    setImage('');
    setOrder(activities.length + 1);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (activity: AdventureActivity) => {
    setCurrentActivity(activity);
    setTitle(activity.title || '');
    setTitleHa(activity.title_ha || '');
    setText(activity.text || '');
    setTextHa(activity.text_ha || '');
    setImage(activity.image || '');
    setOrder(activity.order || 1);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !text || !image) {
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
      image,
      order: Number(order) || 1,
    };

    try {
      if (currentActivity) {
        await updateDocument(COLLECTIONS.ADVENTURE_ACTIVITIES, currentActivity.id, payload);
      } else {
        await createDocument(COLLECTIONS.ADVENTURE_ACTIVITIES, payload);
      }
      setIsModalOpen(false);
      await loadActivities();
    } catch (err) {
      console.error(err);
      setError('An error occurred while saving the activity.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    try {
      await removeDocument(COLLECTIONS.ADVENTURE_ACTIVITIES, id);
      await loadActivities();
    } catch (err) {
      console.error(err);
      alert('Failed to delete activity.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-wild-sunset mb-2" />
        <p className="text-gray-500 font-serif">Loading activities...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Adventure Activities</h1>
          <p className="text-gray-500 mt-1">Manage activities displayed on the Adventure Park page.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-wild-sunset hover:bg-wild-sunset/90 text-white px-4 py-2.5 rounded-lg transition-colors font-medium text-sm shadow-sm"
        >
          <Plus size={16} />
          <span>Add Activity</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Title (English / Hausa)</th>
                <th className="px-6 py-4">Description (English / Hausa)</th>
                <th className="px-6 py-4 w-20">Order</th>
                <th className="px-6 py-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {activities.length > 0 ? (
                activities.map((act) => (
                  <tr key={act.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      {act.image ? (
                        <img src={act.image} alt={act.title} className="w-16 h-10 object-cover rounded-lg border border-gray-100 shadow-sm" />
                      ) : (
                        <div className="w-16 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          <Activity size={16} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{act.title}</div>
                      {act.title_ha && <div className="text-xs text-wild-sunset font-medium italic mt-0.5">HA: {act.title_ha}</div>}
                    </td>
                    <td className="px-6 py-4 max-w-xs md:max-w-md truncate">
                      <div className="truncate text-gray-600">{act.text}</div>
                      {act.text_ha && <div className="truncate text-xs text-wild-moss italic mt-0.5">HA: {act.text_ha}</div>}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-600">{act.order}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(act)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(act.id)}
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
                    No activities found. Seed or create some to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl border border-gray-100">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-gray-900">
                {currentActivity ? 'Edit Activity' : 'Add New Activity'}
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
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Activity Title (English) *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-wild-sunset text-sm"
                  placeholder="e.g. Nature Trails"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 font-medium">Activity Title (Hausa)</label>
                <input 
                  type="text" 
                  value={title_ha} 
                  onChange={(e) => setTitleHa(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-wild-sunset text-sm"
                  placeholder="e.g. Hanyoyin Yawo a Halitta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Description (English) *</label>
                <textarea 
                  rows={3}
                  value={text} 
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-wild-sunset text-sm resize-none"
                  placeholder="Guided walking routes ranging from easy strolls to challenging hikes."
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
                  placeholder="Hanyoyin yawo da guides ke jagoranta, tun daga masu sauki..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Image URL *</label>
                  <input 
                    type="url" 
                    value={image} 
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-wild-sunset text-sm"
                    placeholder="https://images.unsplash.com/..."
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
                  <span>Save Activity</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
