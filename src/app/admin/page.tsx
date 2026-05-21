'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Compass, 
  Users, 
  Map as MapIcon, 
  Image as ImageIcon, 
  Loader2,
  Activity as ActivityIcon,
  BookOpen,
  Calendar,
  Mail
} from 'lucide-react';
import { 
  getSafariPackages, 
  getMapLocations, 
  getMediaItems, 
  getEnquiries,
  getAdventureActivities,
  getConservationNotes,
  getBookings,
  getNewsletterSubscribers
} from '@/lib/firebase/services';

interface Activity {
  action: string;
  item: string;
  time: string;
  timestamp: number;
  type: 'CMS' | 'Workflow';
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    // CMS Counts
    safaris: 0,
    locations: 0,
    media: 0,
    activities: 0,
    notes: 0,
    // Operations & Workflows Counts
    bookings: 0,
    enquiries: 0,
    newsletter: 0,
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [
          safaris, 
          locations, 
          media, 
          enquiries,
          activitiesList,
          notesList,
          bookingsList,
          newsletterList
        ] = await Promise.all([
          getSafariPackages(),
          getMapLocations(),
          getMediaItems(),
          getEnquiries(),
          getAdventureActivities(),
          getConservationNotes(),
          getBookings(),
          getNewsletterSubscribers()
        ]);

        setStats({
          safaris: safaris.length,
          locations: locations.length,
          media: media.length,
          activities: activitiesList.length,
          notes: notesList.length,
          bookings: bookingsList.length,
          enquiries: enquiries.length,
          newsletter: newsletterList.length,
        });

        // Construct dynamic recent activities
        const activities: Activity[] = [];

        if (safaris.length > 0) {
          const latest = safaris[0]; // ordered desc
          activities.push({
            action: 'Safari Package Updated',
            item: latest.title || latest.name || 'Safari',
            time: 'Latest Package',
            timestamp: latest.createdAt?.seconds || Date.now(),
            type: 'CMS'
          });
        }

        if (locations.length > 0) {
          const latest = locations[0];
          activities.push({
            action: 'Map Location Configured',
            item: latest.name || 'Location',
            time: 'Active Point',
            timestamp: latest.createdAt?.seconds || Date.now(),
            type: 'CMS'
          });
        }

        if (enquiries.length > 0) {
          const latest = enquiries[0]; // ordered desc
          activities.push({
            action: 'New Enquiry Received',
            item: `${latest.name} (${latest.subject || 'General Enquiry'})`,
            time: latest.createdAt ? new Date(latest.createdAt.seconds * 1000).toLocaleDateString() : 'Just now',
            timestamp: latest.createdAt?.seconds || Date.now(),
            type: 'Workflow'
          });
        }

        if (media.length > 0) {
          const latest = media[0]; // ordered desc
          activities.push({
            action: 'Media Asset Uploaded',
            item: latest.title || 'Video/Image',
            time: 'Latest Film',
            timestamp: latest.createdAt?.seconds || Date.now(),
            type: 'CMS'
          });
        }

        if (bookingsList.length > 0) {
          const latest = bookingsList[0];
          activities.push({
            action: 'New Safari Booking Request',
            item: `${latest.name || 'Explorer'} - ${latest.safariName || 'Safari Package'}`,
            time: latest.createdAt ? new Date(latest.createdAt.seconds * 1000).toLocaleDateString() : 'Just now',
            timestamp: latest.createdAt?.seconds || Date.now(),
            type: 'Workflow'
          });
        }

        // Sort activities by timestamp descending
        activities.sort((a, b) => b.timestamp - a.timestamp);
        setRecentActivities(activities);
      } catch (error) {
        console.error('Error fetching admin overview stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-wild-sunset mb-2" />
        <p className="text-gray-500 font-serif">Loading system dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-serif font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back to WILD HAUSA Admin. Here is the partitioned status of the platform.</p>
      </div>

      {/* Content Management (CMS) Stats */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-lg font-serif font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-wild-sunset rounded-full inline-block" />
          Content Management (CMS)
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">Manage live pages, listings, assets, and copywriting overrides.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard title="Active Safaris" value={stats.safaris.toString()} icon={<Compass className="text-wild-sunset" />} trend="Public Packages" href="/admin/safaris" />
          <StatCard title="Map Locations" value={stats.locations.toString()} icon={<MapIcon className="text-wild-moss" />} trend="Interactive Markers" href="/admin/map-locations" />
          <StatCard title="Media & Films" value={stats.media.toString()} icon={<ImageIcon className="text-gray-650" />} trend="Documentary Items" href="/admin/content" />
          <StatCard title="Adventure Activities" value={stats.activities.toString()} icon={<ActivityIcon className="text-amber-600" />} trend="Park Experiences" href="/admin/activities" />
          <StatCard title="Conservation Notes" value={stats.notes.toString()} icon={<BookOpen className="text-emerald-700" />} trend="Classroom Cards" href="/admin/conservation" />
        </div>
      </div>

      {/* Operations & Workflows Stats */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-lg font-serif font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-wild-deep-forest rounded-full inline-block" />
          Operations & Workflows
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">Monitor user bookings, contact submissions, and newsletter subscriptions.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Safari Bookings" value={stats.bookings.toString()} icon={<Calendar className="text-wild-sunset" />} trend="Expedition Requests" href="/admin/bookings" />
          <StatCard title="Contact Enquiries" value={stats.enquiries.toString()} icon={<Users className="text-wild-brown" />} trend="Submitted messages" href="/admin/enquiries" />
          <StatCard title="Newsletter Subs" value={stats.newsletter.toString()} icon={<Mail className="text-indigo-650" />} trend="Active Subscribers" href="/admin/newsletter" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-serif font-bold text-gray-800">Recent Activity Log</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivities.length > 0 ? (
            recentActivities.map((act, index) => (
              <ActivityRow key={index} action={act.action} item={act.item} time={act.time} type={act.type} />
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No recent activity recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, href }: { title: string, value: string, icon: React.ReactNode, trend: string, href?: string }) {
  const cardContent = (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-600 transition-colors uppercase tracking-wider">{title}</span>
        <div className="p-1.5 bg-white rounded border border-gray-100 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">{icon}</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 mb-1 transition-colors duration-300 group-hover:text-wild-sunset">{value}</div>
        <div className="text-[10px] text-gray-400 font-medium">{trend}</div>
      </div>
    </>
  );

  const className = `group bg-gray-50/50 p-5 rounded-lg border border-gray-100 flex flex-col justify-between transition-all duration-300 ${
    href 
      ? 'hover:-translate-y-1 hover:shadow-md hover:border-wild-sunset/40 hover:bg-wild-sand/5 cursor-pointer block h-full' 
      : ''
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={className}>
      {cardContent}
    </div>
  );
}

function ActivityRow({ action, item, time, type }: { action: string, item: string, time: string, type: 'CMS' | 'Workflow' }) {
  return (
    <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900">{action}</p>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase ${
            type === 'CMS' 
              ? 'bg-amber-100 text-amber-800' 
              : 'bg-emerald-100 text-emerald-800'
          }`}>
            {type}
          </span>
        </div>
        <p className="text-sm text-gray-500">{item}</p>
      </div>
      <div className="text-xs text-gray-400">{time}</div>
    </div>
  );
}


