'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/sentinel_logo.png"
                alt="Sentinel"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">
                Sentinel
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="#features"
                className="text-body-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-body-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
              >
                How it works
              </Link>
            </nav>
          </div>

          {/* Right: Sign in + CTA */}
          <div className="flex items-center gap-4">
            {mounted ? (
              <AnimatedThemeToggler
                className="!flex h-9 w-9 !p-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors hover:bg-primary-container hover:text-on-primary-container active:bg-primary-container active:text-on-primary-container"
                variant="circle"
                theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                onThemeChange={setTheme}
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-surface-container" />
            )}
            <Link
              href="/login"
              className="hidden md:block text-body-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-on-surface px-5 py-2 text-label-sm font-semibold text-surface transition-all hover:opacity-90 dark:bg-primary dark:text-on-primary"
            >
              Open Sentinel
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
