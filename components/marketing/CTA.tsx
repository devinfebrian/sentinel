'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';

export function CTA() {
  return (
    <section className="py-28 bg-surface relative overflow-hidden">
      {/* Subtle texture */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(45deg, currentColor 1px, transparent 1px), linear-gradient(-45deg, currentColor 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 mx-auto max-w-3xl px-4 text-center"
      >
        <h2 className="font-display text-[2rem] md:text-[2.75rem] leading-[1.15] tracking-tight text-on-surface">
          Stop chasing manual audits
        </h2>
        <p className="mt-4 text-body-lg text-on-surface-variant">
          Try Sentinel for free during early access. Set up in under 5 minutes.
        </p>
        <div className="mt-10 flex flex-col items-center">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-full bg-on-surface pl-7 pr-3 py-3 text-label-lg font-semibold text-surface transition-transform hover:scale-[1.03] dark:bg-primary dark:text-on-primary"
          >
            Get started
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface/20">
              <ArrowUpRightIcon className="h-4 w-4" />
            </span>
          </Link>
          <p className="mt-5 text-label-sm font-semibold text-outline">
            No credit card required
          </p>
        </div>
      </motion.div>
    </section>
  );
}
