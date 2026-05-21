'use client';

import React, { useState, useEffect } from 'react';
import { getBookings, updateBookingStatus } from '@/lib/firebase/services';
import { Loader2, Calendar, Map, CheckCircle, Clock, XCircle, Search, Mail, User } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

interface Booking {
  id: string;
  safariId: string;
  safariTitle: string;
  name: string;
  email: string;
  date: string;
  guests: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Timestamp;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setLoading(true);
    try {
      const data = await getBookings();
      setBookings(data as Booking[]);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: 'pending' | 'confirmed' | 'cancelled') => {
    setActionLoading(id);
    try {
      await updateBookingStatus(id, newStatus);
      // Optimistic update
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    } catch (error) {
      console.error('Failed to update booking status:', error);
      alert('Failed to update booking status');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.safariTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"><CheckCircle size={12}/> Confirmed</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><XCircle size={12}/> Cancelled</span>;
      case 'pending':
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200"><Clock size={12}/> Pending</span>;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-wild-deep-forest mb-2">Safari Bookings</h1>
          <p className="text-gray-500">Manage incoming safari expedition requests.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex flex-col items-center px-4 border-r border-gray-100">
            <span className="text-2xl font-bold text-wild-deep-forest">{bookings.length}</span>
            <span className="text-xs text-gray-500 uppercase font-medium tracking-wider">Total</span>
          </div>
          <div className="flex flex-col items-center px-4 border-r border-gray-100">
            <span className="text-2xl font-bold text-yellow-600">{bookings.filter(b => b.status === 'pending').length}</span>
            <span className="text-xs text-gray-500 uppercase font-medium tracking-wider">Pending</span>
          </div>
          <div className="flex flex-col items-center px-4">
            <span className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === 'confirmed').length}</span>
            <span className="text-xs text-gray-500 uppercase font-medium tracking-wider">Confirmed</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters & Search */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, or safari..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wild-sunset/50"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-wild-sunset/50 flex-1"
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex py-20 items-center justify-center">
              <Loader2 className="w-8 h-8 text-wild-sunset animate-spin" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <Calendar className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No bookings found</p>
              {searchTerm || statusFilter !== 'all' ? (
                <button onClick={() => {setSearchTerm(''); setStatusFilter('all');}} className="text-wild-sunset text-sm mt-2 hover:underline">
                  Clear filters
                </button>
              ) : null}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Explorer Details</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Safari Request</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 flex items-center gap-2"><User size={14} className="text-gray-400"/> {booking.name || 'Unknown'}</span>
                        <span className="text-sm text-gray-500 flex items-center gap-2 mt-1"><Mail size={14} className="text-gray-400"/> {booking.email || 'No email provided'}</span>
                        <span className="text-xs text-gray-400 mt-2">Requested: {formatDate(booking.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-wild-forest flex items-center gap-2"><Map size={14} className="text-wild-sunset"/> {booking.safariTitle || 'Custom Safari'}</span>
                        <span className="text-sm text-gray-600 flex items-center gap-2 mt-1"><Calendar size={14} className="text-gray-400"/> Start: <span className="font-medium">{booking.date}</span></span>
                        <span className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <div className="w-3.5 h-3.5 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-bold">G</div> 
                          {booking.guests}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {actionLoading === booking.id ? (
                        <div className="flex justify-end pr-4"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
                      ) : (
                        <div className="flex flex-col gap-2 items-end">
                          {booking.status !== 'confirmed' && (
                            <button 
                              onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                              className="text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md transition-colors border border-green-200 w-24 text-center"
                            >
                              Confirm
                            </button>
                          )}
                          {booking.status !== 'pending' && (
                            <button 
                              onClick={() => handleStatusUpdate(booking.id, 'pending')}
                              className="text-xs font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 px-3 py-1.5 rounded-md transition-colors border border-yellow-200 w-24 text-center"
                            >
                              Mark Pending
                            </button>
                          )}
                          {booking.status !== 'cancelled' && (
                            <button 
                              onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                              className="text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors border border-red-200 w-24 text-center"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
