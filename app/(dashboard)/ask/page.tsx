import React from 'react';
import type { Metadata } from 'next';
import { SparklesIcon } from '@heroicons/react/24/outline';
import ComingSoon from '@/components/common/ComingSoon';

export const metadata: Metadata = {
  title: 'Ask Sentinel - Sentinel',
};

export default function AskPage() {
  return (
    <ComingSoon
      icon={SparklesIcon}
      title="Ask Sentinel"
      description="Ask questions about your transactions and vendors in plain language, and get answers traced back to the records."
    />
  );
}
