import React from 'react';

export interface PrimaryButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  icon?: string;
  className?: string;
}

export default function PrimaryButton({
  children,
  type = 'submit',
  onClick,
  disabled = false,
  icon = 'arrow_forward',
  className = '',
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 px-4 bg-primary-container text-on-primary-fixed border border-on-surface/10 rounded font-label-sm text-label-sm uppercase flex items-center justify-center gap-2 hover:bg-primary-fixed active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <span>{children}</span>
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
    </button>
  );
}
