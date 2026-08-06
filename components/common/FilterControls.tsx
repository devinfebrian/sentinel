'use client';

import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

/**
 * Shared sizing for every filter-bar control, so the search field, the selects,
 * and the icon buttons line up at the same 36px height across all three list
 * pages instead of each page inventing its own.
 */
export const FILTER_INPUT_CLASSES =
  'h-9 w-full rounded-lg border border-outline-variant/30 bg-surface-container-low font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-1 focus:ring-primary/50';

interface FilterSelectProps<T extends string> {
  /** Accessible name; these selects have no visible label. */
  label: string;
  value: T;
  onChange: (value: T) => void;
  /** Width and flex behaviour, which differs per filter bar. */
  className?: string;
  children: React.ReactNode;
}

/**
 * Native selects render their own arrow flush against the border in most
 * browsers; appearance-none plus a manually-placed chevron gives it real
 * breathing room instead.
 */
export function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  className = '',
  children,
}: FilterSelectProps<T>) {
  return (
    <div className={`relative ${className}`}>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={`${FILTER_INPUT_CLASSES} appearance-none pl-3 pr-9 text-on-surface-variant`}
      >
        {children}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-on-surface-variant"
      />
    </div>
  );
}
