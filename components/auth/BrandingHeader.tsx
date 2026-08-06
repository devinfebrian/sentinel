import React from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';

export interface BrandingHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function BrandingHeader({
  title = 'Sentinel',
  subtitle = 'Enterprise Finance',
}: BrandingHeaderProps) {
  return (
    <div className="flex flex-col items-center mb-8 text-center">
      <span className="bg-on-surface p-3 rounded-lg mb-4">
        <ShieldCheckIcon aria-hidden="true" className="h-6 w-6 text-primary-container" />
      </span>
      <h1 className="font-headline-lg text-headline-lg md:text-headline-lg text-on-surface font-bold tracking-tight">
        {title}
      </h1>
      <p
        key={subtitle}
        className="font-label-sm text-label-sm text-on-surface-variant text-center mt-1.5 px-2 max-w-sm transition-all duration-300 animate-fade-in"
      >
        {subtitle}
      </p>
    </div>
  );
}
