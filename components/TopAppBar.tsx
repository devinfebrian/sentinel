'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function TopAppBar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex justify-between items-center w-full px-margin-desktop h-16 max-w-[calc(1440px-260px)] docked full-width top-0 sticky z-40 bg-surface-container-lowest dark:bg-surface-container-lowest border-b border-outline-variant dark:border-outline flat no shadows">
      <div className="flex items-center gap-6">
        {/* Search on left */}
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            className="pl-10 pr-4 py-2 bg-surface-container-high border-none rounded-full text-label-sm font-label-sm w-64 focus:ring-2 focus:ring-primary-container transition-all text-on-surface placeholder:text-outline-variant"
            placeholder="Search insights..."
            type="text"
          />
        </div>
        <nav className="hidden lg:flex gap-6">
          <a
            className="font-label-sm text-label-sm text-primary dark:text-primary-fixed border-b-2 border-primary dark:border-primary-fixed pb-1 hover:text-primary dark:hover:text-primary-fixed transition-all Active: opacity-80 transition-opacity"
            href="#"
          >
            Global View
          </a>
          <a
            className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-all Active: opacity-80 transition-opacity"
            href="#"
          >
            Market Trends
          </a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="hidden sm:flex items-center gap-2 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full font-label-sm text-label-sm hover:bg-surface-dim transition-colors">
          <span className="material-symbols-outlined text-[18px]">smart_toy</span>
          AI Assistant
        </button>
        <div className="flex items-center gap-2 text-on-surface-variant">
          <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">hub</span>
          </button>
          <div className="relative group cursor-pointer">
            <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
            <div className="absolute right-0 top-full mt-2 hidden group-hover:flex flex-col bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg overflow-hidden z-50 min-w-[200px]">
              <div className="px-4 py-3 border-b border-outline-variant">
                <p className="font-label-sm font-bold text-on-surface">{user?.name || user?.email || 'User'}</p>
                <p className="text-xs text-on-surface-variant mt-1 uppercase">{user?.role || 'Guest'}</p>
              </div>
              <button 
                onClick={logout}
                className="px-4 py-3 text-left text-error hover:bg-error/10 font-label-sm font-bold flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
