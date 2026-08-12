import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export function DataLoadingSkeleton({ columns = 4, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <div className="w-full animate-pulse p-4">
      <div className="flex border-b border-surface-container-high pb-3 mb-4 gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-surface-container-high rounded flex-1"></div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex border-b border-surface-container-low py-4 gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-surface-container rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function DataErrorState({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 my-4 text-center rounded-xl border border-error-container/50 bg-error-container/10">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-container text-on-error-container mb-4">
        <ExclamationTriangleIcon className="h-6 w-6" />
      </div>
      <h3 className="text-label-lg font-bold text-on-surface mb-2">Gagal Memuat Data</h3>
      <p className="text-body-sm text-on-surface-variant mb-6 max-w-sm">
        {message || 'Terjadi kesalahan saat memuat data. Silakan periksa koneksi Anda dan coba lagi.'}
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 rounded-lg bg-primary-container px-4 py-2 text-label-sm font-semibold text-on-primary-container transition-colors hover:bg-primary-fixed"
      >
        <ArrowPathIcon className="h-4 w-4" />
        Coba Lagi
      </button>
    </div>
  );
}
