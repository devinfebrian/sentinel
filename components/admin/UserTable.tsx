'use client';

import React, { useState } from 'react';
import type { AdminUser } from '@/lib/services/api';
import { formatTimestamp } from '@/lib/format/datetime';
import {
  CheckCircleIcon,
  KeyIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/outline';

export interface UserTableProps {
  users: AdminUser[];
  currentUserId: number | null;
  mutatingId: number | null;
  onResetPassword: (user: AdminUser) => void;
  onStatusChange: (user: AdminUser, isActive: boolean) => void;
}

const getInitials = (fullname: string) =>
  fullname
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const STATUS_DOT: Record<AdminUser['status'], string> = {
  Active: 'bg-success',
  Pending: 'bg-warning',
  Inactive: 'bg-outline-variant',
};

function RoleBadge({ isAdmin, dimmed }: { isAdmin: boolean; dimmed: boolean }) {
  const tone = isAdmin
    ? 'bg-tertiary-container text-on-tertiary-container'
    : 'bg-surface-container-high text-on-surface-variant';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold tracking-wide ${tone} ${
        dimmed ? 'opacity-70' : ''
      }`}
    >
      {isAdmin ? 'FINANCE LEAD' : 'FINANCE STAFF'}
    </span>
  );
}

export default function UserTable({
  users,
  currentUserId,
  mutatingId,
  onResetPassword,
  onStatusChange,
}: UserTableProps) {
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  if (users.length === 0) {
    return (
      <p className="font-body-md text-body-md text-on-surface-variant text-center py-10">
        No members match your filters.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-surface-container-high bg-surface-container-highest/30">
            <th className="px-4 py-3 text-left font-label-sm text-label-sm font-semibold text-on-surface-variant">
              Name &amp; Email
            </th>
            <th className="pl-6 pr-4 py-3 text-left font-label-sm text-label-sm font-semibold text-on-surface-variant">
              Role
            </th>
            <th className="px-4 py-3 text-left font-label-sm text-label-sm font-semibold text-on-surface-variant">
              Status
            </th>
            <th className="px-4 py-3 text-left font-label-sm text-label-sm font-semibold text-on-surface-variant">
              Last Active
            </th>
            <th className="px-4 py-3 text-right font-label-sm text-label-sm font-semibold text-on-surface-variant">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container-high font-table-data text-table-data text-on-surface">
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            const isMutating = mutatingId === user.id;
            const isConfirming = confirmingId === user.id;
            // Inactive rows are de-emphasised rather than hidden, so the
            // audit trail stays visible without competing for attention.
            const dimmed = !user.isActive;

            return (
              <tr
                key={user.id}
                className={`transition-colors hover:bg-surface-container-low ${
                  dimmed ? 'bg-surface-bright/50' : ''
                }`}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        dimmed
                          ? 'bg-surface-container text-on-surface-variant/50'
                          : user.isAdmin
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      {getInitials(user.fullname)}
                    </div>
                    <div>
                      <div
                        className={`font-semibold ${dimmed ? 'text-on-surface-variant/70' : ''}`}
                      >
                        {user.fullname}
                      </div>
                      <div
                        className={`text-xs ${
                          dimmed ? 'text-on-surface-variant/50' : 'text-on-surface-variant'
                        }`}
                      >
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-left">
                  <RoleBadge isAdmin={user.isAdmin} dimmed={dimmed} />
                </td>
                <td className="px-4 py-4">
                  <div className={`flex items-center gap-2 ${dimmed ? 'opacity-60' : ''}`}>
                    <span className={`h-2 w-2 rounded-full ${STATUS_DOT[user.status]}`} />
                    <span className="text-sm">{user.status}</span>
                  </div>
                </td>
                <td
                  className={`px-4 py-4 text-sm ${
                    dimmed ? 'text-on-surface-variant/50' : 'text-on-surface-variant'
                  }`}
                >
                  {formatTimestamp(user.lastLoginAt, 'Never logged in')}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onResetPassword(user)}
                      disabled={isMutating}
                      title="Reset password"
                      className="rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <KeyIcon aria-hidden="true" className="h-[18px] w-[18px]" />
                    </button>

                    {isSelf ? (
                      <button
                        type="button"
                        disabled
                        title="You cannot deactivate your own account"
                        className="cursor-not-allowed rounded-md p-1.5 text-on-surface-variant/40"
                      >
                        <NoSymbolIcon aria-hidden="true" className="h-[18px] w-[18px]" />
                      </button>
                    ) : !user.isActive ? (
                      <button
                        type="button"
                        onClick={() => onStatusChange(user, true)}
                        disabled={isMutating}
                        title="Activate"
                        className="rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-success/10 hover:text-success disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <CheckCircleIcon aria-hidden="true" className="h-[18px] w-[18px]" />
                      </button>
                    ) : isConfirming ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmingId(null);
                            onStatusChange(user, false);
                          }}
                          disabled={isMutating}
                          className="px-2 py-1 font-label-sm text-label-sm text-error hover:bg-error/10 rounded-md transition-colors disabled:opacity-40"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          className="px-2 py-1 font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-high rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingId(user.id)}
                        disabled={isMutating}
                        title="Deactivate"
                        className="rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-error-container/50 hover:text-error disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <NoSymbolIcon aria-hidden="true" className="h-[18px] w-[18px]" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
