'use client';

import React from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';

// Pinned to UTC so the server and the browser format identically; a machine in
// another zone would otherwise produce a different string and break hydration.
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
});

const formatTimestamp = (value: string | null) =>
  value ? `${dateFormatter.format(new Date(value))} UTC` : 'First sign-in';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3 border-b border-outline-variant/30 last:border-0">
      <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
        {label}
      </span>
      <span className="font-body-md text-body-md text-on-surface text-right">{value}</span>
    </div>
  );
}

export default function OverviewPage() {
  const user = useAuthStore((s) => s.user);

  // AuthGate holds the shell until the session resolves, so user is set here.
  if (!user) return null;

  const firstName = user.fullname.split(' ')[0];
  const roleLabel = user.isAdmin ? 'Finance Lead' : 'Finance Staff';

  return (
    <>
      <header>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
          Welcome back, {firstName}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">
          Signed in as {roleLabel}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <section className="lg:col-span-1 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Your account</h2>

          <div className="mt-4">
            <InfoRow label="Name" value={user.fullname} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow
              label="Role"
              value={
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full font-label-sm text-label-sm ${
                    user.isAdmin
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {roleLabel}
                </span>
              }
            />
            <InfoRow label="Last sign-in" value={formatTimestamp(user.lastLoginAt)} />
          </div>

          {user.isAdmin && (
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-4 leading-relaxed">
              As Finance Lead you can add and deactivate team members from Administration.
            </p>
          )}
        </section>

        <section className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 flex flex-col">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
            Financial modules
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Transaction recording, vendor management, and AI auditing are still being built.
            Nothing is shown here yet, rather than showing figures that are not real.
          </p>

          <ul className="mt-6 space-y-3">
            {[
              { icon: 'receipt_long', label: 'Transactions & vendors', note: 'In development' },
              { icon: 'query_stats', label: 'Analytics & reports', note: 'Planned' },
              { icon: 'security', label: 'AI audit findings', note: 'Planned' },
            ].map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-surface-container/40"
              >
                <span className="material-symbols-outlined text-on-surface-variant">
                  {item.icon}
                </span>
                <span className="font-body-md text-body-md text-on-surface flex-1">
                  {item.label}
                </span>
                <span className="font-label-sm text-label-sm uppercase text-outline">
                  {item.note}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
