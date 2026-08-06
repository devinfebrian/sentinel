'use client';

import React, { useState } from 'react';
import type { AdminUser } from '@/lib/services/api';

export interface UserTableProps {
  users: AdminUser[];
  currentUserId: number | null;
  mutatingId: number | null;
  onResetPassword: (user: AdminUser) => void;
  onStatusChange: (user: AdminUser, isActive: boolean) => void;
}

// Pinned to UTC so the server and the browser format identically.
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
});

const formatLastActive = (value: string | null) =>
  value ? `${dateFormatter.format(new Date(value))} UTC` : 'Never logged in';

const getInitials = (fullname: string) =>
  fullname
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const STATUS_DOT: Record<AdminUser['status'], string> = {
  Active: 'bg-emerald-500',
  Pending: 'bg-amber-500',
  Inactive: 'bg-outline-variant',
};

function RoleBadge({ isAdmin }: { isAdmin: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full font-label-sm text-label-sm uppercase ${
        isAdmin
          ? 'bg-primary-container text-on-primary-container'
          : 'bg-surface-container-high text-on-surface-variant'
      }`}
    >
      {isAdmin ? 'Finance Lead' : 'Finance Staff'}
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
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-outline-variant/40">
            <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase">
              Name &amp; Email
            </th>
            <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase">
              Role
            </th>
            <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase">
              Status
            </th>
            <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase">
              Last Active
            </th>
            <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/30">
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            const isMutating = mutatingId === user.id;
            const isConfirming = confirmingId === user.id;

            return (
              <tr key={user.id} className="hover:bg-surface-container-low transition-colors">
                <td className="py-5 px-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-lg text-label-lg shrink-0">
                      {getInitials(user.fullname)}
                    </div>
                    <div>
                      <div className="font-body-md text-body-md text-on-surface font-semibold">
                        {user.fullname}
                      </div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant normal-case">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-5 px-6">
                  <RoleBadge isAdmin={user.isAdmin} />
                </td>
                <td className="py-5 px-6">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${STATUS_DOT[user.status]}`} />
                    <span className="font-body-md text-body-md text-on-surface">
                      {user.status}
                    </span>
                  </div>
                </td>
                <td className="py-5 px-6 font-body-md text-body-md text-on-surface-variant">
                  {formatLastActive(user.lastLoginAt)}
                </td>
                <td className="py-5 px-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onResetPassword(user)}
                      disabled={isMutating}
                      title="Reset password"
                      className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[20px]">key</span>
                    </button>

                    {isSelf ? (
                      <button
                        type="button"
                        disabled
                        title="You cannot deactivate your own account"
                        className="p-2.5 text-on-surface-variant/40 rounded-md cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[20px]">block</span>
                      </button>
                    ) : !user.isActive ? (
                      <button
                        type="button"
                        onClick={() => onStatusChange(user, true)}
                        disabled={isMutating}
                        title="Activate"
                        className="p-2.5 text-on-surface-variant hover:text-emerald-600 hover:bg-emerald-500/10 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          check_circle
                        </span>
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
                        className="p-2.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[20px]">block</span>
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
