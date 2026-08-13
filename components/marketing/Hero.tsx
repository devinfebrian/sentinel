'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { GridFollowCursor } from '@/components/marketing/GridFollowCursor';

export function Hero() {
  return (
    <section className="relative pt-28 pb-0 overflow-hidden lg:pt-36">
      {/* Warm gradient background — yellow to lavender like Aivoryn */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDE7] via-surface to-[#F3E5F5]/40 dark:from-primary/25 dark:via-surface dark:to-[#F3E5F5]/5" />
        {/* Interactive grid that follows the cursor */}
        <GridFollowCursor />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mx-auto max-w-5xl font-display text-display text-[2.5rem] leading-[1.1] sm:text-[3.5rem] md:text-[4.5rem] md:leading-[1.05] tracking-tight text-on-surface"
        >
          Audit Smarter,{' '}
          <br className="hidden sm:block" />
          Every Time
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="mx-auto mt-6 max-w-2xl font-body-lg text-body-lg text-on-surface-variant md:text-lg leading-relaxed"
        >
          Import transactions, manage vendors, and let an autonomous
          AI&nbsp;agent audit your financial records&nbsp;— automatically.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-full bg-on-surface pl-7 pr-3 py-3 text-label-lg font-semibold text-surface transition-transform hover:scale-[1.03] dark:bg-primary dark:text-on-primary"
          >
            Start for free
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface/20">
              <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>
          <Link
            href="#how-it-works"
            className="text-label-lg font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            See how it works
          </Link>
        </motion.div>

        {/* Hero Image — Large floating illustration */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: 'easeOut' }}
          className="relative mx-auto mt-16 w-full max-w-xs md:max-w-sm"
        >
          {/* Gradient mesh behind the image */}
          <div className="absolute inset-0 scale-125 bg-gradient-to-br from-primary-container/60 via-transparent to-[#E1BEE7]/40 rounded-full blur-[80px] -z-10" />

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          >
            <Image
              src="/hero.png"
              alt="Sentinel AI Financial Audit Illustration"
              width={800}
              height={800}
              className="w-full h-auto object-contain drop-shadow-2xl"
              priority
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
