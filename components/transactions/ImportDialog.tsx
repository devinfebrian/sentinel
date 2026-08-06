'use client';

import React, { useState } from 'react';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  DocumentArrowUpIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import Modal from '@/components/common/Modal';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportDialog({ isOpen, onClose }: ImportDialogProps) {
  const [showToast, setShowToast] = useState(false);

  const handleSimulate = () => {
    onClose();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <>
      <Modal
        open={isOpen}
        onClose={onClose}
        title="Import Ledger Data"
        size="xl"
        bare
        footer={
          <>
            <button
              type="button"
              className="h-10 rounded-lg px-4 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-lg bg-primary-container px-5 font-label-sm text-label-sm text-on-primary-container transition-colors hover:bg-primary-fixed"
              onClick={handleSimulate}
            >
              Simulate Upload
              <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
            </button>
          </>
        }
      >
        {/* Stepper. `bare` drops the modal's body padding so this strip can span
            the full width like the header above it. */}
        <div className="flex items-center gap-2 border-b border-surface-container-high bg-surface-container-low px-6 py-3 font-label-sm text-[11px] font-semibold">
          <span className="flex items-center gap-1 text-on-surface">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
              1
            </span>
            Upload
          </span>
          <div className="h-px w-8 bg-outline-variant/50" />
          <span className="flex items-center gap-1 text-on-surface-variant">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant">
              2
            </span>
            Map Columns
          </span>
          <div className="h-px w-8 bg-outline-variant/50" />
          <span className="flex items-center gap-1 text-on-surface-variant">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant">
              3
            </span>
            Validate
          </span>
        </div>

        <div className="flex min-h-[300px] flex-col items-center justify-center bg-background p-8">
          <div className="group flex w-full max-w-md cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-outline-variant/50 bg-surface p-8 text-center transition-colors hover:border-primary">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container transition-colors group-hover:bg-primary-container">
              <DocumentArrowUpIcon
                aria-hidden="true"
                className="h-6 w-6 text-tertiary group-hover:text-on-primary-container"
              />
            </div>
            <h4 className="mb-1 font-headline-sm text-headline-sm text-on-surface">
              Drag and drop your Excel file
            </h4>
            <p className="mb-4 font-body-sm text-body-sm text-on-surface-variant">
              Supported formats: .xlsx, .csv (Max 50MB)
            </p>
            <button
              type="button"
              className="h-10 rounded-lg border border-outline-variant/50 bg-surface px-4 font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container card-shadow"
            >
              Browse Files
            </button>
          </div>

          <div className="mt-6 flex w-full max-w-md items-start gap-3 rounded-lg border border-surface-container-high bg-surface p-3 ai-glow">
            <SparklesIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="mb-0.5 font-label-sm text-label-sm text-on-surface">
                AI Auto-Mapping enabled
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Our models will automatically detect and map headers based on historical ledger
                structures.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Sits outside the dialog on purpose: it appears after the modal closes. */}
      {showToast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg bg-inverse-surface px-4 py-3 font-body-sm text-body-sm text-inverse-on-surface shadow-ambient-lvl-2 animate-fade-in"
        >
          <CheckCircleIcon aria-hidden="true" className="h-6 w-6 shrink-0 text-primary-container" />
          <div>
            <p className="font-semibold">Import Started</p>
            <p className="text-xs text-outline-variant">
              Processing 1,240 rows. AI mapping in progress.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
