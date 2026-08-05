import React from 'react';

export interface AlertNoticeProps {
  icon?: string;
  message?: string;
  variant?: 'tertiary' | 'secondary' | 'info';
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
  };

  const currentStyle = styles[variant] || styles.tertiary;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${currentStyle.bg} ${currentStyle.border}`}
    >
      <span className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${currentStyle.icon}`}>
        {icon}
      </span>
      <p className={`font-label-lg text-label-lg leading-relaxed ${currentStyle.text}`}>
        {message || children}
      </p>
    </div>
  );
}
