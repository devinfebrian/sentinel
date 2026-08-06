import React from 'react';

export interface PrimaryButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: string;
  className?: string;
}

export default function PrimaryButton({
  children,
  type = 'submit',
  onClick,
  disabled = false,
  loading = false,
  loadingText,
  icon = 'arrow_forward',
  className = '',
}: PrimaryButtonProps) {
  // Keeps the pending state inside the button instead of behind a blur
  // overlay, so the control that was clicked is the one that reacts.
  const isBusy = loading || disabled;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isBusy}
      aria-busy={loading}
      className={`w-full py-3.5 px-4 bg-primary-container text-on-primary-fixed border border-on-surface/10 rounded font-label-lg text-label-lg font-bold uppercase flex items-center justify-center gap-2 hover:bg-primary-fixed active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <span>{loading && loadingText ? loadingText : children}</span>
      {loading ? (
        <span className="material-symbols-outlined text-[18px] animate-spin">
          progress_activity
        </span>
      ) : (
        icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>
      )}
    </button>
  );
}
