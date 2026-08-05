'use client';

import React from 'react';

export default function TopBar({ placeholder = 'Search insights...' }) {
  return (
    <header className="flex justify-between items-center w-full px-margin-page h-16 max-w-[1180px] mx-auto bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <div className="relative w-64 hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full font-body-sm text-body-sm focus:ring-2 focus:ring-primary outline-none"
            placeholder={placeholder}
            type="text"
          />
        </div>
        <nav className="hidden md:flex gap-6">
          <a className="font-label-md text-label-md text-on-surface border-b-2 border-primary pb-1" href="#">
            Global View
          </a>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-all" href="#">
            Market Trends
          </a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 text-on-surface font-label-md text-label-md hover:opacity-80 transition-opacity cursor-pointer">
          <span className="material-symbols-outlined text-primary">smart_toy</span>
          AI Assistant
        </button>
        <div className="flex items-center gap-2 border-l border-outline-variant pl-4">
          <button className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
            <span className="material-symbols-outlined">hub</span>
          </button>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </div>
    </header>
  );
}
