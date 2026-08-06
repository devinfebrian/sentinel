'use client';

import React, { useState } from 'react';
import {
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

export interface TempPasswordPanelProps {
  email: string;
  tempPassword: string;
  notice: string;
  onDone: () => void;
}

export default function TempPasswordPanel({
  email,
  tempPassword,
  notice,
  onDone,
}: TempPasswordPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail (insecure context, permissions). The
      // password stays select-all below so it can still be copied by hand.
    }
  };

  return (
    <div className="p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
        <KeyIcon aria-hidden="true" className="h-8 w-8 text-on-secondary-container" />
      </div>

      <h2 className="mb-2 font-headline-md text-headline-md text-on-surface">
        Registration Complete
      </h2>
      <p className="mb-6 font-body-md text-body-md text-on-surface-variant">
        Temporary password generated for <strong className="text-on-surface">{email}</strong>.
      </p>

      <button
        type="button"
        onClick={handleCopy}
        title="Click to copy"
        className="group relative mb-4 w-full cursor-pointer rounded-lg border border-surface-container-high bg-surface-container-low p-4 transition-colors hover:bg-surface-container"
      >
        <div className="select-all font-mono text-2xl font-bold tracking-wider text-on-surface">
          {tempPassword}
        </div>
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-surface-container/90 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface">
            <ClipboardDocumentIcon aria-hidden="true" className="h-4 w-4" />
            {copied ? 'Copied' : 'Copy to clipboard'}
          </span>
        </div>
      </button>

      <div className="mb-6 flex items-start gap-2 rounded-lg border border-error-container bg-error-container/30 p-3 text-left">
        <ExclamationTriangleIcon
          aria-hidden="true"
          className="mt-0.5 h-[18px] w-[18px] shrink-0 text-error"
        />
        <p className="text-xs leading-tight text-on-surface-variant">{notice}</p>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="h-12 w-full rounded-lg bg-secondary font-label-sm text-label-sm text-on-secondary transition-colors hover:bg-secondary/90"
      >
        Close &amp; Continue
      </button>
    </div>
  );
}
