'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function TopAppBar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    clearSession();
    // replace, not push, so the back button cannot return to the dashboard.
    router.replace('/login');
  };

  const roleLabel = user?.isAdmin ? 'Finance Lead' : 'Finance Staff';

  return (
    <header className="sticky top-0 z-40 flex h-16 min-w-0 w-full items-center gap-4 border-b border-outline-variant bg-surface-container-lowest px-4 md:px-6 lg:px-8">
      <div className="min-w-0 flex-1">
        <p className="truncate font-headline-md text-lg font-semibold text-on-surface sm:text-xl">
          Ledger Actions
        </p>
      </div>

      <div className="hidden min-w-0 flex-1 justify-center sm:flex">
        <div className="relative w-full max-w-[420px]">
          <span
            aria-hidden="true"
            className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          >
            search
          </span>
          <input
            type="search"
            readOnly
            aria-label="Search transactions and entities"
            placeholder="Search transactions, entities..."
            className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-low pl-10 pr-4 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 text-on-surface-variant">
        <button
          type="button"
          disabled
          aria-label="Notifications"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button
          type="button"
          disabled
          aria-label="Settings"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="p-2 rounded-full hover:bg-surface-container-high transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">account_circle</span>
            <span className="hidden sm:inline font-label-sm text-label-sm text-on-surface">
              {user?.fullname ?? user?.email ?? 'Account'}
            </span>
            <span className="material-symbols-outlined text-[18px]">
              {menuOpen ? 'expand_less' : 'expand_more'}
            </span>
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
                className="absolute right-0 top-full mt-2 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg overflow-hidden z-50 min-w-[220px]"
              >
                <div className="px-4 py-3 border-b border-outline-variant">
                  <p className="font-label-sm font-bold text-on-surface">
                    {user?.fullname ?? 'Account'}
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                    {user?.email}
                  </p>
                  <p className="font-label-sm text-label-sm text-outline mt-1 uppercase">
                    {roleLabel}
                  </p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="px-4 py-3 text-left text-error hover:bg-error/10 font-label-sm font-bold flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
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
