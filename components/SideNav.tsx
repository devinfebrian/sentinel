import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SideNav() {
  return (
    <nav className="hidden md:flex flex-col h-full py-base bg-surface-container-lowest dark:bg-surface-container-lowest w-[260px] fixed left-0 top-0 bg-white dark:bg-surface-container shadow-[0px_4px_20px_rgba(15,61,145,0.04)] z-50 border-r border-outline-variant/30">
      <div className="px-gutter pt-stack-sm pb-stack-md flex items-center gap-3">
        <img 
          className="w-8 h-8 object-contain rounded"
          alt="FinAnalysis AI Logo"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCVGafWTcaJBQDp2yRRCYMUeoief6l5QtbRUMUQMQAftxHHBUYQgGnflYLoNtvQPO5vJogdU-SXQkPGD2fL9Lr13Q6T_WsZn73VvuhT9zIs_7wHdKKEo1g1jqQTI2qfORyDqfX-Wj9bA1UvPn4OKyNNgBWdrR87jerKqrfNMt6cYjxjMHzGDJOg2ALSaIsoRvQW--ZXj2sS_vlUvJdGloZeiodHiE0yz0EljcCykt8LLrUgwFy0VuJ" 
        />
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed leading-none">
            FinAnalysis AI
          </h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant opacity-80 mt-1">Enterprise Finance</p>
        </div>
      </div>
      <button className="mx-gutter mb-stack-md bg-primary-container text-black font-label-sm text-label-sm font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-fixed transition-colors border border-outline/10">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
        New Analysis
      </button>
      <div className="flex-1 overflow-y-auto hide-scrollbar px-3 flex flex-col gap-1">
        <Link 
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary dark:text-primary-fixed font-bold border-r-4 border-primary dark:border-primary-fixed bg-surface-container-high dark:bg-primary-container scale-[0.98] active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-sm text-label-sm">Overview</span>
        </Link>
        <Link 
          href="#"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant dark:text-on-surface-variant opacity-80 hover:bg-surface-container-high dark:hover:bg-primary-container transition-colors duration-200 scale-[0.98] active:scale-95"
        >
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className="font-label-sm text-label-sm">Financial Operations</span>
        </Link>
        <Link 
          href="#"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant dark:text-on-surface-variant opacity-80 hover:bg-surface-container-high dark:hover:bg-primary-container transition-colors duration-200 scale-[0.98] active:scale-95"
        >
          <span className="material-symbols-outlined">security</span>
          <span className="font-label-sm text-label-sm">AI Audit Center</span>
        </Link>
        <Link 
          href="#"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant dark:text-on-surface-variant opacity-80 hover:bg-surface-container-high dark:hover:bg-primary-container transition-colors duration-200 scale-[0.98] active:scale-95"
        >
          <span className="material-symbols-outlined">analytics</span>
          <span className="font-label-sm text-label-sm">Analytics &amp; Reports</span>
        </Link>
        <Link 
          href="#"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant dark:text-on-surface-variant opacity-80 hover:bg-surface-container-high dark:hover:bg-primary-container transition-colors duration-200 scale-[0.98] active:scale-95"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-sm text-label-sm">Administration</span>
        </Link>
      </div>
      <div className="px-3 pt-stack-sm pb-stack-md flex flex-col gap-1 border-t border-outline-variant/30 mt-auto">
        <Link 
          href="#"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant dark:text-on-surface-variant opacity-80 hover:bg-surface-container-high dark:hover:bg-primary-container transition-colors duration-200 scale-[0.98] active:scale-95"
        >
          <span className="material-symbols-outlined">help</span>
          <span className="font-label-sm text-label-sm">Help Center</span>
        </Link>
        <Link 
          href="#"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant dark:text-on-surface-variant opacity-80 hover:bg-surface-container-high dark:hover:bg-primary-container transition-colors duration-200 scale-[0.98] active:scale-95"
        >
          <span className="material-symbols-outlined">description</span>
          <span className="font-label-sm text-label-sm">Documentation</span>
        </Link>
      </div>
    </nav>
  );
}
