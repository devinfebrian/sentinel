'use client';

import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BrandingHeader from '@/components/auth/BrandingHeader';
import PasswordInput from '@/components/common/PasswordInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import AlertNotice from '@/components/common/AlertNotice';
import AuthFooterLink from '@/components/auth/AuthFooterLink';
import { changePasswordApi } from '@/lib/services/api';
import { changePasswordSchema, validateForm } from '@/lib/validations/auth.schema';

export default function ChangePasswordPage({ accessToken = '', onPasswordChangedSuccessfully = () => {} }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  const getPasswordStrength = () => {
    if (!newPassword) return { percent: 0, color: 'bg-outline-variant' };
    if (newPassword.length < 6) return { percent: 33, color: 'bg-error' };
    if (newPassword.length < 10) return { percent: 66, color: 'bg-tertiary' };
    return { percent: 100, color: 'bg-primary' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateForm(changePasswordSchema, {
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
      const token = accessToken || localStorage.getItem('accessToken');
      const response = await changePasswordApi({
        oldPassword: currentPassword,
        newPassword,
        accessToken: token,
      });

      toast.success(response.message || 'Password updated successfully!');

      setTimeout(() => {
        if (onPasswordChangedSuccessfully) {
          onPasswordChangedSuccessfully();
        }
      }, 1500);
    } catch (err) {
      setServerError(err.message || 'Internal Server Error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-background overflow-hidden relative font-body-md text-body-md">
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable />

      <main className="relative z-10 w-full max-w-[480px] animate-in fade-in zoom-in duration-700">
        <BrandingHeader
          title="Sentinel"
          subtitle="Enterprise Finance"
        />

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 md:p-8 transition-all relative">
          {loading && (
            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-xs rounded-xl flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-primary text-3xl animate-spin">
                  progress_activity
                </span>
                <span className="font-label-lg text-sm text-primary font-bold">
                  Saving Password...
                </span>
              </div>
            </div>
          )}

          <div className="mb-5 text-left space-y-3">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Change Password
            </h2>
            <AlertNotice
              icon="info"
              variant="tertiary"
              message="Please change your password for the first time for account security."
            />
          </div>

          {/* Proportional Server Error Banner */}
          {serverError && (
            <div className="mb-5 py-3.5 px-4 rounded-xl bg-error-container/50 border border-error-container text-on-error-container flex items-center gap-3 text-sm font-medium leading-normal animate-fade-in text-left">
              <span className="material-symbols-outlined text-[20px] shrink-0">
                error
              </span>
              <span className="flex-1">{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-md" noValidate>
            <PasswordInput
              id="current-password"
              label="Current Password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (errors.currentPassword) setErrors((prev) => ({ ...prev, currentPassword: null }));
              }}
              icon="lock_open"
              error={errors.currentPassword}
            />

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
                icon="lock"
                error={errors.newPassword}
              />

              <div className="flex gap-1 mt-2">
                <div className="h-1 flex-1 bg-surface-variant rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-500`}
                    style={{ width: `${strength.percent}%` }}
                  ></div>
                </div>
                <div className="h-1 flex-1 bg-surface-variant rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.percent >= 66 ? strength.color : 'bg-transparent'} transition-all duration-500`}
                  ></div>
                </div>
                <div className="h-1 flex-1 bg-surface-variant rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.percent === 100 ? strength.color : 'bg-transparent'} transition-all duration-500`}
                  ></div>
                </div>
              </div>
              <p className="font-label-sm text-label-sm text-outline">
                Use at least 8 characters with a mix of numbers and symbols.
              </p>
            </div>

            <PasswordInput
              id="confirm-password"
              label="Confirm New Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
              }}
              icon="verified_user"
              error={errors.confirmPassword}
            />

            <div className="pt-lg">
              <PrimaryButton type="submit" icon="arrow_forward" disabled={loading}>
                Save & Continue
              </PrimaryButton>
            </div>
          </form>
        </div>

        <AuthFooterLink text="Need help?" linkText="Contact Admin" />
      </main>
    </div>
  );
}
