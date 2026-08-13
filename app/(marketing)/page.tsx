import React from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Hero } from '@/components/marketing/Hero';
import { Marquee } from '@/components/marketing/Marquee';
import { TrustLogos } from '@/components/marketing/TrustLogos';
import { Features } from '@/components/marketing/Features';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { CTA } from '@/components/marketing/CTA';
import { Footer } from '@/components/marketing/Footer';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Marquee />
        <TrustLogos />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
