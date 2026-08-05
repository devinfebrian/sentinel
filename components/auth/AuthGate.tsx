'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/common/LoadingScreen';
import { getMeApi } from '@/lib/services/api';
import { useAuthStore } from '@/lib/stores/auth.store';

type Phase = 'restoring' | 'verifying' | 'ready' | 'rejected';

/**
 * Guards everything behind the dashboard shell.
 *
 * This is a Client Component rather than a check inside the layout on purpose:
 * layouts do not re-render on navigation, so a check there would go stale,
 * while this subscribes to the store and reacts to every session change.
 *
 * It renders an explicit loading screen rather than returning null, so
 * protected content is never briefly painted before the redirect lands.
 *
 * Honest limitation: the token lives in localStorage, which a server cannot
 * read, so this cannot be enforced in proxy.ts. Real server-side enforcement
 * requires moving the session to an httpOnly cookie.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('restoring');

  const accessToken = useAuthStore((s) => s.accessToken);
  const mustChangePassword = useAuthStore((s) => s.mustChangePassword);
  const setUser = useAuthStore((s) => s.setUser);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      // Deferred hydration: reading localStorage during render would make the
      // client disagree with the server-rendered HTML.
      await useAuthStore.persist.rehydrate();
      if (cancelled) return;

      const token = useAuthStore.getState().accessToken;
      if (!token) {
        setPhase('rejected');
        router.replace('/login');
        return;
      }

      setPhase('verifying');

      try {
        // A stored token proves nothing — it may be expired, or the account
        // may have been deactivated since. The server decides.
        const res = await getMeApi(token);
        if (cancelled) return;

        setUser(res.data.user);

        if (res.data.user.mustChangePassword) {
          setPhase('rejected');
          router.replace('/change-password');
          return;
        }

        setPhase('ready');
      } catch {
        if (cancelled) return;
        clearSession();
        setPhase('rejected');
        router.replace('/login');
      }
    };

    restore();
    return () => {
      cancelled = true;
    };
  }, [router, setUser, clearSession]);

  // Reacts to a logout or an expiry detected elsewhere while mounted.
  useEffect(() => {
    if (phase === 'ready' && !accessToken) {
      router.replace('/login');
    }
  }, [phase, accessToken, router]);

  useEffect(() => {
    if (phase === 'ready' && mustChangePassword) {
      router.replace('/change-password');
    }
  }, [phase, mustChangePassword, router]);

  if (phase !== 'ready' || !accessToken) {
    return (
      <LoadingScreen
        message={phase === 'verifying' ? 'Verifying session' : 'Restoring session'}
      />
    );
  }

  return <>{children}</>;
}
