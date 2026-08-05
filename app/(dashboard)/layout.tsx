import React from 'react';
import SideNav from '@/components/SideNav';
import TopAppBar from '@/components/TopAppBar';
import AuthGate from '@/components/auth/AuthGate';

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
        <div className="flex-1 flex flex-col md:ml-[260px] h-full overflow-hidden w-full">
          <TopAppBar />

          {/* Canvas */}
          <main className="flex-1 overflow-y-auto hide-scrollbar p-margin-mobile md:p-margin-desktop w-full max-w-container-max mx-auto flex flex-col gap-stack-lg">
            {children}
          </main>
        </div>
      </div>
    </AuthGate>
  );
}
