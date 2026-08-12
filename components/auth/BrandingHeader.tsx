import React from 'react';
import Image from 'next/image';

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
      <span className="relative mb-4 h-16 w-16 shrink-0">
        <Image src="/sentinel_logo.png" alt="" fill priority sizes="64px" className="object-contain" />
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
