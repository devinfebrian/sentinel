'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
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

  if (isLoading || isAuthenticated) {
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

  return (
    <div className="min-h-screen flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-background overflow-hidden relative font-body-md text-body-md">
      <main className="relative z-10 w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-gutter min-h-[calc(100vh-128px)] bg-surface-container-lowest rounded-xl border border-surface-variant overflow-hidden shadow-sm">
        {/* Left Section: Brand & Messaging */}
        <div className="hidden lg:flex flex-col justify-between p-margin-desktop bg-surface relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #c7c8b3 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-container rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

          <div className="relative z-10 flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-primary-container bg-on-surface p-2 rounded-lg" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            <span className="font-headline-lg text-headline-lg text-on-surface font-bold">Sentinel</span>
          </div>

          <div className="relative z-10 mt-auto">
            <h1 className="font-display text-display text-on-surface mb-6 tracking-tight">
              Executive<br />Precision.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
              Secure, high-performance financial infrastructure designed for modern enterprise scale and relentless clarity.
            </p>

            <div className="mt-12 flex items-center gap-3">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-surface-container-lowest bg-surface-container-high flex items-center justify-center text-primary font-bold z-30 font-label-sm text-label-sm">JD</div>
                <div className="w-10 h-10 rounded-full border-2 border-surface-container-lowest bg-surface-container-high flex items-center justify-center text-primary font-bold z-20 font-label-sm text-label-sm">AR</div>
                <div className="w-10 h-10 rounded-full border-2 border-surface-container-lowest bg-surface-container-high flex items-center justify-center z-10 text-on-surface-variant font-label-sm text-label-sm">+2k</div>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider ml-2">Trusted by leaders</span>
            </div>
          </div>
        </div>

        {/* Right Section: Login Form */}
        <div className="flex flex-col justify-center items-center p-margin-mobile md:p-margin-desktop bg-surface-container-lowest">
          <div className="w-full max-w-sm mx-auto">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary-container bg-on-surface p-2 rounded-lg" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold">Sentinel</span>
            </div>

            <div className="text-center mb-6">
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
                Welcome back
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Enter your credentials to access your workspace.</p>
            </div>

            <LoginForm onLoginSuccess={login} />
          </div>
        </div>
      </main>
    </div>
  );
}
