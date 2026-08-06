'use client';

import React, { useState } from 'react';
import AlertNotice from '@/components/common/AlertNotice';
import PrimaryButton from '@/components/common/PrimaryButton';

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
    <div className="space-y-4 text-left">
      <p className="font-body-md text-body-md text-on-surface-variant">
        Temporary password generated for <strong className="text-on-surface">{email}</strong>.
      </p>

      <button
        type="button"
        onClick={handleCopy}
        className="w-full flex items-center justify-between gap-3 bg-surface-container-high rounded-lg px-4 py-3 hover:bg-surface-container transition-colors"
        title="Click to copy"
      >
        <span className="font-mono text-body-lg text-on-surface select-all tracking-wide">
          {tempPassword}
        </span>
        <span className="material-symbols-outlined text-on-surface-variant text-[20px] shrink-0">
          {copied ? 'check' : 'content_copy'}
        </span>
      </button>

      <AlertNotice variant="error" icon="warning" message={notice} />

      <PrimaryButton type="button" onClick={onDone} icon="">
        Done
      </PrimaryButton>
    </div>
  );
}
