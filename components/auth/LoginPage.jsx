'use client';

import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BackgroundAtmosphere from '@/components/auth/BackgroundAtmosphere';
import BrandingHeader from '@/components/auth/BrandingHeader';
import LoginCard from '@/components/auth/LoginCard';
import AuthFooterLink from '@/components/auth/AuthFooterLink';
import { loginApi, googleLoginApi } from '@/lib/services/api';

const ROLE_SUBTITLES = {
  staff: 'Manage your institution & teach smarter.',
  student: 'Learn without limits.',
};

export default function LoginPage({ onLoginSuccess = (_data) => {} }) {
  const [activeRole, setActiveRole] = useState('staff');
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setServerError(null);
  };

  const handleLoginSubmit = async (credentials) => {
    setLoading(true);
    setServerError(null);
    try {
      const response = await loginApi({
        role: credentials.role || activeRole,
        identifier: credentials.identifier,
        password: credentials.password,
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
    } catch (err) {
      setServerError(err.message || 'Internal Server Error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleTokenSuccess = async (idToken, role) => {
    setLoading(true);
    setServerError(null);

    try {
      const response = await googleLoginApi({ role: role || activeRole, idToken });
      const { user, mustChangePassword, tokens } = response.data || response;

      toast.success(response.message || 'Google authentication successful!');

      if (tokens?.accessToken) {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken || '');
      }

      if (onLoginSuccess) {
        onLoginSuccess({ user, mustChangePassword, tokens });
      }
    } catch (err) {
      setServerError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-12 overflow-hidden relative">
      <BackgroundAtmosphere />
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable />

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-[480px] animate-in fade-in zoom-in duration-700">
        <BrandingHeader
          title="Eleva"
          subtitle={ROLE_SUBTITLES[activeRole] || ROLE_SUBTITLES.staff}
        />

        <div className="relative">
          {loading && (
            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-xs rounded-2xl flex items-center justify-center">
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

          <LoginCard
            activeRole={activeRole}
            onRoleChange={handleRoleChange}
            onLoginSubmit={handleLoginSubmit}
            onGoogleTokenSuccess={handleGoogleTokenSuccess}
            serverError={serverError}
          />
        </div>

        <AuthFooterLink
          text="Need help?"
          linkText="Contact Admin"
        />
      </main>
    </div>
  );
}
