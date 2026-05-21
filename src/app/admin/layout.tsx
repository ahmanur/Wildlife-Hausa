"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { 
  Compass, 
  Map as MapIcon, 
  Video, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Users, 
  Activity, 
  BookOpen,
  FileText,
  Calendar,
  Mail,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Globe
} from 'lucide-react';


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Auto-expand CMS if we are on a CMS subpath
  const isCmsPath = pathname.startsWith('/admin/safaris') ||
                    pathname.startsWith('/admin/map-locations') ||
                    pathname.startsWith('/admin/content') ||
                    pathname.startsWith('/admin/activities') ||
                    pathname.startsWith('/admin/conservation') ||
                    pathname.startsWith('/admin/about') ||
                    pathname.startsWith('/admin/services') ||
                    pathname.startsWith('/admin/settings');

  const [isCmsOpen, setIsCmsOpen] = useState(isCmsPath);

  useEffect(() => {
    if (isCmsPath) {
      setIsCmsOpen(true);
    }
  }, [pathname, isCmsPath]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wildhausa_admin_logged_in');
      }
      router.push('/admin/login');
    }
  };

  return (
    <AdminAuthGuard>
      {isLoginPage ? (
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50 flex">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-wild-deep-forest text-wild-cream flex flex-col hidden md:flex fixed h-full z-10">
            <div className="p-6 border-b border-wild-forest/30 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 drop-shadow-md">
                  <Image
                    src="/logo.png"
                    alt="Wild Hausa Logo"
                    fill
                    className="object-contain bg-white/10 rounded-full p-1"
                    priority
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-white tracking-wider leading-tight text-sm">WILD HAUSA</span>
                  <span className="text-[8px] text-wild-cream/40 uppercase tracking-widest font-sans font-bold">Admin Panel</span>
                </div>
              </div>
              <Link 
                href="/" 
                className="flex items-center gap-1.5 text-xs text-wild-cream/65 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10"
              >
                <Globe size={12} className="text-wild-sunset" />
                <span>Visit Homepage</span>
              </Link>
            </div>
            
            <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
              {/* Group 1: General */}
              <div className="space-y-1">
                <SidebarLink href="/admin" icon={<LayoutDashboard size={18} />} text="Overview" active={pathname === '/admin'} />
              </div>

              {/* Group 2: Operations & Workflows (Now at the top) */}
              <div className="space-y-1">
                <div className="px-4 py-2 text-[10px] font-bold text-wild-cream/40 uppercase tracking-widest">
                  Operations & Workflows
                </div>
                <SidebarLink href="/admin/bookings" icon={<Calendar size={18} />} text="Bookings" active={pathname.startsWith('/admin/bookings')} />
                <SidebarLink href="/admin/enquiries" icon={<Mail size={18} />} text="Enquiries" active={pathname.startsWith('/admin/enquiries')} />
                <SidebarLink href="/admin/newsletter" icon={<Users size={18} />} text="Newsletter" active={pathname.startsWith('/admin/newsletter')} />
              </div>

              {/* Group 3: Content Management (CMS) (Now below Workflows and Collapsible) */}
              <div className="space-y-1">
                <button
                  onClick={() => setIsCmsOpen(!isCmsOpen)}
                  className="flex items-center justify-between w-full px-4 py-2 text-[10px] font-bold text-wild-cream/40 uppercase tracking-widest hover:text-white transition-colors text-left focus:outline-none cursor-pointer"
                >
                  <span>Content Management (CMS)</span>
                  {isCmsOpen ? <ChevronUp size={14} className="text-wild-cream/60" /> : <ChevronDown size={14} className="text-wild-cream/60" />}
                </button>
                
                {isCmsOpen && (
                  <div className="space-y-1 mt-1 pl-2 border-l border-wild-forest/20 transition-all duration-300">
                    <SidebarLink href="/admin/safaris" icon={<Compass size={18} />} text="Safaris" active={pathname.startsWith('/admin/safaris')} />
                    <SidebarLink href="/admin/map-locations" icon={<MapIcon size={18} />} text="Map Locations" active={pathname.startsWith('/admin/map-locations')} />
                    <SidebarLink href="/admin/content" icon={<Video size={18} />} text="Content & Films" active={pathname.startsWith('/admin/content')} />
                    <SidebarLink href="/admin/activities" icon={<Activity size={18} />} text="Adventure Activities" active={pathname.startsWith('/admin/activities')} />
                    <SidebarLink href="/admin/conservation" icon={<BookOpen size={18} />} text="Conservation Notes" active={pathname.startsWith('/admin/conservation')} />
                    <SidebarLink href="/admin/about" icon={<FileText size={18} />} text="About Page" active={pathname.startsWith('/admin/about')} />
                    <SidebarLink href="/admin/services" icon={<FileText size={18} />} text="Services Page" active={pathname.startsWith('/admin/services')} />
                    <SidebarLink href="/admin/settings" icon={<Settings size={18} />} text="Settings" active={pathname.startsWith('/admin/settings')} />
                  </div>
                )}
              </div>
            </nav>
            
            <div className="p-4 border-t border-wild-forest/30 space-y-1">
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-400 hover:bg-white/5 rounded-lg transition-colors font-medium text-sm cursor-pointer"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Mobile Drawer (visible on small screens when open) */}
          {isMobileDrawerOpen && (
            <div className="fixed inset-0 z-40 flex md:hidden">
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsMobileDrawerOpen(false)}
              />
              
              {/* Drawer Content */}
              <aside className="relative flex flex-col w-full max-w-xs h-full bg-wild-deep-forest text-wild-cream p-4 z-50 animate-slide-in">
                <div className="flex flex-col pb-6 mb-4 border-b border-wild-forest/30 gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 drop-shadow-md">
                        <Image
                          src="/logo.png"
                          alt="Wild Hausa Logo"
                          fill
                          className="object-contain bg-white/10 rounded-full p-1"
                          priority
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-serif font-bold text-white tracking-wider leading-tight text-sm">WILD HAUSA</span>
                        <span className="text-[8px] text-wild-cream/40 uppercase tracking-widest font-sans font-bold">Admin Panel</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="p-1 text-wild-cream hover:bg-white/10 rounded transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <Link 
                    href="/" 
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="flex items-center justify-center gap-1.5 text-xs text-wild-cream/65 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg border border-white/10"
                  >
                    <Globe size={12} className="text-wild-sunset" />
                    <span>Visit Homepage</span>
                  </Link>
                </div>
                
                 <nav className="flex-1 space-y-6 overflow-y-auto pr-2">
                  {/* Group 1: General */}
                  <div className="space-y-1">
                    <SidebarLink href="/admin" icon={<LayoutDashboard size={18} />} text="Overview" active={pathname === '/admin'} onClick={() => setIsMobileDrawerOpen(false)} />
                  </div>

                  {/* Group 2: Operations & Workflows (At the top) */}
                  <div className="space-y-1">
                    <div className="px-4 py-2 text-[10px] font-bold text-wild-cream/40 uppercase tracking-widest">
                      Operations & Workflows
                    </div>
                    <SidebarLink href="/admin/bookings" icon={<Calendar size={18} />} text="Bookings" active={pathname.startsWith('/admin/bookings')} onClick={() => setIsMobileDrawerOpen(false)} />
                    <SidebarLink href="/admin/enquiries" icon={<Mail size={18} />} text="Enquiries" active={pathname.startsWith('/admin/enquiries')} onClick={() => setIsMobileDrawerOpen(false)} />
                    <SidebarLink href="/admin/newsletter" icon={<Users size={18} />} text="Newsletter" active={pathname.startsWith('/admin/newsletter')} onClick={() => setIsMobileDrawerOpen(false)} />
                  </div>

                  {/* Group 3: Content Management (CMS) (Below Workflows and Collapsible) */}
                  <div className="space-y-1">
                    <button
                      onClick={() => setIsCmsOpen(!isCmsOpen)}
                      className="flex items-center justify-between w-full px-4 py-2 text-[10px] font-bold text-wild-cream/40 uppercase tracking-widest hover:text-white transition-colors text-left focus:outline-none cursor-pointer"
                    >
                      <span>Content Management (CMS)</span>
                      {isCmsOpen ? <ChevronUp size={14} className="text-wild-cream/60" /> : <ChevronDown size={14} className="text-wild-cream/60" />}
                    </button>
                    
                    {isCmsOpen && (
                      <div className="space-y-1 mt-1 pl-2 border-l border-wild-forest/20 transition-all duration-300">
                        <SidebarLink href="/admin/safaris" icon={<Compass size={18} />} text="Safaris" active={pathname.startsWith('/admin/safaris')} onClick={() => setIsMobileDrawerOpen(false)} />
                        <SidebarLink href="/admin/map-locations" icon={<MapIcon size={18} />} text="Map Locations" active={pathname.startsWith('/admin/map-locations')} onClick={() => setIsMobileDrawerOpen(false)} />
                        <SidebarLink href="/admin/content" icon={<Video size={18} />} text="Content & Films" active={pathname.startsWith('/admin/content')} onClick={() => setIsMobileDrawerOpen(false)} />
                        <SidebarLink href="/admin/activities" icon={<Activity size={18} />} text="Adventure Activities" active={pathname.startsWith('/admin/activities')} onClick={() => setIsMobileDrawerOpen(false)} />
                        <SidebarLink href="/admin/conservation" icon={<BookOpen size={18} />} text="Conservation Notes" active={pathname.startsWith('/admin/conservation')} onClick={() => setIsMobileDrawerOpen(false)} />
                        <SidebarLink href="/admin/about" icon={<FileText size={18} />} text="About Page" active={pathname.startsWith('/admin/about')} onClick={() => setIsMobileDrawerOpen(false)} />
                        <SidebarLink href="/admin/services" icon={<FileText size={18} />} text="Services Page" active={pathname.startsWith('/admin/services')} onClick={() => setIsMobileDrawerOpen(false)} />
                        <SidebarLink href="/admin/settings" icon={<Settings size={18} />} text="Settings" active={pathname.startsWith('/admin/settings')} onClick={() => setIsMobileDrawerOpen(false)} />
                      </div>
                    )}
                  </div>
                </nav>
                
                <div className="pt-4 border-t border-wild-forest/30 space-y-1 mt-auto">
                  <button 
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-400 hover:bg-white/5 rounded-lg transition-colors font-medium text-sm cursor-pointer"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </aside>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 md:ml-64 bg-gray-50 min-h-screen">
            {/* Top Header for mobile and user profile */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
              <div className="md:hidden flex items-center gap-3 text-wild-deep-forest font-bold font-serif">
                <button 
                  onClick={() => setIsMobileDrawerOpen(true)}
                  className="p-2 text-wild-deep-forest hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  aria-label="Open navigation menu"
                >
                  <Menu size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8">
                    <Image
                      src="/logo.png"
                      alt="Wild Hausa Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <span className="text-xs uppercase tracking-wider font-sans font-bold">WILD HAUSA</span>
                </div>
              </div>
              
              {/* Go to Website Button for Desktop */}
              <div className="hidden md:flex items-center">
                <Link 
                  href="/" 
                  className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-wild-sunset transition-colors px-3 py-1.5 rounded-full border border-gray-200 hover:border-wild-sunset bg-white shadow-sm"
                >
                  <Globe size={14} className="text-gray-500" />
                  <span>Visit Homepage</span>
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-gray-700">Admin User</div>
                <div className="w-8 h-8 bg-wild-moss rounded-full border-2 border-white shadow-sm"></div>
              </div>
            </header>

            {/* Page Content */}
            <div className="p-6 md:p-10 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      )}
    </AdminAuthGuard>
  );
}

function SidebarLink({ href, icon, text, active, onClick }: { href: string; icon: React.ReactNode; text: string; active?: boolean; onClick?: () => void }) {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
        active 
          ? 'text-white bg-wild-sunset shadow-sm' 
          : 'text-wild-cream/80 hover:text-white hover:bg-wild-forest/40'
      }`}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}


