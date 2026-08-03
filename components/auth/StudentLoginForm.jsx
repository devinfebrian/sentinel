'use client';

import React, { useState } from 'react';
import InputField from '../common/InputField';
import PasswordInput from '../common/PasswordInput';
import PrimaryButton from '../common/PrimaryButton';
import AlertNotice from '../common/AlertNotice';
import { studentLoginSchema, validateForm } from '@/lib/validations/auth.schema';

export default function StudentLoginForm({ onSubmit, serverError }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateForm(studentLoginSchema, { identifier, password });

    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    if (onSubmit) {
      onSubmit({ role: 'student', identifier, password });
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
        id="student-identifier"
        label="NISN or System Username"
        type="text"
        placeholder="e.g., budi.santoso.42 / 0012345678"
        value={identifier}
        onChange={(e) => {
          setIdentifier(e.target.value);
          if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: null }));
        }}
        icon="badge"
        error={errors.identifier}
      />

      <PasswordInput
        id="student-password"
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
          Login as Student
        </PrimaryButton>
      </div>

      <div className="text-center pt-1">
        <p className="font-label-sm text-label-sm text-outline">
          Registration & account credentials are managed by school admins.
        </p>
      </div>
    </form>
  );
}
