import React from 'react';
import Link from 'next/link';
import { MagnifyingGlassMinusIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-margin-mobile bg-background">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl border border-outline-variant p-8 text-center">
        <MagnifyingGlassMinusIcon
          aria-hidden="true"
          className="mx-auto h-9 w-9 text-on-surface-variant"
        />
        <h1 className="font-headline-md text-headline-md text-on-surface mt-4">Page not found</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">
          That page does not exist, or it may not have been built yet.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 py-3 px-5 bg-primary-container text-on-primary-fixed rounded font-label-sm text-label-sm uppercase hover:bg-primary-fixed transition-colors"
        >
          Back to Overview
        </Link>
      </div>
    </div>
  );
}
