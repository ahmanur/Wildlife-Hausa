"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Compass } from 'lucide-react';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
        if (pathname === '/admin/login') {
          router.push('/admin');
        }
      } else {
        setUser(null);
        setLoading(false);
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-wild-sunset border-t-transparent rounded-full animate-spin" />
          <p className="text-wild-forest font-serif font-bold text-xl">Loading WILD HAUSA...</p>
        </div>
      </div>
    );
  }

  // If not logged in and not on the login page, render nothing while redirecting
  if (!user && pathname !== '/admin/login') {
    return null;
  }

  return <>{children}</>;
}
