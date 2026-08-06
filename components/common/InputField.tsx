import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import type { IconComponent } from '@/lib/types/icon';

export interface InputFieldProps {
  id: string;
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: IconComponent;
  required?: boolean;
  helperText?: string;
  error?: string | null;
  disabled?: boolean;
}

export default function InputField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  required = false,
  helperText,
  error,
  disabled = false,
}: InputFieldProps) {
  return (
    <div className="space-y-1.5 group text-left">
      {label && (
        <label
          htmlFor={id}
          className={`block font-label-sm text-label-sm transition-colors ${
            error ? 'text-error font-bold' : 'text-on-surface'
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
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`h-12 w-full rounded-lg border bg-surface-bright font-body-md text-body-md text-on-surface transition-colors placeholder:text-on-surface-variant/70 focus:outline-none ${
            error
              ? 'border-error focus:border-error focus:ring-1 focus:ring-error'
              : 'border-outline-variant/50 focus:border-secondary focus:ring-1 focus:ring-secondary'
          } ${Icon ? 'pl-10 pr-3' : 'px-3'}`}
        />
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
