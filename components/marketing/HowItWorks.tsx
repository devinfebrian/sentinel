'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ClipboardDocumentCheckIcon,
  SparklesIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const STEPS = [
  {
    icon: ClipboardDocumentCheckIcon,
    title: 'Import your data',
    description:
      'Add your vendors and import your transaction history. We handle the heavy lifting of organizing the raw data.',
  },
  {
    icon: SparklesIcon,
    title: 'AI handles the audit',
    description:
      'The agent monitors payment status and flags the right anomalies at the right time.',
  },
  {
    icon: ChartBarIcon,
    title: 'Get insights, instantly',
    description:
      'View clear findings with risk scores. Funds settle in real time with on-chain verification.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-surface relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* ── Left: Steps ── */}
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-display text-[2rem] md:text-[2.5rem] leading-[1.15] tracking-tight text-on-surface mb-12"
            >
              How it works
            </motion.h2>

            <div className="space-y-10">
              {STEPS.map((step, idx) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * idx }}
                  className="flex gap-5"
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-highest text-on-surface">
                      <step.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-body-md text-on-surface-variant leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Right: App screenshot in a browser frame ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Decorative gradient blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-primary-container/40 via-transparent to-[#E1BEE7]/30 rounded-[60px] blur-[60px] -z-10" />

            {/* Browser chrome frame */}
            <div className="rounded-2xl overflow-hidden border border-outline-variant/30 shadow-2xl bg-surface-container-highest">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-high border-b border-outline-variant/20">
                <span className="h-3 w-3 rounded-full bg-error/60" />
                <span className="h-3 w-3 rounded-full bg-warning/60" />
                <span className="h-3 w-3 rounded-full bg-success/60" />
                <span className="ml-3 text-[11px] font-medium text-on-surface-variant/60">
                  sentinel.app/dashboard
                </span>
              </div>
              {/* Screenshot */}
              <Image
                src="/app_screenshot.png"
                alt="Sentinel App Dashboard"
                width={1200}
                height={800}
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
