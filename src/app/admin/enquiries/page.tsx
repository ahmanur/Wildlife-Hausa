'use client';

import React, { useState, useEffect } from 'react';
import { getEnquiries, updateDocument, createDocument, removeDocument, fetchDocument } from '@/lib/firebase/services';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { 
  Loader2, Mail, Phone, Calendar, User, Eye, EyeOff, 
  Trash2, Send, FileText, Reply, RotateCcw, Plus, AlertCircle 
} from 'lucide-react';

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  interest: string;
  message: string;
  status?: 'read' | 'unread';
  folder?: 'inbox' | 'sent' | 'draft' | 'trash';
  subject?: string;
  createdAt?: { seconds: number; nanoseconds: number } | any;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'drafts' | 'trash'>('inbox');
  const [composeMode, setComposeMode] = useState<'view' | 'new' | 'reply' | 'edit-draft'>('view');
  
  // Email Composer Form state
  const [toAddress, setToAddress] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [emailJSConfig, setEmailJSConfig] = useState<any>(null);

  useEffect(() => {
    loadEnquiries();
    loadEmailConfig();
  }, []);

  async function loadEmailConfig() {
    try {
      const data = await fetchDocument<any>('settings', 'global');
      if (data) {
        setEmailJSConfig({
          serviceId: data.emailjs_service_id,
          publicKey: data.emailjs_public_key,
          replyTemplateId: data.emailjs_reply_template_id
        });
      }
    } catch (err) {
      console.error('Failed to load EmailJS config:', err);
    }
  }

  async function loadEnquiries() {
    setLoading(true);
    try {
      const data = await getEnquiries();
      setEnquiries(data as Enquiry[]);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setLoading(false);
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSelect = async (enquiry: Enquiry) => {
    // If selecting a draft, open in draft edit mode immediately
    if (enquiry.folder === 'draft') {
      setEditingDraftId(enquiry.id);
      setToAddress(enquiry.email || '');
      setSubject(enquiry.subject || '');
      setBodyText(enquiry.message || '');
      setComposeMode('edit-draft');
      setSelectedEnquiry(enquiry);
      return;
    }

    setComposeMode('view');
    setSelectedEnquiry(enquiry);
    if (enquiry.status !== 'read' && (enquiry.folder === 'inbox' || !enquiry.folder)) {
      try {
        await updateDocument(COLLECTIONS.ENQUIRIES, enquiry.id, { status: 'read' });
        setEnquiries(prev => prev.map(item => item.id === enquiry.id ? { ...item, status: 'read' } : item));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Folder actions
  const moveToTrash = async (enquiry: Enquiry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActionLoading(true);
    try {
      await updateDocument(COLLECTIONS.ENQUIRIES, enquiry.id, { folder: 'trash' });
      setEnquiries(prev => prev.map(item => item.id === enquiry.id ? { ...item, folder: 'trash' } : item));
      showToast('Message moved to Trash');
      if (selectedEnquiry?.id === enquiry.id) {
        setSelectedEnquiry(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const restoreFromTrash = async (enquiry: Enquiry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActionLoading(true);
    // Guess correct folder to restore to
    let restoreFolder: 'inbox' | 'sent' | 'draft' = 'inbox';
    if (enquiry.name === 'Draft') restoreFolder = 'draft';
    if (enquiry.name === 'Sent Reply') restoreFolder = 'sent';

    try {
      await updateDocument(COLLECTIONS.ENQUIRIES, enquiry.id, { folder: restoreFolder });
      setEnquiries(prev => prev.map(item => item.id === enquiry.id ? { ...item, folder: restoreFolder } : item));
      showToast(`Message restored to ${restoreFolder === 'draft' ? 'Drafts' : restoreFolder === 'sent' ? 'Sent' : 'Inbox'}`);
      if (selectedEnquiry?.id === enquiry.id) {
        setSelectedEnquiry(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const deletePermanently = async (enquiry: Enquiry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to permanently delete this message? This action cannot be undone.')) return;
    setActionLoading(true);
    try {
      await removeDocument(COLLECTIONS.ENQUIRIES, enquiry.id);
      setEnquiries(prev => prev.filter(item => item.id !== enquiry.id));
      showToast('Message permanently deleted');
      if (selectedEnquiry?.id === enquiry.id) {
        setSelectedEnquiry(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatus = async (enquiry: Enquiry, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = enquiry.status === 'read' ? 'unread' : 'read';
    try {
      await updateDocument(COLLECTIONS.ENQUIRIES, enquiry.id, { status: newStatus });
      setEnquiries(prev => prev.map(item => item.id === enquiry.id ? { ...item, status: newStatus } : item));
      if (selectedEnquiry?.id === enquiry.id) {
        setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Composer triggers
  const startCompose = () => {
    setEditingDraftId(null);
    setToAddress('');
    setSubject('');
    setBodyText('');
    setComposeMode('new');
    setSelectedEnquiry(null);
  };

  const startReply = () => {
    if (!selectedEnquiry) return;
    setEditingDraftId(null);
    setToAddress(selectedEnquiry.email);
    setSubject(`Re: ${selectedEnquiry.subject || selectedEnquiry.interest || 'Wild Hausa enquiry'}`);
    setBodyText(`\n\n--- On ${formatDate(selectedEnquiry.createdAt)}, ${selectedEnquiry.name} wrote:\n> ${selectedEnquiry.message}`);
    setComposeMode('reply');
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toAddress || !subject || !bodyText) return;
    setActionLoading(true);
    try {
      // 1. Try sending via EmailJS if configured
      let deliverySuccessful = true;
      if (emailJSConfig?.serviceId && emailJSConfig?.replyTemplateId && emailJSConfig?.publicKey) {
        try {
          const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service_id: emailJSConfig.serviceId,
              template_id: emailJSConfig.replyTemplateId,
              user_id: emailJSConfig.publicKey,
              template_params: {
                to_email: toAddress,
                subject: subject,
                message: bodyText,
                to_name: selectedEnquiry ? selectedEnquiry.name : 'Explorer'
              }
            })
          });
          if (!response.ok) {
            const errText = await response.text();
            console.error('EmailJS sending failed:', errText);
            deliverySuccessful = false;
          }
        } catch (mailErr) {
          console.error('EmailJS network error:', mailErr);
          deliverySuccessful = false;
        }
      }

      // 2. Save email to Firestore Sent folder
      const emailPayload = {
        name: 'Sent Reply',
        email: toAddress,
        interest: 'Sent Email',
        subject: subject,
        message: bodyText,
        folder: 'sent',
        status: 'read'
      };

      if (composeMode === 'edit-draft' && editingDraftId) {
        // Update existing draft to be sent
        await updateDocument(COLLECTIONS.ENQUIRIES, editingDraftId, emailPayload);
      } else {
        // Create new sent document
        await createDocument(COLLECTIONS.ENQUIRIES, emailPayload);
      }
      
      if (emailJSConfig?.serviceId && emailJSConfig?.replyTemplateId && emailJSConfig?.publicKey) {
        showToast(deliverySuccessful ? 'Email delivered successfully!' : 'Saved to Sent, but delivery failed. Check API Config.');
      } else {
        showToast('Email saved to Sent folder (EmailJS not configured)');
      }
      
      setComposeMode('view');
      setSelectedEnquiry(null);
      await loadEnquiries();
    } catch (err) {
      console.error(err);
      alert('Failed to process sent email.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!toAddress && !subject && !bodyText) return;
    setActionLoading(true);
    try {
      const draftPayload = {
        name: 'Draft',
        email: toAddress,
        interest: 'Draft Email',
        subject: subject || 'No Subject',
        message: bodyText,
        folder: 'draft',
        status: 'read'
      };

      if (editingDraftId) {
        // Update existing draft
        await updateDocument(COLLECTIONS.ENQUIRIES, editingDraftId, draftPayload);
        showToast('Draft updated successfully');
      } else {
        // Create new draft
        await createDocument(COLLECTIONS.ENQUIRIES, draftPayload);
        showToast('Draft saved successfully');
      }
      
      setComposeMode('view');
      setSelectedEnquiry(null);
      await loadEnquiries();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleString();
  };

  // Folder grouping logic
  const getFolderFilteredItems = () => {
    return enquiries.filter(item => {
      const f = item.folder || 'inbox';
      if (activeFolder === 'inbox') return f === 'inbox';
      if (activeFolder === 'sent') return f === 'sent';
      if (activeFolder === 'drafts') return f === 'draft';
      if (activeFolder === 'trash') return f === 'trash';
      return false;
    });
  };

  const activeItems = getFolderFilteredItems();
  const unreadInboxCount = enquiries.filter(e => (e.folder || 'inbox') === 'inbox' && e.status !== 'read').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 animate-spin text-wild-sunset mb-2" />
        <p className="text-gray-500 font-serif">Loading enquiries portal...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[50000] bg-gray-900 text-white px-5 py-3 rounded-lg shadow-xl text-sm font-semibold flex items-center gap-2 animate-fade-in">
          <AlertCircle size={16} className="text-wild-sunset" />
          {toastMessage}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Visitor Enquiries</h1>
        <p className="text-gray-500 mt-1">Manage, draft, reply, and organize incoming contact submissions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Column 1: Mailbox Sidebar Navigation */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <button 
            onClick={startCompose}
            className="w-full bg-wild-sunset hover:bg-[#FF8C42] text-white py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md group cursor-pointer"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform" />
            Compose
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 space-y-1">
            <button 
              onClick={() => { setActiveFolder('inbox'); setComposeMode('view'); setSelectedEnquiry(null); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors ${
                activeFolder === 'inbox' ? 'bg-wild-sand/35 text-wild-forest' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Mail size={16} className={activeFolder === 'inbox' ? 'text-wild-sunset' : 'text-gray-400'} />
                Inbox
              </div>
              {unreadInboxCount > 0 && (
                <span className="bg-wild-sunset text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {unreadInboxCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => { setActiveFolder('sent'); setComposeMode('view'); setSelectedEnquiry(null); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors ${
                activeFolder === 'sent' ? 'bg-wild-sand/35 text-wild-forest' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Send size={16} className={activeFolder === 'sent' ? 'text-wild-sunset' : 'text-gray-400'} />
                Sent
              </div>
            </button>

            <button 
              onClick={() => { setActiveFolder('drafts'); setComposeMode('view'); setSelectedEnquiry(null); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors ${
                activeFolder === 'drafts' ? 'bg-wild-sand/35 text-wild-forest' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText size={16} className={activeFolder === 'drafts' ? 'text-wild-sunset' : 'text-gray-400'} />
                Drafts
              </div>
            </button>

            <button 
              onClick={() => { setActiveFolder('trash'); setComposeMode('view'); setSelectedEnquiry(null); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors ${
                activeFolder === 'trash' ? 'bg-wild-sand/35 text-wild-forest' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Trash2 size={16} className={activeFolder === 'trash' ? 'text-wild-sunset' : 'text-gray-400'} />
                Trash
              </div>
            </button>
          </div>
        </div>

        {/* Column 2: Selected Folder Items List */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[650px]">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h3 className="font-serif font-bold text-gray-800 capitalize">
              {activeFolder} ({activeItems.length})
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {activeItems.length > 0 ? (
              activeItems.map((enq) => (
                <div 
                  key={enq.id}
                  onClick={() => handleSelect(enq)}
                  className={`p-5 cursor-pointer hover:bg-gray-50/70 transition-all relative flex flex-col gap-2 ${
                    selectedEnquiry?.id === enq.id ? 'bg-wild-sand/20 border-l-4 border-wild-sunset pl-4' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      enq.interest === 'Safari Booking' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                      enq.interest === 'Adventure Park' ? 'bg-green-50 text-green-700 border border-green-100' :
                      'bg-gray-50 text-gray-700 border border-gray-100'
                    }`}>
                      {enq.interest || (enq.folder === 'draft' ? 'Draft' : 'Sent Email')}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {formatDate(enq.createdAt).split(',')[0]}
                    </span>
                  </div>

                  <div>
                    <h4 className={`text-sm ${enq.status !== 'read' && activeFolder === 'inbox' ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {enq.name === 'Draft' ? 'Draft' : enq.name === 'Sent Reply' ? `To: ${enq.email}` : enq.name}
                    </h4>
                    {enq.subject && (
                      <p className="text-xs font-semibold text-gray-600 truncate">{enq.subject}</p>
                    )}
                    <p className="text-xs text-gray-500 truncate mt-0.5">{enq.message}</p>
                  </div>

                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                    <div className="flex gap-3">
                      {activeFolder === 'inbox' && (
                        <button 
                          onClick={(e) => toggleStatus(enq, e)}
                          className="text-gray-400 hover:text-wild-sunset transition-colors"
                          title={enq.status === 'read' ? 'Mark as Unread' : 'Mark as Read'}
                        >
                          {enq.status === 'read' ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}

                      {activeFolder !== 'trash' ? (
                        <button 
                          onClick={(e) => moveToTrash(enq, e)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Move to Trash"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={(e) => restoreFromTrash(enq, e)}
                            className="text-gray-400 hover:text-green-600 transition-colors"
                            title="Restore Message"
                          >
                            <RotateCcw size={14} />
                          </button>
                          <button 
                            onClick={(e) => deletePermanently(enq, e)}
                            className="text-gray-400 hover:text-red-700 transition-colors"
                            title="Delete Permanently"
                          >
                            <Trash2 size={14} className="text-red-700" />
                          </button>
                        </>
                      )}
                    </div>
                    {enq.status !== 'read' && activeFolder === 'inbox' && (
                      <span className="w-2 h-2 rounded-full bg-wild-sunset" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-500 font-serif">
                No items in {activeFolder}.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Mail Detail Viewer or Mail Composer Editor */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[650px] overflow-hidden">
          {composeMode !== 'view' ? (
            /* Mail Composer / Editor Panel */
            <form onSubmit={handleSendEmail} className="flex flex-col h-full p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h3 className="font-serif font-bold text-xl text-gray-900">
                  {composeMode === 'reply' ? 'Reply to Enquiry' : composeMode === 'edit-draft' ? 'Edit Draft' : 'Compose Message'}
                </h3>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={handleSaveDraft}
                    disabled={actionLoading}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Save Draft
                  </button>
                  <button 
                    type="submit" 
                    disabled={actionLoading}
                    className="bg-wild-sunset hover:bg-[#FF8C42] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Send
                  </button>
                </div>
              </div>

              <div className="space-y-3 flex-1 flex flex-col">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">To</label>
                  <input 
                    type="email"
                    required
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    placeholder="recipient@example.com"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                  <input 
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Re: Safari Booking Enquiry"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800"
                  />
                </div>

                <div className="flex-1 flex flex-col min-h-[300px]">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message Body</label>
                  <textarea 
                    required
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    placeholder="Write your email here..."
                    className="w-full flex-1 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800 font-sans resize-none"
                  />
                </div>
              </div>
            </form>
          ) : selectedEnquiry ? (
            /* Mail Viewer Panel */
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold bg-wild-deep-forest text-wild-cream px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {selectedEnquiry.interest || (selectedEnquiry.folder === 'draft' ? 'Draft' : 'Sent Email')}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      selectedEnquiry.status === 'read' ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-850'
                    }`}>
                      {selectedEnquiry.status === 'read' ? 'Read' : 'Unread'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold font-serif text-gray-900 flex items-center gap-2">
                    <User size={18} className="text-wild-sunset" />
                    {selectedEnquiry.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {(selectedEnquiry.folder || 'inbox') === 'inbox' && (
                    <button 
                      onClick={startReply}
                      className="bg-wild-sunset hover:bg-[#FF8C42] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                    >
                      <Reply size={14} />
                      Reply
                    </button>
                  )}
                  {activeFolder !== 'trash' ? (
                    <button 
                      onClick={(e) => moveToTrash(selectedEnquiry, e)}
                      className="border border-red-200 hover:bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={(e) => restoreFromTrash(selectedEnquiry, e)}
                        className="border border-green-200 hover:bg-green-50 text-green-600 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw size={14} />
                        Restore
                      </button>
                      <button 
                        onClick={(e) => deletePermanently(selectedEnquiry, e)}
                        className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                        Delete Permanently
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <a href={`mailto:${selectedEnquiry.email}`} className="hover:underline font-medium text-wild-sunset">{selectedEnquiry.email}</a>
                </div>
                {selectedEnquiry.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <a href={`tel:${selectedEnquiry.phone}`} className="hover:underline font-medium">{selectedEnquiry.phone}</a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span>Received: {formatDate(selectedEnquiry.createdAt)}</span>
                </div>
              </div>

              {selectedEnquiry.subject && (
                <div className="px-6 py-3 bg-wild-sand/15 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">Subject:</span>
                  <span className="text-sm font-semibold text-gray-800">{selectedEnquiry.subject}</span>
                </div>
              )}

              <div className="flex-1 p-6 overflow-y-auto bg-gray-50/20">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[250px] leading-relaxed text-gray-800 whitespace-pre-wrap font-sans">
                  {selectedEnquiry.message}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400 p-12">
              <Mail size={48} className="stroke-1 mb-4 text-gray-300" />
              <p className="font-serif text-lg text-gray-500">No message selected</p>
              <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">Select an item from the folder list to read the full content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
