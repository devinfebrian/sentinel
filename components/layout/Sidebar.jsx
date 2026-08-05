'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { href: '/', icon: 'dashboard', title: 'Overview' },
  { href: '/transactions', icon: 'account_balance', title: 'Transactions' },
  { href: '/investigation-queue', icon: 'search_insights', title: 'Investigations' },
  { href: '/ai-configuration', icon: 'smart_toy', title: 'AI Configuration' },
  { href: '/financial-insights', icon: 'insights', title: 'Financial Insights' },
  { href: '/executive-reports', icon: 'description', title: 'Executive Reports' },
  { href: '/tool-catalog', icon: 'category', title: 'Tool Catalog' },
  { href: '/user-management', icon: 'group', title: 'User Management' },
  { href: '/vendors', icon: 'storefront', title: 'Vendors' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <nav className="w-[88px] h-full fixed left-0 top-0 bg-surface-container-lowest flex flex-col items-center py-6 z-50 shadow-sm border-r border-outline-variant/30">
      <div className="flex flex-col gap-4 flex-1 w-full px-4 items-center">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.title}
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors ${
                active
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="mt-auto flex flex-col gap-4 w-full px-4 items-center">
        <button
          type="button"
          title="Logout"
          onClick={logout}
          className="w-12 h-12 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </nav>
  );
}
