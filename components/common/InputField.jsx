import React from 'react';

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
}) {
  return (
    <div className="space-y-xs group text-left">
      {label && (
        <label
          htmlFor={id}
          className={`block font-label-lg text-label-lg transition-colors ${
            error ? 'text-error font-semibold' : 'text-on-surface-variant group-focus-within:text-primary'
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
          className={`w-full py-3 bg-[#F5F5F4] border-b-2 transition-all font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none ${
            error
              ? 'border-error focus:border-error bg-error-container/10'
              : 'border-outline-variant focus:border-primary'
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
