'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';
import {
  Squares2X2Icon,
  ChartBarIcon,
  DocumentTextIcon,
  BuildingStorefrontIcon,
  Bars3Icon,
  ShieldExclamationIcon,
  SparklesIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

export default function BottomNav() {
  const pathname = usePathname();
  const isAdmin = useAuthStore((s) => s.user?.isAdmin ?? false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const navItems = [
    { href: '/', icon: Squares2X2Icon, label: 'Overview' },
    { href: '/dashboard', icon: ChartBarIcon, label: 'Dashboard' },
    { href: '/transactions', icon: DocumentTextIcon, label: 'Transactions' },
    { href: '/vendors', icon: BuildingStorefrontIcon, label: 'Vendors' },
  ];

  const extraItems = [
    { href: '/findings', icon: ShieldExclamationIcon, label: 'Findings' },
    { href: '/ask', icon: SparklesIcon, label: 'Ask Sentinel', soon: true },
    ...(isAdmin ? [{ href: '/administration', icon: UsersIcon, label: 'User Mgt' }] : []),
  ];

  const hasActiveExtraItem = extraItems.some(
    (item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))
  );

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-low border-t border-surface-container-high pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      
      {/* Backdrop for dropdown */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" 
          onClick={() => setMenuOpen(false)} 
        />
      )}
      
      {/* Dropdown Menu */}
      <div
        ref={menuRef}
        className={`absolute right-2 bottom-[76px] z-50 flex min-w-[200px] flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-surface card-shadow transition-all duration-200 origin-bottom-right ${
          menuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col py-2">
          {extraItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  active
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface hover:bg-surface-container'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                {item.soon && (
                  <span className="ml-auto rounded-full bg-surface-container-high px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-outline">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex h-16 items-center justify-between px-2 relative z-50 bg-surface-container-low">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                active ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <div
                className={`flex items-center justify-center w-14 h-8 rounded-full transition-colors ${
                  active ? 'bg-primary-container text-on-primary-container' : 'bg-transparent'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={`text-[10px] ${
                  active ? 'font-bold text-on-surface' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Menu Toggle for dropdown */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
            hasActiveExtraItem || menuOpen
              ? 'text-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <div
            className={`flex items-center justify-center w-14 h-8 rounded-full transition-colors ${
              hasActiveExtraItem || menuOpen
                ? 'bg-primary-container text-on-primary-container'
                : 'bg-transparent'
            }`}
          >
            <Bars3Icon className="h-5 w-5" />
          </div>
          <span
            className={`text-[10px] ${
              hasActiveExtraItem || menuOpen ? 'font-bold text-on-surface' : 'font-medium'
            }`}
          >
            Menu
          </span>
        </button>
      </div>
    </div>
  );
}
