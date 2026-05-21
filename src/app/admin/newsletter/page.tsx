'use client';

import React, { useState, useEffect } from 'react';
import { getNewsletterSubscribers } from '@/lib/firebase/services';
import { Loader2, Mail, Calendar } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  subscribedAt?: { seconds: number; nanoseconds: number } | string | any;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscribers();
  }, []);

  async function loadSubscribers() {
    setLoading(true);
    try {
      const data = await getNewsletterSubscribers();
      setSubscribers(data as Subscriber[]);
    } catch (err) {
      console.error('Failed to load subscribers:', err);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown Date';
    if (typeof timestamp === 'string') return new Date(timestamp).toLocaleString();
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-wild-sunset mb-2" />
        <p className="text-gray-500 font-serif">Loading subscribers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Newsletter Subscribers</h1>
        <p className="text-gray-500 mt-1">Review all active email subscriptions.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-serif font-bold text-gray-800">
            Total Subscribers: {subscribers.length}
          </h3>
          <div className="text-sm text-gray-500">
            <Mail className="inline-block w-4 h-4 mr-1" />
            Active List
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {subscribers.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Email Address</th>
                  <th className="px-6 py-3">Date Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {sub.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(sub.subscribedAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-gray-500 font-serif">
              No subscribers found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
