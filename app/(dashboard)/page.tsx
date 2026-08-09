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
import { Particles } from '@/components/ui/particles';
import { Text3DFlip } from '@/components/ui/text-3d-flip';
import { GetStartedPanel, type GetStartedStep } from '@/components/dashboard/GetStartedPanel';
import {
  ACCENT_BLOCK_CTA,
  ACCENT_BLOCK_GRADIENT,
  ACCENT_CHIP_BG,
  ACCENT_TEXT,
  BLOCK_INK,
  BLOCK_WATERMARK,
  type Accent,
} from '@/lib/theme/accent';

interface ShowcaseCard {
  icon: IconComponent;
  title: string;
  description: string;
  href: string;
  cta: string;
  accent: Accent;
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
    accent: 'blue',
  },
  {
    icon: BuildingStorefrontIcon,
    title: 'Vendors',
    description: 'Keep the counterparties behind your spending named and current.',
    href: '/vendors',
    cta: 'Manage vendors',
    accent: 'mint',
  },
  {
    icon: ShieldExclamationIcon,
    title: 'Findings',
    description: 'Risk-scored results from the audit pipeline, with the evidence behind each.',
    href: '/findings',
    cta: 'Preview',
    accent: 'pink',
    soon: true,
  },
  {
    icon: SparklesIcon,
    title: 'Ask Sentinel',
    description: 'Ask about your transactions and vendors in plain language.',
    href: '/ask',
    cta: 'Preview',
    accent: 'blue',
    soon: true,
  },
];

const QUICK_START: GetStartedStep[] = [
  {
    illustration: '/illust/Isometric Stickers - Paper Airplane.png',
    title: 'Add your vendors',
    body: 'Most expense categories need a named counterparty, so start here.',
    href: '/vendors',
    linkText: 'Go to vendors',
    accent: 'mint',
  },
  {
    illustration: '/illust/Isometric Stickers - Brainstorming.png',
    title: 'Record or import transactions',
    body: 'Enter them one at a time, or import a spreadsheet of existing rows.',
    href: '/transactions',
    linkText: 'Go to transactions',
    accent: 'blue',
  },
  {
    illustration: '/illust/Isometric Stickers - Target.png',
    title: 'Run an audit',
    body: 'Sentinel reviews the ledger and reports what looks wrong. Arriving in Sprint 2.',
    href: '/findings',
    linkText: 'Preview findings',
    accent: 'pink',
  },
];

/** Only ever sits on a solid accent block now, so it's pitch black on a
 * black tint rather than accent-on-accent, which would vanish. */
function SoonPill() {
  return (
    <span
      className={`shrink-0 rounded-full bg-black/10 ${BLOCK_INK} px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em]`}
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
          color="#a3a3a3"
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
              Let&rsquo;s get started,{' '}
              <Text3DFlip
                texts={[firstName, roleLabel]}
                highlights={{
                  0: { textClassName: ACCENT_TEXT.blue, bgClassName: ACCENT_CHIP_BG.blue },
                  1: { textClassName: ACCENT_TEXT.pink, bgClassName: ACCENT_CHIP_BG.pink },
                }}
              />
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

      <BlurFade inView delay={0.3}>
        <GetStartedPanel steps={QUICK_START} />
      </BlurFade>

      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
        {SHOWCASE.map(({ icon: Icon, ...card }, index) => (
          <BlurFade key={card.href} delay={0.35 + index * 0.08} className="h-full">
            <Link
              href={card.href}
              className={`group/card relative block h-full overflow-hidden rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-1 ${ACCENT_BLOCK_GRADIENT[card.accent]}`}
            >
              <Icon
                aria-hidden="true"
                className={`pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 transition-transform duration-300 group-hover/card:scale-110 group-hover/card:rotate-6 ${BLOCK_WATERMARK}`}
              />

              <div className="relative z-10 flex h-full flex-col">
                {card.soon && (
                  <div className="flex justify-end">
                    <SoonPill />
                  </div>
                )}

                <h2 className={`font-headline-sm text-headline-sm font-black ${BLOCK_INK} ${card.soon ? 'mt-2' : 'mt-0'}`}>
                  {card.title}
                </h2>
                <p className={`mt-2 flex-1 font-body-sm text-body-sm ${BLOCK_INK} opacity-70`}>
                  {card.description}
                </p>

                <span
                  className={`mt-4 inline-flex items-center gap-1 font-label-sm text-label-sm font-bold underline ${ACCENT_BLOCK_CTA[card.accent]}`}
                >
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
    </div>
  );
}
