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
    <nav id="dashboard-sidebar" className={`hidden md:flex flex-col h-full py-base bg-surface-container-lowest ${isCollapsed ? 'w-[64px]' : 'w-[260px]'} transition-[width] sidebar-shell-transition fixed left-0 top-0 shadow-[0px_4px_20px_rgba(15,61,145,0.04)] z-50 border-r border-outline-variant/30 group`}>
      <div className="pt-stack-sm pb-stack-md flex items-center justify-start px-3 relative">
        <div className="flex items-center w-full justify-start gap-3">
          <span className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-primary-container bg-on-surface p-2 rounded-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              security
            </span>
          </span>
          <div className={`overflow-hidden whitespace-nowrap sidebar-label-transition ${isCollapsed ? 'max-w-0 opacity-0 -translate-x-2' : 'max-w-[180px] opacity-100 translate-x-0'}`}>
            <span className="font-headline-md text-headline-md font-bold text-primary leading-none">
              Sentinel
            </span>
            <p className="font-label-sm text-[11px] text-on-surface-variant opacity-80 mt-1">
              Enterprise Finance
            </p>
          </div>
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
              aria-label={isCollapsed ? item.label : undefined}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center justify-start gap-3 px-0 py-3 rounded-lg transition-colors duration-200 ${
                active
                  ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high'
                  : 'text-on-surface-variant opacity-80 hover:bg-surface-container-high'
              }`}
            >
              <span className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined">{item.icon}</span>
              </span>
              <span aria-hidden={isCollapsed} className={`font-label-sm text-label-sm overflow-hidden whitespace-nowrap sidebar-label-transition ${isCollapsed ? 'max-w-0 opacity-0 -translate-x-2' : 'max-w-[160px] opacity-100 translate-x-0'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={toggleSidebar}
        className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-surface border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary transition-colors flex items-center justify-center z-50 shadow-ambient-lvl-1"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!isCollapsed}
        aria-controls="dashboard-sidebar"
      >
        <span className="material-symbols-outlined text-[16px]">
          {isCollapsed ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>
    </nav>
  );
}
