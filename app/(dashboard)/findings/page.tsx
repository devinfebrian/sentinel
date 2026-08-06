import React from 'react';
import type { Metadata } from 'next';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import ComingSoon from '@/components/common/ComingSoon';

export const metadata: Metadata = {
  title: 'Findings - Sentinel',
};

export default function FindingsPage() {
  return (
    <ComingSoon
      icon={ShieldExclamationIcon}
      title="Findings"
      description="Risk-scored results from the audit pipeline, each with the evidence and provenance behind it."
    />
  );
}
