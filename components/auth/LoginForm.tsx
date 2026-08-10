'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import InputField from '@/components/common/InputField';
import PasswordInput from '@/components/common/PasswordInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import GoogleButton from '@/components/common/GoogleButton';
import AlertNotice from '@/components/common/AlertNotice';
import { toast } from 'react-toastify';
import { loginSchema, validateForm } from '@/lib/validations/auth.schema';
import { loginApi, googleLoginApi, ApiError } from '@/lib/services/api';
import { useAuthStore, type User, type AuthTokens } from '@/lib/stores/auth.store';

const googleEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === 'true';

// TODO: Branching on backend message strings is fragile — it breaks the moment
// the backend rewords an error. If the backend ever adds a machine-readable
// errorCode to error responses, switch these checks to it.
const GOOGLE_UNREGISTERED_MESSAGE =
  'This account is not registered. Please contact your Finance Lead.';
const GOOGLE_DEACTIVATED_MESSAGE =
  'This account has been deactivated. Please contact your Finance Lead.';
const GOOGLE_UNREGISTERED_COPY =
  "This account isn't registered yet. Please contact your Finance Lead.";

interface SessionResult {
  user: User;
  tokens: AuthTokens;
  mustChangePassword: boolean;
}

export default function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // The single place a successful response becomes a session, so the store
  // stays the only writer of auth state.
  const enterApp = (data: SessionResult) => {
    setSession(data);
    router.replace(data.mustChangePassword ? '/change-password' : '/');
  };

  const handleFailure = (err: unknown, fallback: string) => {
    if (err instanceof ApiError) {
      setServerError(err.message);
      // Per-field messages the backend already sends but the old client dropped.
      if (err.fieldErrors.length) {
        setErrors(Object.fromEntries(err.fieldErrors.map((e) => [e.field, e.message])));
      }
      return;
    }
    setServerError(fallback);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateForm(loginSchema, { email, password });
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await loginApi(validation.data);
      enterApp(res.data);
    } catch (err) {
      handleFailure(err, 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleToken = async (idToken: string) => {
    setServerError(null);
    setLoading(true);

    try {
      const res = await googleLoginApi({ idToken });
      if (res.data.tempPasswordCleared) {
        toast.info('Your temporary password is no longer valid.');
      }
      enterApp(res.data);
    } catch (err) {
      if (err instanceof ApiError) {
        // Both 403s mean "reach the Finance Lead", but the copy differs.
        // The backend distinguishes them only by message text (see TODO above).
        if (err.status === 403 && err.message === GOOGLE_UNREGISTERED_MESSAGE) {
          setServerError(GOOGLE_UNREGISTERED_COPY);
          return;
        }
        if (err.status === 403 && err.message === GOOGLE_DEACTIVATED_MESSAGE) {
          setServerError(err.message);
          return;
        }

        // Pass through the backend's safe operational message instead of masking it.
        // This will surface "Invalid or expired Google token", "Google sign-in is not configured", etc.
        // We filter for 4xx and 503 to ensure we don't expose 500 internal database errors or stack traces.
        const isSafeErrorStatus = (err.status >= 400 && err.status < 500) || err.status === 503;
        if (isSafeErrorStatus && err.message) {
          setServerError(err.message);
          return;
        }
        
        setServerError('Google sign-in failed. Please try again.');
        return;
      }
      setServerError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in" noValidate>
      {serverError && <AlertNotice variant="error" icon={ExclamationCircleIcon} message={serverError} />}

      <InputField
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
        }}
        error={errors.email}
        disabled={loading}
      />

      <PasswordInput
        id="password"
        label="Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
        }}
        error={errors.password}
        disabled={loading}
      />

      <div className="pt-2">
        <PrimaryButton type="submit" loading={loading} loadingText="Signing in">
          Sign In
        </PrimaryButton>
      </div>

      {googleEnabled && (
        <>
          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-surface-variant" />
            <span className="font-label-sm text-label-sm text-outline uppercase">or</span>
            <span className="h-px flex-1 bg-surface-variant" />
          </div>
          <GoogleButton
            onGoogleTokenSuccess={handleGoogleToken}
            label="Continue with Google"
          />
        </>
      )}
    </form>
  );
}
