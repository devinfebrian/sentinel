'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftStartOnRectangleIcon,
  BellIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/stores/auth.store';

import { useNow } from '@/lib/hooks/use-now';
import { formatClock, formatDayDate } from '@/lib/format/datetime';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { useTheme } from 'next-themes';

const getInitials = (fullname: string) =>
  fullname
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export default function TopAppBar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);

  const [menuOpen, setMenuOpen] = useState(false);
  const now = useNow();
  const { resolvedTheme, setTheme } = useTheme();

  const handleLogout = () => {
    clearSession();
    // replace, not push, so the back button cannot return to the dashboard.
    router.replace('/login');
  };

  const roleLabel = user?.isAdmin ? 'Finance Lead' : 'Finance Staff';

  return (
    <header className="sticky top-0 z-40 flex min-w-0 w-full items-center justify-between gap-2 sm:gap-4 border-b border-outline-variant/30 bg-surface/80 px-2 sm:px-4 py-2 sm:py-4 backdrop-blur-md md:px-container-padding">
      <div className="flex min-w-0 shrink items-center">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2 rounded-full border border-outline-variant/30 bg-surface-container-low px-2 sm:px-4 py-1.5 sm:py-2">
          <ClockIcon aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-on-surface-variant" />
        {/* aria-live is deliberately off: a clock announcing itself every
            second would flood a screen reader. */}
        <p className="flex items-baseline gap-1.5 sm:gap-2 whitespace-nowrap text-[10px] sm:text-table-data">
          <span className="font-semibold tabular-nums text-on-surface">
            {now ? formatClock(now) : '--:--:--'}
          </span>
          <span className="text-on-surface-variant hidden sm:inline">WIB</span>
          <span className="hidden text-on-surface-variant/70 md:inline">
            {now ? formatDayDate(now) : ''}
          </span>
        </p>
      </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
        {/* Hide these placeholder buttons on mobile to save space */}
        <button
          type="button"
          disabled
          aria-label="Notifications"
          className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-50"
        >
          <BellIcon aria-hidden="true" className="h-6 w-6" />
        </button>

        <button
          type="button"
          disabled
          aria-label="Settings"
          className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Cog6ToothIcon aria-hidden="true" className="h-6 w-6" />
        </button>

        <AnimatedThemeToggler 
          className="!flex h-8 w-8 sm:h-10 sm:w-10 !p-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors hover:bg-primary-container hover:text-on-primary-container active:bg-primary-container active:text-on-primary-container" 
          variant="circle"
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          onThemeChange={setTheme}
        />

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-1 sm:gap-2 rounded-full p-1 transition-colors hover:bg-surface-container"
          >
            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-secondary-container font-label-sm text-[10px] sm:text-label-sm font-semibold text-on-secondary-container">
              {user ? getInitials(user.fullname) : '?'}
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
                className="fixed inset-0 z-40"
                aria-hidden="true"
                onClick={() => setMenuOpen(false)}
              />
              <div
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
