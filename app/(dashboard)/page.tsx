'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { isAuthenticated, mustChangePassword, isLoading } = useAuth();
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
      <div className="h-full flex items-center justify-center">
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
    <div className="w-full h-full flex items-center justify-center">
       {/* Empty Shell as requested */}
       <p className="text-on-surface-variant font-label-sm opacity-50">Select an item from the sidebar or start a new analysis.</p>
    </div>
  );
}
