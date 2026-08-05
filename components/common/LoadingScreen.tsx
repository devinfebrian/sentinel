import React from 'react';

export interface LoadingScreenProps {
  message?: string;
  /** Fills the parent instead of the viewport, for use inside the dashboard shell. */
  inline?: boolean;
}

/**
 * Rendered identically on the server and on the first client pass, which is
 * what keeps session restoration free of hydration mismatches.
 */
export default function LoadingScreen({
  message = 'Loading',
  inline = false,
}: LoadingScreenProps) {
  return (
    <div
      className={`${inline ? 'h-full w-full' : 'min-h-screen bg-background'} flex items-center justify-center`}
    >
      <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin">
          progress_activity
        </span>
        <span className="font-label-lg text-label-lg text-primary font-bold">{message}</span>
      </div>
    </div>
  );
}
