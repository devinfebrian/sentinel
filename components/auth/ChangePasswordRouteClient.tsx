'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChangePasswordPage from '@/components/auth/ChangePasswordPage';
import { useAuth } from '@/context/AuthContext';

export default function ChangePasswordRouteClient() {
  const { tokens, isAuthenticated, isLoading, setMustChangePasswordState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSuccess = () => {
    setMustChangePasswordState(false);
    router.push('/');
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">
            progress_activity
          </span>
          <span className="font-label-lg text-primary font-bold">Verifying session...</span>
        </div>
      </div>
    );
  }

  return (
    <ChangePasswordPage
      accessToken={tokens?.accessToken || ''}
      onPasswordChangedSuccessfully={handleSuccess}
    />
  );
}
