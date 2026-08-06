'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useSidebarStore } from '@/lib/stores/sidebar.store';

interface NavItem {
  href: string;
  icon: string;
  label: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', icon: 'dashboard', label: 'Overview' },
  { href: '/transactions', icon: 'receipt_long', label: 'Transactions' },
  { href: '/vendors', icon: 'storefront', label: 'Vendors' },
  { href: '/administration', icon: 'group', label: 'Administration', adminOnly: true },
];

export default function SideNav() {
  const pathname = usePathname();
  const isAdmin = useAuthStore((s) => s.user?.isAdmin ?? false);
  const { isCollapsed, toggleSidebar } = useSidebarStore();

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <nav className={`hidden md:flex flex-col h-full py-base bg-surface-container-lowest ${isCollapsed ? 'w-[80px]' : 'w-[260px]'} transition-[width] duration-300 ease-in-out fixed left-0 top-0 shadow-[0px_4px_20px_rgba(15,61,145,0.04)] z-50 border-r border-outline-variant/30 group`}>
      <div className={`pt-stack-sm pb-stack-md flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-center px-4'} relative`}>
        <div className={`flex items-center gap-3 w-full ${isCollapsed ? 'justify-center' : 'justify-center'}`}>
          <span
            className="material-symbols-outlined text-primary-container bg-on-surface p-2 rounded-lg flex-shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            security
          </span>
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap transition-all duration-300">
              <h1 className="font-headline-md text-headline-md font-bold text-primary leading-none">
                Sentinel
              </h1>
              <p className="font-label-sm text-[11px] text-on-surface-variant opacity-80 mt-1">
                Enterprise Finance
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-3 flex flex-col gap-1 mt-4">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-lg transition-colors duration-200 ${
                active
                  ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high'
                  : 'text-on-surface-variant opacity-80 hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {!isCollapsed && <span className="font-label-sm text-label-sm overflow-hidden whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-surface border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary transition-colors flex items-center justify-center z-50 shadow-ambient-lvl-1"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <span className="material-symbols-outlined text-[16px]">
          {isCollapsed ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>
    </nav>
  );
}
