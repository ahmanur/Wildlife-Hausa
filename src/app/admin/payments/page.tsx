'use client';

import React, { useState, useEffect } from 'react';
import { 
  getPayments, 
  updatePaymentStatus, 
  removePaymentRecord, 
  fetchDocument 
} from '@/lib/firebase/services';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  FileText, 
  Trash2, 
  Search, 
  Send, 
  ShieldCheck, 
  DollarSign, 
  ExternalLink,
  Download,
  X
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  resourceId: string;
  resourceTitle: string;
  payerName: string;
  payerEmail: string;
  currency: 'NGN' | 'USD';
  amount: number;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod?: string;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [receiptModalUrl, setReceiptModalUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    setLoading(true);
    try {
      const data = await getPayments();
      setPayments(data as PaymentRecord[]);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprove = async (payment: PaymentRecord) => {
    if (!confirm(`Approve payment of ${payment.currency === 'USD' ? '$' : '₦'}${payment.amount.toLocaleString()} from ${payment.payerName}?`)) return;

    setActionLoadingId(payment.id);
    try {
      const generatedToken = 'WH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      await updatePaymentStatus(payment.id, 'approved', undefined, generatedToken);

      // Attempt sending email via EmailJS or endpoint
      try {
        const emailConfig = await fetchDocument<any>('settings', 'global');
        const serviceId = emailConfig?.emailjs_service_id || 'service_q9frjor';
        const publicKey = emailConfig?.emailjs_public_key || 'BmkB8_vOUBQyrfu7j';
        const templateId = emailConfig?.emailjs_reply_template_id || 'template_pjgylzh';

        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: serviceId,
            user_id: publicKey,
            template_id: templateId,
            template_params: {
              to_email: payment.payerEmail,
              to_name: payment.payerName,
              resource_title: payment.resourceTitle,
              subject: `Payment Approved: Access Unlocked for ${payment.resourceTitle}`,
              message: `Dear ${payment.payerName},\n\nYour bank transfer payment of ${payment.currency === 'USD' ? '$' : '₦'}${payment.amount.toLocaleString()} for "${payment.resourceTitle}" has been verified and APPROVED by our admin team.\n\nYour UNIQUE ACCESS TOKEN is: ${generatedToken}\n\nPlease enter this token along with your email on the Resources page to unlock your files and view the gallery.\n\nThank you for supporting Wild Hausa Expeditions & Conservation.`
            }
          })
        });
      } catch (emailErr) {
        console.warn('Email dispatch warning:', emailErr);
      }

      showToast(`Payment Approved! Token: ${generatedToken} generated & sent to ${payment.payerEmail}`);
      await loadPayments();
    } catch (err) {
      console.error('Failed to approve payment:', err);
      alert('Error updating payment status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoadingId(id);
    try {
      await updatePaymentStatus(id, 'rejected', rejectionReason || 'Bank transfer receipt could not be verified.');
      showToast('Payment marked as Rejected.');
      setRejectingId(null);
      setRejectionReason('');
      await loadPayments();
    } catch (err) {
      console.error('Failed to reject payment:', err);
      alert('Error updating payment status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return;
    try {
      await removePaymentRecord(id);
      showToast('Payment record removed.');
      await loadPayments();
    } catch (err) {
      console.error('Failed to delete payment record:', err);
    }
  };

  // Filter payments
  const filteredPayments = payments.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const nameMatch = p.payerName?.toLowerCase().includes(q);
      const emailMatch = p.payerEmail?.toLowerCase().includes(q);
      const titleMatch = p.resourceTitle?.toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !titleMatch) return false;
    }
    return true;
  });

  // Calculate statistics
  const totalCount = payments.length;
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const approvedCount = payments.filter(p => p.status === 'approved').length;
  const totalApprovedNGN = payments
    .filter(p => p.status === 'approved' && (p.currency === 'NGN' || !p.currency))
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalApprovedUSD = payments
    .filter(p => p.status === 'approved' && p.currency === 'USD')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100000] bg-wild-deep-forest text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-wild-sunset/30 animate-bounce">
          <ShieldCheck className="text-wild-sunset w-5 h-5" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-wild-deep-forest mb-1">
            Payment Verification & Approvals
          </h1>
          <p className="text-gray-500 text-sm">
            Review uploaded bank transfer receipts, verify payments, and grant resource access to users.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Total Submissions</p>
            <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-amber-600 font-bold uppercase">Pending Verification</p>
            <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-green-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center font-bold">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-green-600 font-bold uppercase">Approved Payments</p>
            <p className="text-2xl font-bold text-green-700">{approvedCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-wild-cream text-wild-sunset flex items-center justify-center font-bold">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Verified Revenue</p>
            <p className="text-lg font-bold text-gray-900 font-mono">
              ₦{totalApprovedNGN.toLocaleString()}
            </p>
            {totalApprovedUSD > 0 && (
              <p className="text-xs font-bold text-green-600 font-mono">+ ${totalApprovedUSD.toLocaleString()} USD</p>
            )}
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-wild-deep-forest text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Submissions ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'approved'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'rejected'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rejected ({payments.filter(p => p.status === 'rejected').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by payer, email, resource..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-wild-sunset focus:bg-white text-gray-800"
          />
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <Loader2 className="w-8 h-8 text-wild-sunset animate-spin" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No payment verification requests found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Payer Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Resource Item</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount Paid</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Receipt</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Payer Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{p.payerName}</p>
                        <p className="text-xs text-gray-500 font-mono">{p.payerEmail}</p>
                      </div>
                    </td>

                    {/* Resource Title */}
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-semibold text-gray-800 text-sm truncate">{p.resourceTitle}</p>
                      <span className="text-[10px] text-gray-400 font-mono">ID: {p.resourceId}</span>
                    </td>

                    {/* Amount & Currency */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-sm text-gray-900">
                        {p.currency === 'USD' ? '$' : '₦'}{Number(p.amount || 0).toLocaleString()} {p.currency || 'NGN'}
                      </span>
                      <p className="text-[10px] text-gray-400">{p.paymentMethod || 'Bank Transfer'}</p>
                    </td>

                    {/* Receipt Preview Button */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {p.receiptUrl ? (
                        <button
                          onClick={() => setReceiptModalUrl(p.receiptUrl || null)}
                          className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Eye size={14} />
                          <span>View Receipt</span>
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No receipt attached</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {p.status === 'approved' ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 font-bold rounded-full text-xs border border-green-200 inline-flex items-center gap-1">
                          <CheckCircle size={12} /> Approved
                        </span>
                      ) : p.status === 'rejected' ? (
                        <span className="px-3 py-1 bg-red-100 text-red-800 font-bold rounded-full text-xs border border-red-200 inline-flex items-center gap-1">
                          <XCircle size={12} /> Rejected
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-full text-xs border border-amber-200 inline-flex items-center gap-1 animate-pulse">
                          <Clock size={12} /> Pending Review
                        </span>
                      )}
                    </td>

                    {/* Submitted Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                        {p.status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(p)}
                            disabled={actionLoadingId === p.id}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-1"
                            title="Approve Payment & Send Email Access"
                          >
                            {actionLoadingId === p.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <>
                                <CheckCircle size={14} />
                                <span>Approve</span>
                              </>
                            )}
                          </button>
                        )}

                        {p.status === 'pending' && (
                          <button
                            onClick={() => setRejectingId(p.id)}
                            className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="Reject Payment"
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          title="Delete Record"
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

      {/* Receipt Preview Lightbox Modal */}
      {receiptModalUrl && (
        <div 
          onClick={() => setReceiptModalUrl(null)}
          className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <FileText size={18} className="text-wild-sunset" /> Payment Receipt Document
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={receiptModalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-wild-sunset text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-[#FF8C42] transition-colors"
                >
                  <ExternalLink size={14} /> Open Full Size
                </a>
                <button
                  onClick={() => setReceiptModalUrl(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-100 flex items-center justify-center">
              {receiptModalUrl.toLowerCase().includes('.pdf') ? (
                <iframe src={receiptModalUrl} className="w-full h-[70vh] border-0 rounded-lg bg-white" />
              ) : (
                <img src={receiptModalUrl} alt="Bank Transfer Receipt" className="max-w-full max-h-[75vh] object-contain rounded-lg shadow" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Payment Reason Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Reject Payment Request</h3>
            <p className="text-xs text-gray-500">
              Provide a reason for rejecting this payment submission (e.g. invalid receipt, amount mismatch):
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Could not confirm transaction with Zenith Bank."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500 text-gray-800"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectingId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
