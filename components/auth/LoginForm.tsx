'use client';

import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InputField from '@/components/common/InputField';
import PrimaryButton from '@/components/common/PrimaryButton';
import GoogleButton from '@/components/common/GoogleButton';
import { staffLoginSchema, validateForm } from '@/lib/validations/auth.schema';
import { loginApi, googleLoginApi } from '@/lib/services/api';

export interface LoginFormProps {
  onLoginSuccess?: (data: any) => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = validateForm(staffLoginSchema, { identifier, password });

    if (!validation.success) {
      setErrors(validation.errors as Record<string, string | null>);
      return;
    }

    setErrors({});
    setLoading(true);
    setServerError(null);

    try {
      const response = await loginApi({
        role: 'staff',
        identifier,
        password,
      });

      const { user, mustChangePassword, tokens } = response.data || response;

      toast.success(response.message || 'Login successful!');

      if (tokens?.accessToken) {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken || '');
      }

      if (onLoginSuccess) {
        onLoginSuccess({ user, mustChangePassword, tokens });
      }
    } catch (err: any) {
      setServerError(err.message || 'Internal Server Error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleTokenSuccess = async (idToken: string) => {
    setLoading(true);
    setServerError(null);

    try {
      const response = await googleLoginApi({ role: 'staff', idToken });
      const { user, mustChangePassword, tokens } = response.data || response;

      toast.success(response.message || 'Google authentication successful!');

      if (tokens?.accessToken) {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken || '');
      }

      if (onLoginSuccess) {
        onLoginSuccess({ user, mustChangePassword, tokens });
      }
    } catch (err: any) {
      setServerError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable />
      {loading && (
        <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-xs rounded-xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl animate-spin">
              progress_activity
            </span>
            <span className="font-label-lg text-sm text-primary font-bold">
              Authenticating...
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in" noValidate>
        {/* Proportional Server Error Banner */}
        {serverError && (
          <div className="py-3.5 px-4 rounded-xl bg-error-container/50 border border-error-container text-on-error-container flex items-center gap-3 text-sm font-medium leading-normal animate-fade-in text-left">
            <span className="material-symbols-outlined text-[20px] shrink-0">
              error
            </span>
            <span className="flex-1">{serverError}</span>
          </div>
        )}

        <InputField
          id="email"
          label="Business Email"
          type="text"
          placeholder="name@company.com"
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: null }));
          }}
          error={errors.identifier}
        />

        <div>
          <div className="flex justify-between items-center">
            <label
              htmlFor="password"
              className={`block font-label-sm text-label-sm uppercase ${errors.password ? 'text-error font-bold' : 'text-on-surface'}`}
            >
              Password
            </label>
            <a className="font-label-sm text-label-sm text-primary hover:text-surface-tint transition-colors" href="#">
              Forgot password?
            </a>
          </div>
          <div className="relative mt-1">
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              placeholder="••••••••"
              required
              className={`w-full py-3 px-4 bg-surface-container-lowest border rounded transition-all font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none ${
                errors.password
                  ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
                  : 'border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/20'
              } pr-10`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors"
              aria-label="Toggle password visibility"
            >
              <span className="material-symbols-outlined text-[20px]">visibility_off</span>
            </button>
          </div>
          {errors.password && (
            <p className="font-label-sm text-xs text-error mt-1 flex items-center gap-1 animate-fade-in">
              <span className="material-symbols-outlined text-[14px]">error</span>
              <span>{errors.password}</span>
            </p>
          )}
        </div>

        <div className="pt-2">
          <PrimaryButton type="submit" icon="arrow_forward" disabled={loading}>
            Sign In
          </PrimaryButton>
        </div>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-variant"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface-container-lowest px-4 font-label-sm text-label-sm text-outline uppercase tracking-wider">Or</span>
          </div>
        </div>

        <div className="space-y-3">
          <GoogleButton
            onGoogleTokenSuccess={handleGoogleTokenSuccess}
            label="Continue with Google"
          />
          <button
            type="button"
            className="w-full py-3 px-4 bg-surface-container-lowest border border-outline-variant rounded font-label-sm text-label-sm text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined text-[20px]">key</span>
            Single Sign-On (SSO)
          </button>
        </div>

        <p className="pt-2 text-center font-label-sm text-label-sm text-outline">
          By signing in, you agree to our{' '}
          <a className="text-primary hover:underline" href="#">Terms of Service</a> and{' '}
          <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
        </p>
      </form>
    </div>
  );
}
