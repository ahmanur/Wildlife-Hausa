'use client';

import React, { useState, useEffect } from 'react';
import { getEnquiries, updateDocument } from '@/lib/firebase/services';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { Loader2, Mail, Phone, Calendar, User, Eye, EyeOff } from 'lucide-react';

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  interest: string;
  message: string;
  status?: 'read' | 'unread';
  createdAt?: { seconds: number; nanoseconds: number } | any;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  useEffect(() => {
    loadEnquiries();
  }, []);

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

  const toggleStatus = async (enquiry: Enquiry, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = enquiry.status === 'read' ? 'unread' : 'read';
    try {
      await updateDocument(COLLECTIONS.ENQUIRIES, enquiry.id, { status: newStatus });
      // Update local state
      setEnquiries(prev => prev.map(item => item.id === enquiry.id ? { ...item, status: newStatus } : item));
      if (selectedEnquiry?.id === enquiry.id) {
        setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = async (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    if (enquiry.status !== 'read') {
      try {
        await updateDocument(COLLECTIONS.ENQUIRIES, enquiry.id, { status: 'read' });
        setEnquiries(prev => prev.map(item => item.id === enquiry.id ? { ...item, status: 'read' } : item));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-wild-sunset mb-2" />
        <p className="text-gray-500 font-serif">Loading enquiries...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Visitor Enquiries</h1>
        <p className="text-gray-500 mt-1">Review contact form submissions and booking requests from visitors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enquiries List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[650px]">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h3 className="font-serif font-bold text-gray-800">Inbox ({enquiries.filter(e => e.status !== 'read').length} unread)</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {enquiries.length > 0 ? (
              enquiries.map((enq) => (
                <div 
                  key={enq.id}
                  onClick={() => handleSelect(enq)}
                  className={`p-5 cursor-pointer hover:bg-gray-50/70 transition-colors relative flex flex-col gap-2 ${
                    selectedEnquiry?.id === enq.id ? 'bg-wild-sand/20 border-l-4 border-wild-sunset pl-4' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      enq.interest === 'Safari Booking' ? 'bg-orange-50 text-orange-700 border border-orange-150' :
                      enq.interest === 'Adventure Park' ? 'bg-green-50 text-green-700 border border-green-150' :
                      'bg-gray-50 text-gray-700 border border-gray-150'
                    }`}>
                      {enq.interest}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {formatDate(enq.createdAt).split(',')[0]}
                    </span>
                  </div>

                  <div>
                    <h4 className={`text-sm ${enq.status !== 'read' ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {enq.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{enq.message}</p>
                  </div>

                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => toggleStatus(enq, e)}
                        className="text-gray-400 hover:text-wild-sunset transition-colors"
                        title={enq.status === 'read' ? 'Mark as Unread' : 'Mark as Read'}
                      >
                        {enq.status === 'read' ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>

                    </div>
                    {enq.status !== 'read' && (
                      <span className="w-2 h-2 rounded-full bg-wild-sunset" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-500 font-serif">
                No enquiries received yet.
              </div>
            )}
          </div>
        </div>

        {/* Enquiry Detail Viewer */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[650px] overflow-hidden">
          {selectedEnquiry ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold bg-wild-deep-forest text-wild-cream px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {selectedEnquiry.interest}
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

              <div className="flex-1 p-6 overflow-y-auto bg-gray-50/20">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[250px] leading-relaxed text-gray-800 whitespace-pre-wrap">
                  {selectedEnquiry.message}
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                <a 
                  href={`mailto:${selectedEnquiry.email}?subject=Re: Wild Hausa enquiry - ${selectedEnquiry.interest}`}
                  className="bg-wild-sunset hover:bg-wild-sunset/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400 p-12">
              <Mail size={48} className="stroke-1 mb-4 text-gray-300" />
              <p className="font-serif text-lg text-gray-500">No enquiry selected</p>
              <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">Select an enquiry from the sidebar list on the left to read the full message body.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
