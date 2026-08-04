'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/components/auth/LoginPage';
import { useAuth } from '@/context/AuthContext';

export default function LoginPageClient() {
  const { isAuthenticated, mustChangePassword, isLoading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (mustChangePassword) {
        router.push('/change-password');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, mustChangePassword, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">
            progress_activity
          </span>
          <span className="font-label-lg text-primary font-bold">Loading session...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <LoginPage onLoginSuccess={login} />;
}
