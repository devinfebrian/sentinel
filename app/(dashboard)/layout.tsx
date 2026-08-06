import React from 'react';
import SideNav from '@/components/SideNav';
import TopAppBar from '@/components/TopAppBar';
import AuthGate from '@/components/auth/AuthGate';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Stays a Server Component; only the gate runs on the client.
  return (
    <AuthGate>
      <div className="bg-background text-on-background antialiased h-screen overflow-hidden flex w-full">
        <SideNav />

        {/* Main Content Wrapper */}
        <DashboardLayoutWrapper>
          <TopAppBar />

          {/* Canvas. No width cap and no centring: either one would dump the
              leftover space into a margin, so the gap against the sidebar (and
              against the right edge) would change with the viewport and with
              the sidebar's collapsed state. Padding alone defines both gaps. */}
          <main className="flex-1 overflow-y-auto hide-scrollbar w-full">
            <div className="w-full p-4 md:p-container-padding">{children}</div>
          </main>
        </DashboardLayoutWrapper>
      </div>
    </AuthGate>
  );
}
