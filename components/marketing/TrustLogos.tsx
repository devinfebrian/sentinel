'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { OrbitingCircles } from '@/components/ui/orbiting-circles';
import { SiGooglegemini, SiVercel, SiGooglecloud, SiNeon } from 'react-icons/si';

export function TrustLogos() {
  return (
    <section className="pt-16 md:pt-24 pb-8 md:pb-12 bg-surface-container-lowest overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-5xl px-4"
      >
        <p className="text-center text-label-sm font-semibold uppercase tracking-widest text-on-surface-variant/50 mb-10">
          Built with industry-leading tools
        </p>

        <div className="relative flex h-[280px] w-full max-w-[500px] mx-auto md:h-[340px] flex-col items-center justify-center overflow-hidden">
          {/* Center: Sentinel logo */}
          <div className="z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container border border-outline-variant/30 shadow-lg">
            <Image
              src="/sentinel_logo.png"
              alt="Sentinel"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
          </div>

          {/* Inner orbit: Gemini + Vercel */}
          <OrbitingCircles
            className="border-outline-variant/30 bg-surface-container-lowest"
            radius={90}
            duration={25}
            iconSize={44}
          >
            <SiGooglegemini size={24} color="#4285F4" />
            <SiVercel size={20} className="text-on-surface" />
          </OrbitingCircles>

          {/* Outer orbit: GCP + Neon (reverse) */}
          <OrbitingCircles
            className="border-outline-variant/30 bg-surface-container-lowest"
            radius={150}
            duration={30}
            reverse
            iconSize={50}
          >
            <SiGooglecloud size={28} color="#EA4335" />
            <SiNeon size={28} color="#00E599" />
          </OrbitingCircles>
        </div>
      </motion.div>
    </section>
  );
}
