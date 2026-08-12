'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useSidebarStore } from '@/lib/stores/sidebar.store';
import { NAV_GROUPS } from '@/lib/nav-items';

/**
 * Heroicons has no panel/sidebar glyph, so this is drawn to match their
 * 24x24 / 1.5-stroke geometry. The left column is filled while the rail is
 * open and hollow once it is closed, so the icon shows the current state
 * rather than only the action.
 */
function SidebarToggleIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <line x1="9.5" y1="4" x2="9.5" y2="20" />
      {!collapsed && (
        <path
          d="M3 6.5A2.5 2.5 0 0 1 5.5 4H9.5v16H5.5A2.5 2.5 0 0 1 3 17.5Z"
          fill="currentColor"
          stroke="none"
        />
      )}
    </svg>
  );
}

export default function SideNav() {
  const pathname = usePathname();
  const isAdmin = useAuthStore((s) => s.user?.isAdmin ?? false);
  const { isCollapsed, toggleSidebar, isMobileOpen, setMobileOpen } = useSidebarStore();

  // Filter first, then drop groups the filter emptied — otherwise a non-admin
  // sees an "Admin" heading with nothing under it.
  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.adminOnly || isAdmin),
  })).filter((group) => group.items.length > 0);

  const labelClasses = (max: string) =>
    `overflow-hidden whitespace-nowrap sidebar-label-transition ${
      isCollapsed ? 'max-w-0 opacity-0 -translate-x-2' : `${max} opacity-100 translate-x-0`
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      
      <aside
        id="dashboard-sidebar"
        className={`flex flex-col h-full py-4 transition-[width,padding,transform] duration-300 sidebar-shell-transition fixed left-0 top-0 z-50 flex-shrink-0 border-r border-outline-variant/50 bg-surface-container-low md:border-r-0 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isCollapsed ? 'w-[var(--sidebar-w-rail)] px-2' : 'w-[var(--sidebar-w-full)] px-3'
        }`}
      >
      {/* Logo Area */}
      <div className={`flex shrink-0 items-center mb-8 mt-2 transition-all duration-300 ${
        isCollapsed ? 'mx-auto w-9 justify-center' : 'w-full px-2.5 justify-start'
      }`}>
        <div className="flex items-center gap-3">
          <span className="relative h-[34px] w-[34px] shrink-0">
            <Image src="/sentinel_logo.png" alt="" fill priority sizes="34px" className="object-contain" />
          </span>
          {!isCollapsed && (
            <span className="font-headline-sm text-2xl text-on-surface font-bold tracking-tight whitespace-nowrap">
              Sentinel
            </span>
          )}
        </div>
      </div>

      {/* The old dedicated toggle button is gone — the sidebar's own right
          edge is now the control. This strip sits on top of that edge and
          is clickable along its full height, so the border line itself is
          the affordance; the circular icon only surfaces on hover/focus as
          a hint rather than the sole hit target. */}
      <button
        type="button"
        onClick={toggleSidebar}
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!isCollapsed}
        aria-controls="dashboard-sidebar"
        className="group/resize absolute inset-y-0 -right-2 z-10 hidden w-4 cursor-pointer items-center justify-center md:flex"
      >
        <span
          aria-hidden="true"
          className="h-full w-px bg-outline-variant/50 transition-colors duration-150 group-hover/resize:bg-primary group-focus-visible/resize:bg-primary"
        />
        <span
          aria-hidden="true"
          className="absolute flex h-6 w-6 items-center justify-center rounded-full border border-outline-variant/60 bg-surface-container-low text-on-surface-variant opacity-0 shadow-sm transition-opacity duration-150 group-hover/resize:opacity-100 group-focus-visible/resize:opacity-100"
        >
          <SidebarToggleIcon collapsed={isCollapsed} />
        </span>
      </button>

      {/* No overflow container: `overflow-y-auto` also clips horizontally,
          which would cut the collapsed tooltips off at the rail edge. */}
      <nav aria-label="Main" className="mt-3 flex flex-1 flex-col">
        {groups.map((group) => (
          <div
            key={group.id}
            role="group"
            aria-label={group.label ?? 'Overview'}
            className="flex flex-col gap-0.5"
          >
            {group.label &&
              (isCollapsed ? (
                // mx-1.5 makes the rule span exactly the 36px of the icon
                // squares above and below it.
                <hr aria-hidden="true" className="mx-1.5 my-2 border-outline-variant/60" />
              ) : (
                <div className="flex items-center gap-2 px-2.5 pb-1.5 pt-4">
                  <span className="font-label-sm text-[11px] uppercase tracking-[0.08em] text-outline">
                    {group.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 border-t border-dotted border-outline-variant/70"
                  />
                </div>
              ))}

            {group.items.map((item) => {
              // Prefix match, so a nested route like /transactions/123 keeps its
              // parent highlighted. The trailing slash keeps the match on a
              // segment boundary, so /vendors would not light up for a sibling
              // route such as /vendors-archive.
              const active =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(`${item.href}/`));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={`group/nav relative flex items-center rounded-lg transition-colors duration-200 ${
                    // Collapsed, the row is a centred square so the hover fill
                    // reads as a square and the icon sits on the rail's
                    // centreline instead of hugging its left edge. The gap is
                    // expanded-only: the label still occupies a flex slot at
                    // max-w-0, so a gap here would push the icon off centre.
                    isCollapsed
                      ? 'mx-auto h-9 w-9 justify-center'
                      : 'h-[34px] w-full gap-2.5 px-2.5'
                  } ${
                    active
                      ? `bg-primary-container text-on-primary-container${
                          // The filled square already reads as active; a 3px
                          // tick on its edge would just be noise.
                          isCollapsed
                            ? ''
                            : ' before:absolute before:left-0 before:top-1/2 before:h-4 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-primary'
                        }`
                      : 'text-on-surface-variant hover:bg-secondary-container/50 hover:text-on-surface'
                  }`}
                >
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                  {/* Weight lives here rather than on the row: `.font-body-sm` sets
                      font-weight itself and is unlayered, so it would beat any
                      weight utility inherited from the parent. */}
                  <span
                    aria-hidden="true"
                    className={`text-body-sm ${
                      active ? 'font-semibold' : 'font-medium'
                    } ${labelClasses('max-w-[150px]')}`}
                  >
                    {item.label}
                  </span>

                  {item.soon && !isCollapsed && (
                    <span
                      aria-hidden="true"
                      className="ml-auto shrink-0 rounded-full bg-surface-container-high px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-outline"
                    >
                      Soon
                    </span>
                  )}

                  {/* The collapsed rail has no visible label, so surface one on hover/focus. */}
                  {isCollapsed && (
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-inverse-surface px-2.5 py-1.5 font-label-sm text-label-sm text-inverse-on-surface opacity-0 shadow-lg transition-opacity duration-150 group-hover/nav:opacity-100 group-focus-visible/nav:opacity-100"
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
    </>
  );
}
