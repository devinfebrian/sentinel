import React from 'react';
import type { IconComponent } from '@/lib/types/icon';

export interface ComingSoonProps {
  icon: IconComponent;
  title: string;
  description: string;
  /** Which sprint delivers this surface, e.g. "Sprint 2". */
  milestone?: string;
}

/**
 * Placeholder for a route that exists so the nav link resolves, but whose
 * backing service has not shipped yet.
 */
export default function ComingSoon({
  icon: Icon,
  title,
  description,
  milestone = 'Sprint 2',
}: ComingSoonProps) {
  return (
    // ai-glow marks the panel as AI-authored — the same treatment these pages
    // will keep once the analysis service backs them.
    <section className="mx-auto flex max-w-xl flex-col items-center gap-stack-sm rounded-xl bg-surface-container-lowest px-8 py-12 text-center card-shadow ai-glow">
      <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
        <Icon aria-hidden="true" className="h-7 w-7" />
      </span>

      <h1 className="font-headline-md text-headline-md text-on-surface">{title}</h1>

      <p className="font-body-md text-body-md text-on-surface-variant">{description}</p>

      <p className="font-label-sm text-label-sm uppercase text-outline">Coming in {milestone}</p>
    </section>
  );
}
