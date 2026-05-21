'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, BookOpen, Leaf, HeartHandshake, Award, Users, Shield } from 'lucide-react';
import { getConservationNotes, createDocument, updateDocument, removeDocument } from '@/lib/firebase/services';
import { COLLECTIONS } from '@/lib/firebase/collections';

interface ConservationNote {
  id: string;
  title: string;
  title_ha?: string;
  text: string;
  text_ha?: string;
  icon: string;
  order: number;
}

const AVAILABLE_ICONS = [
  { name: 'Leaf', component: <Leaf size={16} /> },
  { name: 'BookOpen', component: <BookOpen size={16} /> },
  { name: 'HeartHandshake', component: <HeartHandshake size={16} /> },
  { name: 'Award', component: <Award size={16} /> },
  { name: 'Users', component: <Users size={16} /> },
  { name: 'Shield', component: <Shield size={16} /> },
];

export default function AdminConservationPage() {
  const [notes, setNotes] = useState<ConservationNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<ConservationNote | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [title_ha, setTitleHa] = useState('');
  const [text, setText] = useState('');
  const [text_ha, setTextHa] = useState('');
  const [icon, setIcon] = useState('Leaf');
  const [order, setOrder] = useState(1);

  useEffect(() => {
    loadNotes();
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

  const openAddModal = () => {
    setCurrentNote(null);
    setTitle('');
    setTitleHa('');
    setText('');
    setTextHa('');
    setIcon('Leaf');
    setOrder(notes.length + 1);
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
      setError('An error occurred while saving the conservation note.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conservation note?')) return;
    try {
      await removeDocument(COLLECTIONS.CONSERVATION_NOTES, id);
      await loadNotes();
    } catch (err) {
      console.error(err);
      alert('Failed to delete note.');
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-wild-sunset mb-2" />
        <p className="text-gray-500 font-serif">Loading conservation notes...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Conservation Notes</h1>
          <p className="text-gray-500 mt-1">Manage notes displayed on the Conservation Classroom page.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-wild-sunset hover:bg-wild-sunset/90 text-white px-4 py-2.5 rounded-lg transition-colors font-medium text-sm shadow-sm"
        >
          <Plus size={16} />
          <span>Add Note</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4 w-16 text-center">Icon</th>
                <th className="px-6 py-4">Title (English / Hausa)</th>
                <th className="px-6 py-4">Text (English / Hausa)</th>
                <th className="px-6 py-4 w-20">Order</th>
                <th className="px-6 py-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {notes.length > 0 ? (
                notes.map((note) => (
                  <tr key={note.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 mx-auto shadow-sm">
                        {renderIcon(note.icon)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{note.title}</div>
                      {note.title_ha && <div className="text-xs text-wild-sunset font-medium italic mt-0.5">HA: {note.title_ha}</div>}
                    </td>
                    <td className="px-6 py-4 max-w-xs md:max-w-md truncate">
                      <div className="truncate text-gray-600">{note.text}</div>
                      {note.text_ha && <div className="truncate text-xs text-wild-moss italic mt-0.5">HA: {note.text_ha}</div>}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-600">{note.order}</td>
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
                    No notes found. Seed or create some to get started!
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
                {currentNote ? 'Edit Conservation Note' : 'Add New Note'}
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
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Note Title (English) *</label>
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
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Note Title (Hausa)</label>
                <input 
                  type="text" 
                  value={title_ha} 
                  onChange={(e) => setTitleHa(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-wild-sunset text-sm"
                  placeholder="e.g. Kiyaye Muhallin Halitta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Text Content (English) *</label>
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
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Text Content (Hausa)</label>
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
                  <span>Save Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
