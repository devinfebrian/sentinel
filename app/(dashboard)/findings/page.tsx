import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import FindingsClient from '@/components/findings/FindingsClient';
import { DataLoadingSkeleton } from '@/components/common/DataState';

export const metadata: Metadata = {
  title: 'Findings - Sentinel',
};

// Server shell purely so `metadata` can be exported; the page itself streams a
// live run and has to be a client component. Same split as /ask.
//
// Suspense is required, not decorative: FindingsClient reads the `finding`
// deep-link param via useSearchParams(), and a static Client Component that
// calls useSearchParams() without a Suspense boundary above it fails the
// production build.
export default function FindingsPage() {
  return (
    <Suspense fallback={<DataLoadingSkeleton columns={5} rows={6} />}>
      <FindingsClient />
    </Suspense>
  );
}
