import React from 'react';

export interface InputFieldProps {
  id: string;
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: string;
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
  icon,
  required = false,
  helperText,
  error,
  disabled = false,
}: InputFieldProps) {
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
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full py-3 bg-surface-container-lowest border rounded transition-all font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none ${
            error
              ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
              : 'border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/20'
          } ${icon ? 'pl-10 pr-4' : 'px-4'}`}
        />
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
