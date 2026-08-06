'use client';

import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Actions pinned to a tinted bar at the bottom, outside the scrolling body. */
  footer?: React.ReactNode;
  /** Drops the body padding so the content can own the whole panel. */
  bare?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  bare = false,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${SIZE_CLASSES[size]} max-h-[90vh] overflow-hidden rounded-xl border border-outline-variant/30 bg-surface card-shadow`}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-surface-container-high px-6 py-5">
            <h2 id="modal-title" className="font-headline-md text-headline-md text-on-surface">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1 text-on-surface-variant transition-colors hover:text-on-surface"
            >
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
        )}
        <div className={`max-h-[70vh] overflow-y-auto ${bare ? '' : 'p-6'}`}>{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-surface-container-high bg-surface-container-low px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
