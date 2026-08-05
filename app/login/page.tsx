'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import AuthFooterLink from '@/components/auth/AuthFooterLink';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);
  const mustChangePassword = useAuthStore((s) => s.mustChangePassword);

  // Restore the session in the background. Reading localStorage during render
  // would desync from the server-rendered HTML, so it happens after mount and
  // the flag flips in the promise callback rather than the effect body.
  useEffect(() => {
    let cancelled = false;
    void Promise.resolve(useAuthStore.persist.rehydrate()).then(() => {
      if (!cancelled) setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated && accessToken) {
      router.replace(mustChangePassword ? '/change-password' : '/');
    }
  }, [hydrated, accessToken, mustChangePassword, router]);

  // Nothing here is protected, so the form is server-rendered straight away
  // instead of hiding behind a spinner. Only once a stored session is actually
  // found does this turn into a hand-off screen.
  if (hydrated && accessToken) {
    return <LoadingScreen message="Signing you in" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-background overflow-hidden relative font-body-md text-body-md">
      <main className="relative z-10 w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-gutter min-h-[calc(100vh-128px)] bg-surface-container-lowest rounded-xl border border-surface-variant overflow-hidden shadow-sm">
        {/* Brand panel */}
        <div className="hidden lg:flex flex-col justify-between p-margin-desktop bg-surface relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, var(--color-outline-variant) 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-container rounded-full mix-blend-multiply filter blur-3xl opacity-20" />

          <div className="relative z-10 flex items-center gap-3 mb-8">
            <span
              className="material-symbols-outlined text-primary-container bg-on-surface p-2 rounded-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              security
            </span>
            <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
              Sentinel
            </span>
          </div>

          <div className="relative z-10 mt-auto">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-6 tracking-tight">
              Executive
              <br />
              Precision.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
              Autonomous financial auditing for your finance team, with every finding traceable
              back to the transaction it came from.
            </p>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center items-center p-margin-mobile md:p-margin-desktop bg-surface-container-lowest">
          <div className="w-full max-w-sm mx-auto">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <span
                className="material-symbols-outlined text-primary-container bg-on-surface p-2 rounded-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                security
              </span>
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
                Sentinel
              </span>
            </div>

            <div className="text-center mb-6">
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
                Welcome back
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Enter your credentials to access your workspace.
              </p>
            </div>

            <LoginForm />
            <AuthFooterLink />
          </div>
        </div>
      </main>
    </div>
  );
}
