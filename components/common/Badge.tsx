import React from 'react';
import { cn } from '@/lib/utils';

/**
 * The pill this app kept re-inventing: three private copies existed, one per
 * page, each with its own colour mapping. One shared component so a "Critical"
 * chip means the same thing wherever it appears.
 */

export type BadgeTone = 'critical' | 'high' | 'medium' | 'low' | 'neutral' | 'success';

const TONE_CLASSES: Record<BadgeTone, string> = {
  critical: 'bg-error/10 text-error',
  high: 'bg-tertiary/10 text-tertiary',
  medium: 'bg-secondary-container text-on-secondary-container',
  low: 'bg-surface-container-highest text-on-surface-variant',
  neutral: 'bg-surface-container-high text-on-surface-variant',
  success: 'bg-secondary/10 text-secondary',
};

interface BadgeProps {
  tone?: BadgeTone;
  /** A filled dot ahead of the label, matching the risk chips in the design. */
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function Badge({ tone = 'neutral', dot = false, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-label-sm text-label-sm whitespace-nowrap',
        TONE_CLASSES[tone],
        className
      )}
    >
      {dot && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
