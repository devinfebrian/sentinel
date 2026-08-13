'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LoginForm from '@/components/auth/LoginForm';
import AuthFooterLink from '@/components/auth/AuthFooterLink';
import LoadingScreen from '@/components/common/LoadingScreen';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
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
      router.replace(mustChangePassword ? '/change-password' : '/overview');
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
      <main className="relative z-10 w-full mx-8 grid grid-cols-1 lg:grid-cols-2 gap-gutter min-h-[calc(100vh-96px)] bg-surface-container-lowest rounded-xl border border-surface-variant overflow-hidden shadow-sm">
        {/* Brand panel */}
        <div className="hidden lg:flex flex-col p-margin-desktop bg-surface relative overflow-hidden">
          <AnimatedGridPattern
            numSquares={60}
            maxOpacity={0.3}
            duration={3}
            repeatDelay={1}
            className="inset-x-[-20%] inset-y-[-20%] h-[140%] w-[140%] skew-y-12"
          />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-container rounded-full mix-blend-multiply filter blur-3xl opacity-20" />

          <div className="relative z-10 flex items-center gap-3">
            <span className="relative h-10 w-10 shrink-0">
              <Image src="/sentinel_logo.png" alt="" fill priority sizes="40px" className="object-contain" />
            </span>
            <span className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
              Sentinel
            </span>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center items-center p-margin-mobile md:p-margin-desktop bg-surface-container-lowest">
          <div className="w-full max-w-sm mx-auto">
            <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
              <span className="relative h-9 w-9 shrink-0">
                <Image src="/sentinel_logo.png" alt="" fill priority sizes="36px" className="object-contain" />
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                Sentinel
              </span>
            </div>

            <div className="text-center mb-6">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
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
