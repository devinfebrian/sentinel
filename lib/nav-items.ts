import {
  BuildingStorefrontIcon,
  ChartBarIcon,
  DocumentTextIcon,
  KeyIcon,
  ShieldExclamationIcon,
  SparklesIcon,
  Squares2X2Icon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import type { IconComponent } from '@/lib/types/icon';

export interface NavItem {
  href: string;
  icon: IconComponent;
  label: string;
  adminOnly?: boolean;
  /** Route exists but is a placeholder until the AI service lands in Sprint 2. */
  soon?: boolean;
}

export interface NavGroup {
  id: string;
  /** `null` for the lead group, which sits above the first heading. */
  label: string | null;
  items: NavItem[];
}

// Single source of truth for the app's navigable pages, shared by the
// sidebar and the header search so the two can't drift apart.
export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'overview',
    label: null,
    items: [
      { href: '/', icon: Squares2X2Icon, label: 'Overview' },
      { href: '/dashboard', icon: ChartBarIcon, label: 'Dashboard' },
    ],
  },
  {
    id: 'audit',
    label: 'Audit',
    items: [
      { href: '/findings', icon: ShieldExclamationIcon, label: 'Findings' },
      { href: '/ask', icon: SparklesIcon, label: 'Ask Sentinel' },
    ],
  },
  {
    id: 'records',
    label: 'Records',
    items: [
      { href: '/transactions', icon: DocumentTextIcon, label: 'Transactions' },
      { href: '/vendors', icon: BuildingStorefrontIcon, label: 'Vendors' },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    items: [
      { href: '/administration', icon: UsersIcon, label: 'User Management', adminOnly: true },
    ],
  },
];

// Account-level destinations that live in the profile menu rather than the
// sidebar, but should still be reachable from the header search.
export const ACCOUNT_NAV_ITEMS: NavItem[] = [
  { href: '/change-password', icon: KeyIcon, label: 'Setup / Change Password' },
];
