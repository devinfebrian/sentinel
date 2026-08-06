import React from 'react';

export interface AlertNoticeProps {
  icon?: string;
  message?: string;
  variant?: 'tertiary' | 'secondary' | 'info' | 'error';
  children?: React.ReactNode;
}

export default function AlertNotice({
  icon = 'info',
  message,
  variant = 'tertiary',
  children,
}: AlertNoticeProps) {
  const styles: Record<string, { bg: string; border: string; icon: string; text: string }> = {
    tertiary: {
      bg: 'bg-tertiary-container/30',
      border: 'border-tertiary-container',
      icon: 'text-tertiary',
      text: 'text-on-tertiary-container',
    },
    secondary: {
      bg: 'bg-secondary-container/30',
      border: 'border-secondary-container',
      icon: 'text-secondary',
      text: 'text-on-secondary-container',
    },
    info: {
      bg: 'bg-primary-container/20',
      border: 'border-primary-container',
      icon: 'text-primary',
      text: 'text-on-primary-container',
    },
    // Auth failures need to read as failures; without this every page was
    // hand-rolling its own red banner.
    error: {
      bg: 'bg-error-container/50',
      border: 'border-error-container',
      icon: 'text-error',
      text: 'text-on-error-container',
    },
  };

  const currentStyle = styles[variant] || styles.tertiary;

  return (
    <div
      role={variant === 'error' ? 'alert' : undefined}
      className={`flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all ${currentStyle.bg} ${currentStyle.border}`}
    >
      <span className={`material-symbols-outlined text-[20px] shrink-0 ${currentStyle.icon}`}>
        {icon}
      </span>
      <p className={`font-body-md text-body-md leading-relaxed ${currentStyle.text}`}>
        {message || children}
      </p>
    </div>
  );
}
