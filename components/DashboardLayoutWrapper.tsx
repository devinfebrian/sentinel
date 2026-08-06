'use client';

import React from 'react';
import { useSidebarStore } from '@/lib/stores/sidebar.store';

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  return (
    <div className={`flex-1 flex flex-col ${isCollapsed ? 'md:ml-[var(--sidebar-w-rail)]' : 'md:ml-[var(--sidebar-w-full)]'} h-full overflow-hidden w-full transition-[margin] sidebar-shell-transition`}>
      {children}
    </div>
  );
}
