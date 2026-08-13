'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeftStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/stores/auth.store';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { useTheme } from 'next-themes';

const getInitials = (fullname?: string | null) => {
  if (!fullname) return '';
  return fullname
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};

export default function TopAppBar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const isAdmin = user?.isAdmin ?? false;


  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    clearSession();
    // replace, not push, so the back button cannot return to the dashboard.
    router.replace('/login');
  };

  const roleLabel = user?.isAdmin ? 'Finance Lead' : 'Finance Staff';

  return (
    <header className="sticky top-0 z-40 flex w-full items-center justify-between gap-1 sm:gap-4 border-b border-outline-variant/30 bg-surface/80 px-2 sm:px-4 py-2 sm:py-4 backdrop-blur-md md:px-container-padding">
      
      {/* Mobile Logo (Left, hidden on desktop where sidebar handles it) */}
      <div className="flex flex-1 justify-start md:hidden min-w-0 pr-1">
        <div className="flex items-center gap-2">
          <span className="relative h-[28px] w-[28px] shrink-0">
            <Image src="/sentinel_logo.png" alt="" fill sizes="28px" className="object-contain" />
          </span>
          <span className="font-headline-sm text-[17px] text-on-surface font-bold tracking-tight">
            Sentinel
          </span>
        </div>
      </div>



      {/* Right Actions (Profile, Theme) */}
      <div className="flex flex-1 shrink-0 items-center justify-end gap-1.5 sm:gap-4 md:flex-none ml-auto">
        {/* Hide these placeholder buttons on mobile to save space */}
        {mounted ? (
          <AnimatedThemeToggler 
            className="!flex h-8 w-8 sm:h-10 sm:w-10 !p-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors hover:bg-primary-container hover:text-on-primary-container active:bg-primary-container active:text-on-primary-container" 
            variant="circle"
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            onThemeChange={setTheme}
          />
        ) : (
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-surface-container" />
        )}

        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-1 sm:gap-2 rounded-full p-1 transition-colors hover:bg-surface-container"
          >
            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-secondary-container font-label-sm text-[10px] sm:text-label-sm font-semibold text-on-secondary-container">
              {user ? (getInitials(user.fullname) || getInitials(user.email) || '?') : '?'}
            </span>
            <span className="hidden font-label-sm text-label-sm text-on-surface sm:inline">
              {user?.fullname ?? user?.email ?? 'Account'}
            </span>
            {menuOpen ? (
              <ChevronUpIcon aria-hidden="true" className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            ) : (
              <ChevronDownIcon aria-hidden="true" className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            )}
          </button>

          {/* Click-driven, not hover-driven: a hover-only menu is unreachable
              by keyboard and on touch screens. */}
          {menuOpen && (
            <>
              <div
                ref={menuRef}
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 flex min-w-[220px] flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-surface card-shadow"
              >
                <div className="border-b border-surface-container-high px-4 py-3">
                  <p className="font-label-sm font-bold text-on-surface">
                    {user?.fullname ?? 'Account'}
                  </p>
                  <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">
                    {user?.email}
                  </p>
                  <p className="mt-1 font-label-sm text-label-sm uppercase text-outline">
                    {roleLabel}
                  </p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push('/change-password');
                  }}
                  className="flex items-center gap-2 px-4 py-3 text-left font-label-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  <KeyIcon aria-hidden="true" className="h-[18px] w-[18px]" />
                  Change Password
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-3 text-left font-label-sm font-bold text-error transition-colors hover:bg-error-container/50"
                >
                  <ArrowLeftStartOnRectangleIcon
                    aria-hidden="true"
                    className="h-[18px] w-[18px]"
                  />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
