import React from 'react';
import type { Metadata } from 'next';
import FindingsClient from '@/components/findings/FindingsClient';

export const metadata: Metadata = {
  title: 'Findings - Sentinel',
};

// Server shell purely so `metadata` can be exported; the page itself streams a
// live run and has to be a client component. Same split as /ask.
export default function FindingsPage() {
  return <FindingsClient />;
}
