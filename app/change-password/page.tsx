'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ExclamationCircleIcon,
  InformationCircleIcon,
  LockClosedIcon,
  LockOpenIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import BrandingHeader from '@/components/auth/BrandingHeader';
import AuthFooterLink from '@/components/auth/AuthFooterLink';
import PasswordInput from '@/components/common/PasswordInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import AlertNotice from '@/components/common/AlertNotice';
import LoadingScreen from '@/components/common/LoadingScreen';
import { changePasswordApi, setPasswordApi, ApiError } from '@/lib/services/api';
import {
  changePasswordSchema,
  setPasswordSchema,
  validateForm,
} from '@/lib/validations/auth.schema';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  const accessToken = useAuthStore((s) => s.accessToken);
  const setUser = useAuthStore((s) => s.setUser);

  // The backend never sends the password hash, so the client cannot tell a
  // Google-only account apart on its own. Assume a normal change and let the
  // server correct us — it answers 400 with "no password yet".
  const [mode, setMode] = useState<'change' | 'set'>('change');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Hydration is deferred so server and client agree on the first render; the
  // flag flips in the promise callback rather than the effect body.
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
    if (hydrated && !accessToken) {
      router.replace('/login');
    }
  }, [hydrated, accessToken, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken) return;
    setServerError(null);

    const validation =
      mode === 'set'
        ? validateForm(setPasswordSchema, { newPassword, confirmPassword })
        : validateForm(changePasswordSchema, {
            currentPassword,
            newPassword,
            confirmPassword,
          });

    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res =
        mode === 'set'
          ? await setPasswordApi({ newPassword }, accessToken)
          : await changePasswordApi({ currentPassword, newPassword }, accessToken);

      setUser(res.data.user);
      router.replace('/overview');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400 && err.message.toLowerCase().includes('no password yet')) {
          // Switch to setting a first password rather than dead-ending.
          setMode('set');
          setCurrentPassword('');
          setServerError('This account has no password yet. Choose one below.');
        } else {
          setServerError(err.message);
        }
        if (err.fieldErrors.length) {
          setErrors(Object.fromEntries(err.fieldErrors.map((f) => [f.field, f.message])));
        }
      } else {
        setServerError('Unable to update your password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated || !accessToken) {
    return <LoadingScreen message="Verifying session" />;
  }

  const strength = (() => {
    if (!newPassword) return { percent: 0, color: 'bg-outline-variant' };
    if (newPassword.length < 8) return { percent: 33, color: 'bg-error' };
    if (newPassword.length < 12) return { percent: 66, color: 'bg-tertiary' };
    return { percent: 100, color: 'bg-primary' };
  })();

  return (
    <div className="min-h-screen flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-background font-body-md text-body-md">
      <main className="relative z-10 w-full max-w-[480px]">
        <BrandingHeader title="Sentinel" subtitle="Enterprise Finance" />

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 md:p-8">
          <div className="mb-5 text-left space-y-3">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              {mode === 'set' ? 'Set your password' : 'Change password'}
            </h2>
            <AlertNotice
              icon={InformationCircleIcon}
              variant="tertiary"
              message={
                mode === 'set'
                  ? 'Choose a password so you can sign in without Google as well.'
                  : 'Choose your own password to replace the temporary one you were given.'
              }
            />
          </div>

          {serverError && (
            <div className="mb-5">
              <AlertNotice variant="error" icon={ExclamationCircleIcon} message={serverError} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-md" noValidate>
            {mode === 'change' && (
              <PasswordInput
                id="current-password"
                label="Current Password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (errors.currentPassword)
                    setErrors((prev) => ({ ...prev, currentPassword: null }));
                }}
                icon={LockOpenIcon}
                error={errors.currentPassword}
                disabled={loading}
              />
            )}

            <div className="space-y-xs">
              <PasswordInput
                id="new-password"
                label="New Password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: null }));
                }}
                icon={LockClosedIcon}
                error={errors.newPassword}
                disabled={loading}
              />

              <div className="flex gap-1 mt-2" aria-hidden="true">
                {[33, 66, 100].map((threshold) => (
                  <div
                    key={threshold}
                    className="h-1 flex-1 bg-surface-variant rounded-full overflow-hidden"
                  >
                    <div
                      className={`h-full transition-all duration-500 ${
                        strength.percent >= threshold ? strength.color : 'bg-transparent'
                      }`}
                      style={{ width: strength.percent >= threshold ? '100%' : '0%' }}
                    />
                  </div>
                ))}
              </div>
              <p className="font-label-sm text-label-sm text-outline">
                At least 8 characters. Longer is stronger.
              </p>
            </div>

            <PasswordInput
              id="confirm-password"
              label="Confirm New Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword)
                  setErrors((prev) => ({ ...prev, confirmPassword: null }));
              }}
              icon={ShieldCheckIcon}
              error={errors.confirmPassword}
              disabled={loading}
            />

            <div className="pt-lg">
              <PrimaryButton type="submit" loading={loading} loadingText="Saving">
                Save &amp; Continue
              </PrimaryButton>
            </div>
          </form>
        </div>

        <AuthFooterLink />
      </main>
    </div>
  );
}
