'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AlertNotice from '@/components/common/AlertNotice';
import Modal from '@/components/common/Modal';
import TempPasswordPanel from '@/components/admin/TempPasswordPanel';
import RegisterMemberModal from '@/components/admin/RegisterMemberModal';
import UserTable from '@/components/admin/UserTable';
import {
  listUsersApi,
  resetPasswordApi,
  setUserStatusApi,
  ApiError,
  type AdminUser,
} from '@/lib/services/api';
import { useAuthStore } from '@/lib/stores/auth.store';
import {
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { FilterSelect, FILTER_INPUT_CLASSES } from '@/components/common/FilterControls';
import RippleButton, { PRIMARY_ACTION_CLASSES } from '@/components/common/RippleButton';

type LoadStatus = 'loading' | 'ready' | 'error';
type RoleFilter = 'all' | 'admin' | 'staff';
type StatusFilter = 'all' | AdminUser['status'];
type SortBy = 'name' | 'recent';

interface Reveal {
  email: string;
  tempPassword: string;
  notice: string;
}

const FILTER_WIDTH = 'flex-1 md:w-36 md:flex-none';

export default function AdministrationPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [status, setStatus] = useState<LoadStatus>('loading');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [mutatingId, setMutatingId] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');

  const [registerOpen, setRegisterOpen] = useState(false);
  const [reveal, setReveal] = useState<Reveal | null>(null);

  // Bumped by the "Try again" button to re-run the fetch below.
  const [reloadKey, setReloadKey] = useState(0);

  // Belt-and-suspenders: SideNav already hides this route from non-admins,
  // this guards direct navigation and a stale client-side isAdmin claim.
  useEffect(() => {
    if (!currentUser) return;
    if (!currentUser.isAdmin) {
      router.replace('/');
      return;
    }
    if (!accessToken) return;

    let cancelled = false;

    const load = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setStatus('loading');
      setLoadError(null);

      try {
        const res = await listUsersApi(accessToken);
        if (cancelled) return;
        setUsers(res.data.users);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 403) {
          router.replace('/');
          return;
        }
        setLoadError(
          err instanceof ApiError ? err.message : 'Unable to load members. Please try again.',
        );
        setStatus('error');
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [currentUser, accessToken, router, reloadKey]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = users.filter((u) => {
      if (q && !`${u.fullname} ${u.email}`.toLowerCase().includes(q)) return false;
      if (roleFilter === 'admin' && !u.isAdmin) return false;
      if (roleFilter === 'staff' && u.isAdmin) return false;
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') return a.fullname.localeCompare(b.fullname);
      const aTime = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
      const bTime = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [users, search, roleFilter, statusFilter, sortBy]);

  const handleRegistered = (user: AdminUser) => {
    setUsers((prev) => [user, ...prev]);
  };

  const handleResetPassword = async (user: AdminUser) => {
    if (!accessToken) return;
    setBannerError(null);
    setMutatingId(user.id);

    try {
      const res = await resetPasswordApi(user.id, accessToken);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? res.data.user : u)));
      setReveal({
        email: res.data.user.email,
        tempPassword: res.data.tempPassword,
        notice: res.data.notice,
      });
    } catch (err) {
      setBannerError(
        err instanceof ApiError ? err.message : 'Unable to reset this password. Please try again.',
      );
    } finally {
      setMutatingId(null);
    }
  };

  const handleStatusChange = async (user: AdminUser, isActive: boolean) => {
    if (!accessToken) return;
    setBannerError(null);
    setMutatingId(user.id);

    try {
      const res = await setUserStatusApi(user.id, isActive, accessToken);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? res.data.user : u)));
    } catch (err) {
      setBannerError(
        err instanceof ApiError ? err.message : 'Unable to update this member. Please try again.',
      );
    } finally {
      setMutatingId(null);
    }
  };

  // Nothing to show while the redirect in the effect above lands.
  if (!currentUser || !currentUser.isAdmin) return null;

  return (
    <div className="space-y-stack-lg">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            User Management
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Manage team members, roles, and system access
          </p>
        </div>

        <RippleButton
          type="button"
          onClick={() => setRegisterOpen(true)}
          className={`${PRIMARY_ACTION_CLASSES} w-full md:w-auto`}
        >
          <UserPlusIcon aria-hidden="true" className="h-5 w-5" />
          Register New Member
        </RippleButton>
      </header>

      {bannerError && (
        <AlertNotice variant="error" icon={ExclamationCircleIcon} message={bannerError} />
      )}

      <div className="space-y-stack-md">
        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-surface-container-high bg-surface p-4 card-shadow md:flex-row">
          <div className="relative w-full flex-1 md:max-w-sm">
            <MagnifyingGlassIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              id="user-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className={`${FILTER_INPUT_CLASSES} pl-10 pr-4`}
            />
          </div>

          <div className="flex w-full gap-3 md:w-auto">
            <FilterSelect
              label="Filter by role"
              value={roleFilter}
              onChange={setRoleFilter}
              className={FILTER_WIDTH}
            >
              <option value="all">All Roles</option>
              <option value="admin">Finance Lead</option>
              <option value="staff">Finance Staff</option>
            </FilterSelect>

            <FilterSelect
              label="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              className={FILTER_WIDTH}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </FilterSelect>

            <FilterSelect
              label="Sort members"
              value={sortBy}
              onChange={setSortBy}
              className={FILTER_WIDTH}
            >
              <option value="name">Sort: Name A-Z</option>
              <option value="recent">Sort: Recent</option>
            </FilterSelect>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-surface-container-high bg-surface card-shadow">
          {status === 'loading' && (
            <p className="py-12 text-center font-body-md text-body-md text-on-surface-variant">
              Loading members...
            </p>
          )}

          {status === 'error' && (
            <div className="space-y-4 p-6">
              <AlertNotice
                variant="error"
                icon={ExclamationCircleIcon}
                message={loadError ?? 'Something went wrong.'}
              />
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="font-label-lg text-label-lg text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {status === 'ready' && (
            <>
              <UserTable
                users={filteredUsers}
                currentUserId={currentUser.id}
                mutatingId={mutatingId}
                onResetPassword={handleResetPassword}
                onStatusChange={handleStatusChange}
              />
              <div className="flex items-center justify-between border-t border-surface-container-high bg-surface-bright px-4 py-3">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Showing {filteredUsers.length} of {users.length} users
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <RegisterMemberModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onRegistered={handleRegistered}
      />

      <Modal open={reveal !== null} onClose={() => setReveal(null)} size="sm" bare>
        {reveal && (
          <TempPasswordPanel
            email={reveal.email}
            tempPassword={reveal.tempPassword}
            notice={reveal.notice}
            onDone={() => setReveal(null)}
          />
        )}
      </Modal>
    </div>
  );
}
