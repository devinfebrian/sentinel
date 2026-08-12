'use client';

import { useTheme } from 'next-themes';
import { Toaster } from 'sonner';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

/**
 * Client-only wrapper so `<Toaster>` can read the app's actual dark-mode
 * state via next-themes — `app/layout.tsx` is a Server Component and can't
 * call useTheme() itself. `theme="system"` on sonner would instead follow
 * the OS/browser preference, which can disagree with the in-app toggle.
 *
 * Colors are set via the `style` prop (CSS custom properties), not
 * `toastOptions.classNames` — sonner's own stylesheet sets `--normal-bg`/
 * `--normal-border` on `[data-sonner-toaster][data-sonner-theme=...]`, a
 * compound attribute selector that beats a plain Tailwind utility class on
 * the toast element itself. An inline style on the toaster root always wins
 * that fight, and custom properties inherit down to each toast for free.
 */
export function AppToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="bottom-right"
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      duration={6000}
      icons={{ success: <CheckCircleIcon className="h-5 w-5 text-[#c3d661]" /> }}
      style={
        {
          // White in light mode, near-black in dark mode — sonner's own
          // per-theme defaults (#fff / #000) already do this; overriding it
          // explicitly to the app's own surface token keeps it in lockstep
          // if that token ever moves.
          '--normal-bg': 'var(--surface-container-lowest)',
          '--normal-text': 'var(--on-surface)',
          // Fixed to dark mode's --primary (#c3d661), the same
          // bright lime-yellow used for the Cash Flow Trend bars and the
          // finding-detail header button — a brand accent, not a
          // theme-relative one.
          '--normal-border': '#c3d661',
          '--border-radius': '12px',
        } as React.CSSProperties
      }
      toastOptions={{
        // box-shadow isn't exposed as a CSS variable in sonner's stylesheet
        // (it's a literal value on the same high-specificity selector as
        // the background), so it's set the same inline way, per-toast.
        style: { boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)' },
      }}
    />
  );
}
