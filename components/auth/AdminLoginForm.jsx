'use client';

import React, { useState } from 'react';
import InputField from '../common/InputField';
import PasswordInput from '../common/PasswordInput';
import PrimaryButton from '../common/PrimaryButton';
import GoogleButton from '../common/GoogleButton';
import { adminLoginSchema, validateForm } from '@/lib/validations/auth.schema';

export default function AdminLoginForm({ onSubmit, onGoogleTokenSuccess, serverError }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateForm(adminLoginSchema, { identifier, password });

    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    if (onSubmit) {
      onSubmit({ role: 'admin', identifier, password });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-md animate-fade-in" noValidate>
      {/* Proportional Server Error Banner */}
      {serverError && (
        <div className="mb-5 py-3.5 px-4 rounded-xl bg-red-50 border border-red-200/80 text-red-700 flex items-center gap-3 text-sm font-medium leading-normal animate-fade-in text-left shadow-2xs">
          <span className="material-symbols-outlined text-[20px] text-red-600 shrink-0">
            error
          </span>
          <span className="flex-1">{serverError}</span>
        </div>
      )}

      <InputField
        id="admin-identifier"
        label="Username or Email"
        type="text"
        placeholder="admin@eduportal.com"
        value={identifier}
        onChange={(e) => {
          setIdentifier(e.target.value);
          if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: null }));
        }}
        icon="person"
        error={errors.identifier}
      />

      <PasswordInput
        id="admin-password"
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
          Login as Admin
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
        role="admin"
        onGoogleTokenSuccess={onGoogleTokenSuccess}
        label="Continue with Google"
      />
    </form>
  );
}
