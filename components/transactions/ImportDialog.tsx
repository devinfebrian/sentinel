'use client';

import React, { useState } from 'react';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportDialog({ isOpen, onClose }: ImportDialogProps) {
  const [showToast, setShowToast] = useState(false);

  if (!isOpen && !showToast) return null;

  const handleSimulate = () => {
    onClose();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <>
      {/* Import Excel Multi-Step Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dialog Overlay */}
          <div
            className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Dialog Box */}
          <div className="bg-surface-container-lowest rounded-xl shadow-ambient-lvl-2 border border-outline-variant/30 w-full max-w-2xl relative z-10 flex flex-col overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="px-6 py-4 border-b border-surface-variant flex justify-between items-center bg-surface">
              <h3 className="font-headline-md text-[20px] font-bold text-on-surface">Import Ledger Data</h3>
              <button
                className="text-on-surface-variant hover:bg-surface-container p-1 rounded transition-colors"
                onClick={onClose}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            {/* Stepper Indicator */}
            <div className="px-6 py-3 bg-surface-container-low border-b border-surface-variant flex gap-2 items-center font-label-sm text-[11px] font-semibold">
              <span className="text-on-surface flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">1</span>
                Upload
              </span>
              <div className="w-8 h-px bg-outline-variant/50" />
              <span className="text-on-surface-variant flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center">2</span>
                Map Columns
              </span>
              <div className="w-8 h-px bg-outline-variant/50" />
              <span className="text-on-surface-variant flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center">3</span>
                Validate
              </span>
            </div>
            {/* Content Area (Step 1: Upload Active) */}
            <div className="p-8 flex flex-col items-center justify-center bg-background min-h-[300px]">
              <div className="w-full max-w-md border-2 border-dashed border-outline-variant/50 rounded-xl bg-surface-container-lowest p-8 flex flex-col items-center text-center hover:border-primary transition-colors cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4 group-hover:bg-primary-container transition-colors">
                  <span className="material-symbols-outlined text-[32px] text-tertiary group-hover:text-on-primary-container">upload_file</span>
                </div>
                <h4 className="font-headline-md text-[16px] font-semibold text-on-surface mb-1">Drag and drop your Excel file</h4>
                <p className="font-body-md text-[13px] text-on-surface-variant mb-4">Supported formats: .xlsx, .csv (Max 50MB)</p>
                <button className="px-4 py-2 bg-surface border border-outline-variant/50 rounded-lg text-on-surface font-label-sm text-label-sm font-semibold hover:bg-surface-container transition-colors shadow-ambient-lvl-1">
                  Browse Files
                </button>
              </div>
              <div className="w-full max-w-md mt-6 ai-glow bg-surface-container-lowest rounded-lg p-3 flex items-start gap-3 border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">auto_awesome</span>
                <div>
                  <p className="font-label-sm text-label-sm font-semibold text-on-surface mb-0.5">AI Auto-Mapping enabled</p>
                  <p className="font-body-md text-[12px] text-on-surface-variant">Our models will automatically detect and map headers based on historical ledger structures.</p>
                </div>
              </div>
            </div>
            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-surface-variant bg-surface flex justify-end gap-3">
              <button
                className="px-5 py-2 rounded-lg text-on-surface-variant font-label-sm text-label-sm font-semibold hover:bg-surface-container transition-colors"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-primary-container text-on-primary-container font-label-sm text-label-sm font-semibold hover:bg-primary-fixed transition-colors shadow-ambient-lvl-1 flex items-center gap-2"
                onClick={handleSimulate}
              >
                Simulate Upload <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-lg shadow-ambient-lvl-2 font-body-md text-sm flex items-center gap-3 z-50 animate-fade-in">
          <span className="material-symbols-outlined text-primary-container">check_circle</span>
          <div>
            <p className="font-semibold">Import Started</p>
            <p className="text-xs text-outline-variant">Processing 1,240 rows. AI mapping in progress.</p>
          </div>
        </div>
      )}
    </>
  );
}
