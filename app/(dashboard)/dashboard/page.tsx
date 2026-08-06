import React from 'react';
import type { Metadata } from 'next';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import ComingSoon from '@/components/common/ComingSoon';

export const metadata: Metadata = {
  title: 'Dashboard - Sentinel',
};

export default function DashboardPage() {
  return (
    <ComingSoon
      icon={ChartBarIcon}
      title="Dashboard"
      description="Spend and cash-flow statistics across the ledger — totals, category breakdowns, and trends over time."
      milestone="a later sprint"
    />
  );
}
