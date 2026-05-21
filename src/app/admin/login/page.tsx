"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Mail, Lock, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import { WildCTA } from '@/components/ui/WildCTA';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('wildhausa_admin_logged_in', 'true');
      router.push('/admin');
    } catch (err: any) {
      console.error('Login error:', err);
      // Fallback bypass for offline/local testing
      if (process.env.NODE_ENV === 'development' && email === 'ahmanur@gmail.com' && password === 'Admin@3528') {
        console.warn('Firebase Auth failed, logging in with mock admin credentials.');
        localStorage.setItem('wildhausa_admin_logged_in', 'true');
        router.push('/admin');
      } else {
        setError(err.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-wild-sand flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Savanna-colored blurred blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-wild-sunset/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full bg-wild-moss/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-wild-cream p-8 md:p-10 relative z-10 transition-all duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-24 h-24 mb-3">
            <Image
              src="/logo.png"
              alt="Wild Hausa Logo"
              fill
              className="object-contain drop-shadow-md"
              priority
            />
          </div>
          <h1 className="font-serif text-3xl font-bold text-wild-forest tracking-tight">WILD HAUSA</h1>
          <p className="text-sm text-wild-muted mt-2">Wild Hausa Administrator Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex gap-3 items-start text-red-700 text-sm">
            <ShieldAlert size={20} className="shrink-0 text-red-500" />
            <div>
              <p className="font-semibold">Authentication Failed</p>
              <p className="opacity-90">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-wild-forest mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-wild-muted">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@wildhausa.com"
                className="w-full pl-11 pr-4 py-3 bg-wild-sand/35 border border-wild-brown/20 rounded-xl focus:outline-none focus:border-wild-sunset focus:ring-1 focus:ring-wild-sunset/35 transition-all text-wild-charcoal text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-wild-forest mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-wild-muted">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-wild-sand/35 border border-wild-brown/20 rounded-xl focus:outline-none focus:border-wild-sunset focus:ring-1 focus:ring-wild-sunset/35 transition-all text-wild-charcoal text-sm"
              />
            </div>
          </div>

          <WildCTA
            type="submit"
            variant="primary"
            className="w-full py-3.5 mt-2 flex items-center justify-center gap-2 font-bold text-white shadow-lg shadow-wild-sunset/20"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In to Portal</span>
            )}
          </WildCTA>
        </form>

        <div className="mt-8 pt-6 border-t border-wild-cream text-center">
          <a href="/" className="text-xs text-wild-muted hover:text-wild-sunset font-medium transition-colors">
            ← Back to Public Website
          </a>
        </div>
      </div>
    </div>
  );
}
