'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePageClient() {
  const { user, isAuthenticated, mustChangePassword, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (mustChangePassword) {
        router.push('/change-password');
      }
    }
  }, [isAuthenticated, mustChangePassword, isLoading, router]);

  if (isLoading || !isAuthenticated || mustChangePassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">
            progress_activity
          </span>
          <span className="font-label-lg text-primary font-bold">Authenticating...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-on-surface">
      <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-xl shadow-sm max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
          <span className="material-symbols-outlined text-4xl">verified_user</span>
        </div>
        <h1 className="font-headline-md text-headline-md text-on-surface">
          Welcome Back, {user?.name || user?.email || 'User'}!
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          You have successfully logged in as{' '}
          <span className="font-bold uppercase text-primary">{user?.role || 'User'}</span>.
        </p>

        <div className="pt-4 border-t border-outline-variant">
          <button
            type="button"
            onClick={logout}
            className="w-full bg-error/10 hover:bg-error/20 text-error font-label-lg font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
