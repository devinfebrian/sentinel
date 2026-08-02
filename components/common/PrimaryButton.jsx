import React from 'react';

export default function PrimaryButton({
  children,
  type = 'submit',
  onClick,
  disabled = false,
  icon = 'arrow_forward',
  className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-primary-container text-on-background font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:brightness-95 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <span>{children}</span>
      {icon && <span className="material-symbols-outlined text-[20px]">{icon}</span>}
    </button>
  );
}
