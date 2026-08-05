'use client';

import React, { useState } from 'react';

export interface PasswordInputProps {
  id: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: string;
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
  icon = 'lock',
  required = false,
  helperText,
  error,
  disabled = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1 group text-left">
      {label && (
        <label
          htmlFor={id}
          className={`block font-label-sm text-label-sm uppercase transition-colors ${
            error ? 'text-error font-bold' : 'text-on-surface group-focus-within:text-primary'
          }`}
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span
            className={`material-symbols-outlined absolute left-3 text-[20px] pointer-events-none transition-colors ${
              error ? 'text-error' : 'text-outline group-focus-within:text-primary'
            }`}
          >
            {icon}
          </span>
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
          className={`w-full py-3 bg-surface-container-lowest border rounded transition-all font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
            error
              ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
              : 'border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/20'
          } ${icon ? 'pl-10 pr-10' : 'pl-4 pr-10'}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          className="absolute right-3 text-outline hover:text-on-surface focus:outline-none transition-colors p-1 disabled:opacity-50"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {showPassword ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>

      {error ? (
        <p className="font-label-sm text-xs text-error mt-1 flex items-center gap-1 animate-fade-in">
          <span className="material-symbols-outlined text-[14px]">error</span>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="font-label-sm text-label-sm text-outline mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
