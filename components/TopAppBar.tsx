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
    <header className="flex justify-between items-center w-full px-margin-desktop h-16 top-0 sticky z-40 bg-surface-container-lowest border-b border-outline-variant">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">shield_person</span>
        <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
          Sentinel
        </span>
      </div>

      <div className="flex items-center gap-2 text-on-surface-variant">
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
