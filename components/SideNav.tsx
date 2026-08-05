'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';

interface NavItem {
  href: string;
  icon: string;
  label: string;
  adminOnly?: boolean;
}

// Sprint 1 only. Financial Operations, AI Audit Center, and Analytics stay out
// until the modules behind them exist — a link to nothing is worse than no link.
const NAV_ITEMS: NavItem[] = [
  { href: '/', icon: 'dashboard', label: 'Overview' },
  { href: '/administration', icon: 'group', label: 'Administration', adminOnly: true },
];

export default function SideNav() {
  const pathname = usePathname();
  const isAdmin = useAuthStore((s) => s.user?.isAdmin ?? false);

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <nav className="hidden md:flex flex-col h-full py-base bg-surface-container-lowest w-[260px] fixed left-0 top-0 shadow-[0px_4px_20px_rgba(15,61,145,0.04)] z-50 border-r border-outline-variant/30">
      <div className="px-gutter pt-stack-sm pb-stack-md flex items-center gap-3">
        {/* Local icon, not a remote image: the old logo pointed at a
            googleusercontent URL that will eventually 404. */}
        <span
          className="material-symbols-outlined text-primary-container bg-on-surface p-2 rounded-lg"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          security
        </span>
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary leading-none">
            Sentinel
          </h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant opacity-80 mt-1">
            Enterprise Finance
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-3 flex flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                active
                  ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high'
                  : 'text-on-surface-variant opacity-80 hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-sm text-label-sm">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="px-gutter pt-stack-sm pb-stack-md border-t border-outline-variant/30 mt-auto">
        <p className="font-label-sm text-label-sm text-outline">Sprint 1 · Auth &amp; accounts</p>
      </div>
    </nav>
  );
}
