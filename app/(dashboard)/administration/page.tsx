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

type LoadStatus = 'loading' | 'ready' | 'error';
type RoleFilter = 'all' | 'admin' | 'staff';
type StatusFilter = 'all' | AdminUser['status'];
type SortBy = 'name' | 'recent';

interface Reveal {
  email: string;
  tempPassword: string;
  notice: string;
}

interface FilterSelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}

// Native selects render their own arrow flush against the border in most
// browsers; appearance-none plus a manually-placed chevron gives it real
// breathing room instead.
function FilterSelect<T extends string>({ value, onChange, options }: FilterSelectProps<T>) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none bg-surface-container-lowest border border-outline-variant rounded pl-3 pr-9 py-2.5 font-body-md text-body-md text-on-surface-variant focus:outline-none focus:border-primary-container"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
        expand_more
      </span>
    </div>
  );
}

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
          err instanceof ApiError ? err.message : 'Unable to load members. Please try again.'
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
        err instanceof ApiError ? err.message : 'Unable to reset this password. Please try again.'
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
        err instanceof ApiError ? err.message : 'Unable to update this member. Please try again.'
      );
    } finally {
      setMutatingId(null);
    }
  };

  // Nothing to show while the redirect in the effect above lands.
  if (!currentUser || !currentUser.isAdmin) return null;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            User Management
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Manage Finance Lead and Finance Staff accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setRegisterOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary-container text-on-primary-container px-6 py-3 rounded-lg font-label-lg text-label-lg uppercase hover:bg-primary-fixed transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Register New Member
        </button>
      </header>

      {bannerError && (
        <AlertNotice variant="error" icon="error" message={bannerError} />
      )}

      <div className="flex flex-col md:flex-row gap-6 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40">
        <div className="flex-1 md:max-w-sm relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
            search
          </span>
          <input
            id="user-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <FilterSelect
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'admin', label: 'Finance Lead' },
              { value: 'staff', label: 'Finance Staff' },
            ]}
          />

          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'Active', label: 'Active' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />

          <FilterSelect
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'name', label: 'Sort: Name A-Z' },
              { value: 'recent', label: 'Sort: Recently active' },
            ]}
          />
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40">
        {status === 'loading' && (
          <p className="font-body-md text-body-md text-on-surface-variant text-center py-12">
            Loading members...
          </p>
        )}

        {status === 'error' && (
          <div className="p-6 space-y-4">
            <AlertNotice
              variant="error"
              icon="error"
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
            <div className="px-6 py-4 border-t border-outline-variant/40">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Showing {filteredUsers.length} of {users.length} members
              </span>
            </div>
          </>
        )}
      </div>

      <RegisterMemberModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onRegistered={handleRegistered}
      />

      <Modal open={reveal !== null} onClose={() => setReveal(null)} title="Password Reset" size="sm">
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
