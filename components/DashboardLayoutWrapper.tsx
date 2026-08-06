'use client';

import React from 'react';
import { useSidebarStore } from '@/lib/stores/sidebar.store';

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  return (
    <div className={`flex-1 flex flex-col ${isCollapsed ? 'md:ml-[80px]' : 'md:ml-[260px]'} h-full overflow-hidden w-full transition-[margin] duration-300 ease-in-out`}>
      {children}
    </div>
  );
}
