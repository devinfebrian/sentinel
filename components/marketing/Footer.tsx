'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-surface border-t border-outline-variant/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Column 1: Logo + description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/sentinel_logo.png"
                alt="Sentinel"
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
              <span className="font-headline-sm font-bold tracking-tight text-on-surface">
                Sentinel
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              Autonomous financial auditing and intelligence for modern enterprises.
            </p>
            <p className="mt-6 text-label-sm text-outline">
              &copy; {new Date().getFullYear()} Sentinel. All rights reserved.
            </p>
            {/* Social icon */}
            <div className="mt-4">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label="X (Twitter)"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Home links */}
          <div>
            <h4 className="font-label-lg font-semibold text-on-surface mb-4">
              Home
            </h4>
            <ul className="space-y-3 text-body-sm text-on-surface-variant">
              <li>
                <Link href="#features" className="hover:text-on-surface transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-on-surface transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-on-surface transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company links */}
          <div>
            <h4 className="font-label-lg font-semibold text-on-surface mb-4">
              Company
            </h4>
            <ul className="space-y-3 text-body-sm text-on-surface-variant">
              <li>
                <Link href="/about" className="hover:text-on-surface transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
