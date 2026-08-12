'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeftStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  KeyIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/stores/auth.store';

import { NAV_GROUPS, ACCOUNT_NAV_ITEMS, type NavItem } from '@/lib/nav-items';
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
  // Pages a user can jump to from the header search: every sidebar route
  // plus account-menu destinations (e.g. change password) that aren't in
  // the sidebar at all.
  const searchableItems: NavItem[] = [
    ...NAV_GROUPS.flatMap((group) => group.items).filter((item) => !item.adminOnly || isAdmin),
    ...ACCOUNT_NAV_ITEMS,
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  const searchResults = searchQuery.trim()
    ? searchableItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : searchableItems;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setActiveResultIndex(0);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  const goToSearchResult = (item: NavItem) => {
    router.push(item.href);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchOpen(true);
      setActiveResultIndex((i) => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveResultIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = searchResults[activeResultIndex];
      if (target) goToSearchResult(target);
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
      e.currentTarget.blur();
    }
  };

  const { resolvedTheme, setTheme } = useTheme();

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

      {/* Search (Center on mobile, Left on desktop) */}
      <div ref={searchWrapperRef} className="relative flex min-w-0 flex-1 items-center justify-center md:flex-none md:justify-start">
        <div className="relative w-full max-w-[260px] sm:max-w-sm md:w-80">
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            role="combobox"
            aria-expanded={searchOpen}
            aria-controls="header-search-results"
            aria-autocomplete="list"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search tools, pages..."
            className="w-full rounded-full border border-outline-variant/30 bg-surface-container-low py-2 sm:py-2.5 pl-10 pr-3 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/70 transition-colors focus:border-primary focus:outline-none"
          />
        </div>

        {searchOpen && (
          <div
            id="header-search-results"
            role="listbox"
            className="absolute left-0 top-full z-50 mt-2 w-full max-w-[260px] sm:max-w-sm md:w-80 overflow-hidden rounded-xl border border-outline-variant/30 bg-surface card-shadow"
          >
            {searchResults.length === 0 ? (
              <p className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant">
                No matches for &ldquo;{searchQuery}&rdquo;
              </p>
            ) : (
              searchResults.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    type="button"
                    role="option"
                    aria-selected={i === activeResultIndex}
                    onMouseEnter={() => setActiveResultIndex(i)}
                    onClick={() => goToSearchResult(item)}
                    className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-label-sm text-label-sm text-on-surface transition-colors ${
                      i === activeResultIndex ? 'bg-surface-container-high' : 'hover:bg-surface-container-high'
                    }`}
                  >
                    <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-on-surface-variant" />
                    {item.label}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Right Actions (Profile, Theme) */}
      <div className="flex flex-1 shrink-0 items-center justify-end gap-1.5 sm:gap-4 md:flex-none">
        {/* Hide these placeholder buttons on mobile to save space */}
        <AnimatedThemeToggler 
          className="!flex h-8 w-8 sm:h-10 sm:w-10 !p-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors hover:bg-primary-container hover:text-on-primary-container active:bg-primary-container active:text-on-primary-container" 
          variant="circle"
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          onThemeChange={setTheme}
        />

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
