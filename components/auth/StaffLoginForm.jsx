'use client';

import React, { useState } from 'react';
import InputField from '../common/InputField';
import PasswordInput from '../common/PasswordInput';
import PrimaryButton from '../common/PrimaryButton';
import GoogleButton from '../common/GoogleButton';
import AlertNotice from '../common/AlertNotice';
import { staffLoginSchema, validateForm } from '@/lib/validations/auth.schema';

export default function StaffLoginForm({ onSubmit, onGoogleTokenSuccess, serverError }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateForm(staffLoginSchema, { identifier, password });

    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    if (onSubmit) {
      onSubmit({ identifier, password });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-md animate-fade-in" noValidate>

      {/* Proportional Server Error Banner */}
      {serverError && (
        <div className="py-3.5 px-4 rounded-xl bg-red-50 border border-red-200/80 text-red-700 flex items-center gap-3 text-sm font-medium leading-normal animate-fade-in text-left shadow-2xs">
          <span className="material-symbols-outlined text-[20px] text-red-600 shrink-0">
            error
          </span>
          <span className="flex-1">{serverError}</span>
        </div>
      )}

      <InputField
        id="staff-identifier"
        label="Username or Email"
        type="text"
        placeholder="staff@eduportal.com"
        value={identifier}
        onChange={(e) => {
          setIdentifier(e.target.value);
          if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: null }));
        }}
        icon="badge"
        error={errors.identifier}
      />

      <PasswordInput
        id="staff-password"
        label="Password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
        }}
        icon="lock"
        error={errors.password}
      />

      <div className="pt-2">
        <PrimaryButton type="submit" icon="login">
          Login to Portal
        </PrimaryButton>
      </div>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 font-label-sm text-outline">Or</span>
        </div>
      </div>

      <GoogleButton
        onGoogleTokenSuccess={onGoogleTokenSuccess}
        label="Continue with Google"
      />
    </form>
  );
}
