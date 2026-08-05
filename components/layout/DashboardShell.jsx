'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuth } from '@/context/AuthContext';

export default function DashboardShell({
  title,
  subtitle,
  actions,
  placeholder,
  children,
}) {
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
    <div className="min-h-screen bg-background text-on-background font-body-md flex">
      <Sidebar />
      <div className="flex-1 ml-[88px] flex flex-col">
        <TopBar placeholder={placeholder} />
        <main className="flex-1 p-margin-page max-w-[1440px] mx-auto w-full">
          <div className="flex justify-between items-end mb-stack-md">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">{title}</h1>
              {subtitle && (
                <p className="font-body-md text-body-md text-on-surface-variant">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex gap-4">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
