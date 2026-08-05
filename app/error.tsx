'use client';

import React, { useEffect } from 'react';

/**
 * Next 16.2 signature: `unstable_retry`, not the older `reset`.
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error('[APP ERROR]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-margin-mobile bg-background">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl border border-outline-variant p-8 text-center">
        <span className="material-symbols-outlined text-error text-4xl">error</span>
        <h1 className="font-headline-md text-headline-md text-on-surface mt-4">
          Something went wrong
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">
          The page could not be displayed. You can try again, or sign in once more if the problem
          continues.
        </p>

        {/* The digest is the only detail worth surfacing — it identifies the
            server-side log entry without exposing the error itself. */}
        {error.digest && (
          <p className="font-label-sm text-label-sm text-outline mt-4">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-6 flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="py-3 px-5 bg-primary-container text-on-primary-fixed rounded font-label-sm text-label-sm uppercase hover:bg-primary-fixed transition-colors"
          >
            Try again
          </button>
          <a
            href="/login"
            className="py-3 px-5 border border-outline-variant text-on-surface rounded font-label-sm text-label-sm uppercase hover:bg-surface-container transition-colors"
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
