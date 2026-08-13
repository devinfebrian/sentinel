'use client';

import React, { useRef, forwardRef } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  DocumentMagnifyingGlassIcon,
  BuildingLibraryIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesIconSolid } from '@heroicons/react/24/solid';
import { SiPostgresql, SiGooglegemini } from 'react-icons/si';
import { AnimatedBeam } from '@/components/ui/animated-beam';
import { cn } from '@/lib/utils';

/* ─── Animated Beam Pipeline ─── */
const Circle = forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode }>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "z-10 flex size-11 items-center justify-center rounded-full bg-white shadow-md dark:bg-surface-container-low",
          className
        )}
      >
        {children}
      </div>
    );
  }
);
Circle.displayName = 'Circle';

function NodeLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-medium uppercase tracking-wide text-inverse-on-surface/60 whitespace-nowrap">
      {children}
    </span>
  );
}

function AnimatedBeamPipeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const psqlRef = useRef<HTMLDivElement>(null);
  const agent1Ref = useRef<HTMLDivElement>(null);
  const agent2Ref = useRef<HTMLDivElement>(null);
  const agent3Ref = useRef<HTMLDivElement>(null);
  const insightRef = useRef<HTMLDivElement>(null);

  // Thin, quiet gray line like the reference — the earlier bright/thick
  // stroke was what made the whole diagram feel loud instead of clean.
  const beamProps = {
    pathColor: '#6b7280',
    pathOpacity: 0.35,
    pathWidth: 1.5,
    gradientStartColor: '#c3d661',
    gradientStopColor: '#4285F4',
  };

  return (
    <div
      className="relative flex w-full max-w-[420px] items-center justify-center p-4"
      ref={containerRef}
    >
      <div className="flex w-full flex-row items-center justify-between gap-10 sm:gap-14">
        {/* Left: PSQL */}
        <div className="flex flex-col justify-center">
          <div className="flex flex-col items-center gap-2">
            <Circle ref={psqlRef}>
              <SiPostgresql size={21} className="text-[#336791] dark:text-[#5DADE2]" />
            </Circle>
            <NodeLabel>SQL Query</NodeLabel>
          </div>
        </div>

        {/* Middle: Agent 1 and 2 */}
        <div className="flex flex-col gap-10">
          <div className="flex flex-col items-center gap-2">
            <Circle ref={agent1Ref}>
              <SiGooglegemini size={18} className="text-[#4285F4]" />
            </Circle>
            <NodeLabel>Agent 1</NodeLabel>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Circle ref={agent2Ref}>
              <SiGooglegemini size={18} className="text-[#4285F4]" />
            </Circle>
            <NodeLabel>Agent 2</NodeLabel>
          </div>
        </div>

        {/* Agent 3 */}
        <div className="flex flex-col justify-center">
          <div className="flex flex-col items-center gap-2">
            <Circle ref={agent3Ref}>
              <SiGooglegemini size={21} className="text-[#4285F4]" />
            </Circle>
            <NodeLabel>Agent 3</NodeLabel>
          </div>
        </div>

        {/* Right: Findings — the pipeline's output node */}
        <div className="flex flex-col justify-center">
          <div className="flex flex-col items-center gap-2">
            <Circle ref={insightRef}>
              <SparklesIconSolid className="h-[21px] w-[21px] text-[#c8e600]" />
            </Circle>
            <NodeLabel>Findings</NodeLabel>
          </div>
        </div>
      </div>

      {/* Curvature sign follows each beam's actual direction (up vs. down)
          so the control point bows the same way the line already travels —
          the earlier mismatched signs pulled each curve against itself,
          reading as a fish shape instead of a clean fan-in/fan-out. */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={psqlRef}
        toRef={agent1Ref}
        curvature={25}
        {...beamProps}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={psqlRef}
        toRef={agent2Ref}
        curvature={-25}
        {...beamProps}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={agent1Ref}
        toRef={agent3Ref}
        curvature={-25}
        {...beamProps}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={agent2Ref}
        toRef={agent3Ref}
        curvature={25}
        {...beamProps}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={agent3Ref}
        toRef={insightRef}
        curvature={0}
        {...beamProps}
      />
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="py-24 bg-surface-container-lowest">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header — left headline + right description like reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14"
        >
          <h2 className="max-w-md font-display text-[2rem] md:text-[2.5rem] leading-[1.15] tracking-tight text-on-surface">
            Turn manual audits into automated insights
          </h2>
          <p className="max-w-sm text-body-md text-on-surface-variant md:text-right">
            Transaction recording, vendor verification, and risk auditing
            powered by an autonomous finance agent.
          </p>
        </motion.div>

        {/* ── Row 1: Large bento card with mockup ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative rounded-3xl border border-outline-variant/30 bg-inverse-surface overflow-hidden p-8 md:p-10 mb-6"
        >
          {/* Subtle radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-primary/8 rounded-full blur-[80px]" />

          <div className="relative z-10 flex flex-col md:flex-row gap-10 md:gap-16 items-start">
            {/* Text */}
            <div className="flex-1">
              <h3 className="font-headline-md text-headline-md font-semibold text-inverse-on-surface">
                AI Audit Pipeline
              </h3>
              <p className="mt-3 max-w-md text-body-md text-inverse-on-surface/70 leading-relaxed">
                Reads your transactions, auto-flags anomalies as findings,
                and surfaces them for your team to review and&nbsp;resolve.
              </p>
            </div>
            {/* Animated Pipeline */}
            <div className="flex-shrink-0 self-center md:self-start w-full md:w-auto">
              <AnimatedBeamPipeline />
            </div>
          </div>
        </motion.div>

        {/* ── Row 2: Three smaller feature cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: DocumentMagnifyingGlassIcon,
              title: 'Transaction Sync',
              description:
                'Import and reconcile your financial records automatically.',
              delay: 0.2,
            },
            {
              icon: BuildingLibraryIcon,
              title: 'Vendor Intelligence',
              description:
                'Keep counterparties named, verified, and current.',
              delay: 0.3,
            },
            {
              icon: SparklesIcon,
              title: 'Ask Sentinel',
              description:
                'Query your financial data in plain language.',
              delay: 0.4,
            },
          ].map((card) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: card.delay }}
              className="rounded-3xl border border-outline-variant/30 bg-surface-container p-7 flex flex-col"
            >
              <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                {card.title}
              </h4>
              <p className="mt-2 text-body-sm text-on-surface-variant flex-1">
                {card.description}
              </p>
              {/* Decorative icon cluster */}
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-highest text-on-surface">
                  <card.icon className="h-5 w-5" />
                </div>
                <div className="h-10 w-10 rounded-xl bg-surface-container-high" />
                <div className="h-10 w-10 rounded-xl bg-surface-container-high/60" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
