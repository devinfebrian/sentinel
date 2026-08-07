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
import { GlareHover } from '@/components/ui/glare-hover';
import { Particles } from '@/components/ui/particles';

/** Flat saturated fill for the bento block, paired with the near-black ink
 * that sits on top of it — the same block/ink pairing regardless of light
 * or dark theme, since these blocks are meant to read as printed cards
 * rather than as theme-aware surfaces. */
type BlockFill = 'primary' | 'secondary' | 'tertiary' | 'inverse';

const BLOCK_BG: Record<BlockFill, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  tertiary: 'bg-tertiary',
  inverse: 'bg-inverse-surface',
};

const BLOCK_INK = 'text-[#0a0a0a]';
const BLOCK_CHIP = 'bg-black/10';

interface ShowcaseCard {
  icon: IconComponent;
  title: string;
  description: string;
  href: string;
  cta: string;
  fill: BlockFill;
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
    fill: 'primary',
  },
  {
    icon: BuildingStorefrontIcon,
    title: 'Vendors',
    description: 'Keep the counterparties behind your spending named and current.',
    href: '/vendors',
    cta: 'Manage vendors',
    fill: 'secondary',
  },
  {
    icon: ShieldExclamationIcon,
    title: 'Findings',
    description: 'Risk-scored results from the audit pipeline, with the evidence behind each.',
    href: '/findings',
    cta: 'Preview',
    fill: 'inverse',
    soon: true,
  },
  {
    icon: SparklesIcon,
    title: 'Ask Sentinel',
    description: 'Ask about your transactions and vendors in plain language.',
    href: '/ask',
    cta: 'Preview',
    fill: 'tertiary',
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
    <span
      className={`shrink-0 rounded-full ${BLOCK_CHIP} ${BLOCK_INK} px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em]`}
    >
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

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3 lg:items-stretch">
        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:col-span-2">
          {SHOWCASE.map(({ icon: Icon, ...card }, index) => (
            <BlurFade key={card.href} delay={0.35 + index * 0.08} className="h-full">
              <Link
                href={card.href}
                className={`group/card block h-full rounded-2xl ${BLOCK_BG[card.fill]} p-5 shadow-[0_4px_0_0_rgba(0,0,0,0.35)] transition-transform duration-200 hover:-translate-y-1`}
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${BLOCK_CHIP} ${BLOCK_INK}`}>
                      <Icon aria-hidden="true" className="h-6 w-6" />
                    </span>
                    {card.soon && <SoonPill />}
                  </div>

                  <h2 className={`mt-4 font-headline-sm text-headline-sm font-black ${BLOCK_INK}`}>
                    {card.title}
                  </h2>
                  <p className={`mt-2 flex-1 font-body-sm text-body-sm ${BLOCK_INK} opacity-70`}>
                    {card.description}
                  </p>

                  <span className={`mt-4 inline-flex items-center gap-1 font-label-sm text-label-sm font-bold underline ${BLOCK_INK}`}>
                    {card.cta}
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover/card:translate-x-1"
                    >
                      &rarr;
                    </span>
                  </span>
                </div>
              </Link>
            </BlurFade>
          ))}
        </div>

        <BlurFade inView delay={0.1} className="h-full lg:col-span-1">
          <GlareHover
            className="h-full w-full place-items-stretch rounded-xl"
            color="#edff8c"
            opacity={0.35}
            duration={700}
          >
            <section className="relative flex h-full flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 card-shadow">
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
          </GlareHover>
        </BlurFade>
      </div>
    </div>
  );
}
