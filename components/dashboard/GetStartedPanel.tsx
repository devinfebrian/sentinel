'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronUpIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { ACCENT_CARD_BG, type Accent } from '@/lib/theme/accent';

export interface GetStartedStep {
  /** Isometric sticker from public/illust, shown in the step's detail panel. */
  illustration: string;
  title: string;
  body: string;
  href: string;
  linkText: string;
  accent: Accent;
}

export function GetStartedPanel({ steps }: { steps: GetStartedStep[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const active = steps[activeIndex];
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeInOut' as const };

  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest card-shadow">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <SparklesIcon aria-hidden="true" className="h-4 w-4 text-primary" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Get started</h2>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-1 font-label-sm text-label-sm font-semibold text-on-surface-variant transition-colors hover:text-on-surface"
        >
          {collapsed ? 'Expand' : 'Collapse'}
          <motion.span
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={transition}
            className="flex"
          >
            <ChevronUpIcon aria-hidden="true" className="h-3.5 w-3.5" />
          </motion.span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transition}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 border-t border-outline-variant/30 px-4 py-3">
              {steps.map((step, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={step.href}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      'flex items-center gap-2 rounded-full px-3 py-1.5 font-label-sm text-label-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-surface-container text-on-surface card-shadow'
                        : 'text-on-surface-variant hover:text-on-surface'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                        isActive ? 'bg-on-surface text-surface' : 'bg-outline-variant/40 text-on-surface-variant'
                      )}
                    >
                      {index + 1}
                    </span>
                    {step.title}
                  </button>
                );
              })}
            </div>

            <div className="relative border-t border-outline-variant/30">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active.href}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                  transition={transition}
                  className={cn(
                    'relative overflow-hidden p-6',
                    ACCENT_CARD_BG[active.accent]
                  )}
                >
                  <Image
                    src={active.illustration}
                    alt=""
                    aria-hidden="true"
                    width={320}
                    height={320}
                    priority
                    className="pointer-events-none absolute -bottom-10 right-20 hidden h-64 w-64 object-contain opacity-50 sm:block"
                  />

                  <div className="relative z-10 max-w-md">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">{active.title}</h3>
                    <p className="mt-2 font-body-md text-body-md text-on-surface-variant">{active.body}</p>
                    <Link
                      href={active.href}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-on-surface px-4 py-2 font-label-sm text-label-sm font-semibold text-surface transition-opacity hover:opacity-90"
                    >
                      {active.linkText}
                      <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
