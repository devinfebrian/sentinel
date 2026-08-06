'use client';

import React from 'react';
import Link from 'next/link';
import {
  BuildingStorefrontIcon,
  DocumentTextIcon,
  ShieldExclamationIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/stores/auth.store';
import { formatTimestamp } from '@/lib/format/datetime';
import type { IconComponent } from '@/lib/types/icon';
import { BlurFade } from '@/components/ui/blur-fade';
import { MagicCard } from '@/components/ui/magic-card';
import { Particles } from '@/components/ui/particles';

interface ShowcaseCard {
  icon: IconComponent;
  title: string;
  description: string;
  href: string;
  cta: string;
  /** Route exists but is a placeholder until the AI service lands in Sprint 2. */
  soon?: boolean;
}

const SHOWCASE: ShowcaseCard[] = [
  {
    icon: DocumentTextIcon,
    title: 'Transactions',
    description: 'Record income and expenses, or import an existing ledger in bulk.',
    href: '/transactions',
    cta: 'Open transactions',
  },
  {
    icon: BuildingStorefrontIcon,
    title: 'Vendors',
    description: 'Keep the counterparties behind your spending named and current.',
    href: '/vendors',
    cta: 'Manage vendors',
  },
  {
    icon: ShieldExclamationIcon,
    title: 'Findings',
    description: 'Risk-scored results from the audit pipeline, with the evidence behind each.',
    href: '/findings',
    cta: 'Preview',
    soon: true,
  },
  {
    icon: SparklesIcon,
    title: 'Ask Sentinel',
    description: 'Ask about your transactions and vendors in plain language.',
    href: '/ask',
    cta: 'Preview',
    soon: true,
  },
];

const QUICK_START = [
  {
    title: 'Add your vendors',
    body: 'Most expense categories need a named counterparty, so start here.',
    href: '/vendors',
    linkText: 'Go to vendors',
  },
  {
    title: 'Record or import transactions',
    body: 'Enter them one at a time, or import a spreadsheet of existing rows.',
    href: '/transactions',
    linkText: 'Go to transactions',
  },
  {
    title: 'Run an audit',
    body: 'Sentinel reviews the ledger and reports what looks wrong. Arriving in Sprint 2.',
    href: '/findings',
    linkText: 'Preview findings',
  },
];

function SoonPill() {
  return (
    <span className="shrink-0 rounded-full bg-surface-container-high px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-outline">
      Soon
    </span>
  );
}

export default function OverviewPage() {
  const user = useAuthStore((s) => s.user);

  // AuthGate holds the shell until the session resolves, so user is set here.
  if (!user) return null;

  const firstName = user.fullname.split(' ')[0];
  const roleLabel = user.isAdmin ? 'Finance Lead' : 'Finance Staff';

  return (
    // The shell no longer spaces a page's top-level children, so the rhythm
    // lives here — same stack-lg / stack-md pairing as the other pages.
    <div className="space-y-stack-lg">
      {/* No panel: the welcome sits directly on the app canvas, with the
          particle field bleeding past the page padding so it reads as
          atmosphere rather than as a boxed-in hero. */}
      <section className="relative -mx-4 px-4 pb-4 pt-10 text-center md:-mx-container-padding md:px-container-padding md:pt-16">
        <Particles
          className="absolute inset-0"
          quantity={90}
          size={0.5}
          staticity={40}
          maxAlpha={0.28}
          color="#576400"
        />

        <div className="relative z-10 mx-auto max-w-2xl">
          <BlurFade>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/60 bg-surface-container-lowest/70 px-3 py-1 font-label-sm text-label-sm uppercase text-on-surface-variant backdrop-blur-sm">
              <SparklesIcon aria-hidden="true" className="h-3.5 w-3.5 text-primary" />
              AI Financial Analyst
            </span>
          </BlurFade>

          <BlurFade delay={0.1}>
            <h1 className="mt-5 font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
              Let&rsquo;s get started, {firstName}
            </h1>
          </BlurFade>

          <BlurFade delay={0.2}>
            <p className="mt-4 font-body-md text-body-md text-on-surface-variant">
              Sentinel audits your company&rsquo;s financial records. Set up your ledger here, and
              the analysis follows from it.
            </p>
          </BlurFade>

          <BlurFade delay={0.3}>
            <p className="mt-5 font-label-sm text-label-sm text-outline">
              Signed in as {roleLabel} &middot; Last sign-in{' '}
              {formatTimestamp(user.lastLoginAt, 'first time here')}
            </p>
          </BlurFade>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
        {SHOWCASE.map(({ icon: Icon, ...card }, index) => (
          <BlurFade key={card.href} delay={0.35 + index * 0.08} className="h-full">
            <Link href={card.href} className="block h-full rounded-xl card-shadow">
              <MagicCard className="h-full rounded-xl">
                <div className="group/card flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
                      <Icon aria-hidden="true" className="h-6 w-6" />
                    </span>
                    {card.soon && <SoonPill />}
                  </div>

                  <h2 className="mt-4 font-headline-sm text-headline-sm text-on-surface">
                    {card.title}
                  </h2>
                  <p className="mt-2 flex-1 font-body-sm text-body-sm text-on-surface-variant">
                    {card.description}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-1 font-label-sm text-label-sm text-primary">
                    {card.cta}
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover/card:translate-x-1"
                    >
                      &rarr;
                    </span>
                  </span>
                </div>
              </MagicCard>
            </Link>
          </BlurFade>
        ))}
      </div>

      <BlurFade inView delay={0.1}>
        <section className="relative overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 card-shadow ai-glow">
          <h2 className="font-headline-md text-headline-md text-on-surface">Quick start</h2>

          <ol className="mt-stack-sm space-y-stack-sm">
            {QUICK_START.map((step, index) => (
              <li key={step.href} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-container font-label-sm text-label-sm text-on-primary-container"
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-body-md text-body-md font-semibold text-on-surface">
                    {step.title}
                  </p>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                    {step.body}
                  </p>
                  <Link
                    href={step.href}
                    className="mt-1.5 inline-flex items-center gap-1 font-label-sm text-label-sm text-primary hover:underline"
                  >
                    {step.linkText}
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </BlurFade>
    </div>
  );
}
