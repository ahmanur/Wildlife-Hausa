'use client';

import React, { useState, useEffect } from 'react';
import { getNewsletterSubscribers, fetchDocument } from '@/lib/firebase/services';
import { Loader2, Mail, Calendar, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  subscribedAt?: { seconds: number; nanoseconds: number } | string | any;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailJSConfig, setEmailJSConfig] = useState<any>(null);

  // Form & status states
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadSubscribers();
    loadEmailConfig();
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

  async function loadEmailConfig() {
    try {
      const data = await fetchDocument<any>('settings', 'global');
      if (data) {
        setEmailJSConfig({
          serviceId: data.emailjs_service_id,
          publicKey: data.emailjs_public_key,
          privateKey: data.emailjs_private_key,
          newsletterTemplateId: data.emailjs_newsletter_template_id
        });
      }
    } catch (err) {
      console.error('Failed to load EmailJS config:', err);
    }
  }

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribers.length === 0) {
      alert('There are no subscribers to send this newsletter to.');
      return;
    }
    if (!emailJSConfig?.serviceId || !emailJSConfig?.newsletterTemplateId || !emailJSConfig?.publicKey) {
      setErrorMsg('EmailJS API credentials are not configured. Please set them up in global Settings first.');
      return;
    }

    setSending(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    let sentCount = 0;
    let failedCount = 0;

    // Send emails sequentially to each subscriber
    for (const sub of subscribers) {
      try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: emailJSConfig.serviceId,
            template_id: emailJSConfig.newsletterTemplateId,
            user_id: emailJSConfig.publicKey,
            ...(emailJSConfig.privateKey ? { get_signature: true, accessToken: emailJSConfig.privateKey } : {}),
            template_params: {
              to_email: sub.email,
              subject: subject,
              message: bodyText
            }
          })
        });

        if (response.ok) {
          sentCount++;
        } else {
          const errTxt = await response.text();
          console.error(`EmailJS delivery failed for ${sub.email}:`, errTxt);
          failedCount++;
        }
      } catch (err) {
        console.error(`Failed to send newsletter to ${sub.email}:`, err);
        failedCount++;
      }
    }

    setSending(false);
    if (failedCount === 0) {
      setSuccessMsg(`Newsletter successfully sent to all ${sentCount} subscribers!`);
      setSubject('');
      setBodyText('');
    } else {
      setSuccessMsg(`Sent successfully to ${sentCount} subscribers.`);
      setErrorMsg(`Failed to deliver to ${failedCount} subscribers. Check your EmailJS plan quota or logs.`);
    }
  };

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

  const isEmailJSConfigured = !!(emailJSConfig?.serviceId && emailJSConfig?.newsletterTemplateId && emailJSConfig?.publicKey);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Newsletter Subscribers</h1>
        <p className="text-gray-500 mt-1">Review active email subscriptions and broadcast newsletters via EmailJS.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Column 1: Subscribers list table */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-serif font-bold text-gray-800">
              Total Subscribers: {subscribers.length}
            </h3>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider bg-wild-sand/30 px-2.5 py-1 rounded">
              Active List
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-[550px]">
            {subscribers.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 sticky top-0">
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

        {/* Column 2: Send Newsletter compose card */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h3 className="font-serif font-bold text-xl text-gray-900 flex items-center gap-2">
              <Send size={18} className="text-wild-sunset" />
              Compose Newsletter
            </h3>
            <p className="text-xs text-gray-500 mt-1">Send a broadcast email updates to all active subscribers.</p>
          </div>

          {!isEmailJSConfigured && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-semibold flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 text-amber-600 mt-0.5" />
              <div>
                EmailJS credentials are not fully configured yet. Go to global Settings &gt; Email Config tab to set it up.
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg text-xs font-semibold flex items-start gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-green-600 mt-0.5" />
              <div>{successMsg}</div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-semibold flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSendNewsletter} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Wildlife Hausa Weekly Digest"
                disabled={!isEmailJSConfigured || sending}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Newsletter Content</label>
              <textarea
                required
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Write your email broadcast content here..."
                disabled={!isEmailJSConfigured || sending}
                rows={10}
                className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-wild-sunset text-sm text-gray-800 font-sans resize-none disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={!isEmailJSConfigured || sending || subscribers.length === 0}
              className="w-full bg-wild-sunset hover:bg-[#FF8C42] disabled:opacity-50 text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
            >
              {sending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending Broadcast...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Broadcast ({subscribers.length} recipients)
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
