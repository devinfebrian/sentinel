'use client';

import React, { useState } from 'react';
import {
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import type { IconComponent } from '@/lib/types/icon';

export interface PasswordInputProps {
  id: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: IconComponent;
  required?: boolean;
  helperText?: string;
  error?: string | null;
  disabled?: boolean;
}

export default function PasswordInput({
  id,
  label = 'Password',
  placeholder = '••••••••',
  value,
  onChange,
  icon: Icon = LockClosedIcon,
  required = false,
  helperText,
  error,
  disabled = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5 group text-left">
      {label && (
        <label
          htmlFor={id}
          className={`block font-label-lg text-label-lg uppercase transition-colors ${
            error ? 'text-error font-bold' : 'text-on-surface group-focus-within:text-primary'
          }`}
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <Icon
            aria-hidden="true"
            className={`absolute left-3 h-5 w-5 pointer-events-none transition-colors ${
              error ? 'text-error' : 'text-outline group-focus-within:text-primary'
            }`}
          />
        )}
        <input
          id={id}
          name={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={`w-full py-3.5 bg-surface-container-lowest border rounded transition-all font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
            showPassword ? 'tracking-normal' : 'tracking-[0.1em]'
          } ${
            error
              ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
              : 'border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/20'
          } ${Icon ? 'pl-10 pr-10' : 'pl-4 pr-10'}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          className="absolute right-3 text-outline hover:text-on-surface focus:outline-none transition-colors p-1 disabled:opacity-50"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeSlashIcon aria-hidden="true" className="h-5 w-5" />
          ) : (
            <EyeIcon aria-hidden="true" className="h-5 w-5" />
          )}
        </button>
      </div>

      {error ? (
        <p className="font-label-sm text-label-sm text-error mt-1 flex items-center gap-1 animate-fade-in">
          <ExclamationCircleIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="font-label-sm text-label-sm text-outline mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
