import React from 'react';
import type { Metadata } from 'next';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { AskSentinel } from '@/components/dashboard/AskSentinel';

export const metadata: Metadata = {
  title: 'Ask Sentinel - Sentinel',
};

export default function AskPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      <AskSentinel />
    </div>
  );
}
