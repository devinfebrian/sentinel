'use client';

import React from 'react';

export function Marquee() {
  const items = Array.from({ length: 12 });

  return (
    <div className="bg-on-surface overflow-hidden py-3.5 select-none dark:bg-primary">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((_, i) => (
          <span
            key={`a-${i}`}
            className="mx-6 text-sm font-semibold tracking-wide text-surface dark:text-on-primary"
          >
            Start for free{' '}
            <span className="mx-3 text-surface/60 dark:text-on-primary/60">✦</span>
          </span>
        ))}
        {/* Duplicate for seamless loop */}
        {items.map((_, i) => (
          <span
            key={`b-${i}`}
            className="mx-6 text-sm font-semibold tracking-wide text-surface dark:text-on-primary"
          >
            Start for free{' '}
            <span className="mx-3 text-surface/60 dark:text-on-primary/60">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
