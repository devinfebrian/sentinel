'use client';

import React, { useEffect, useState } from 'react';

/**
 * Shared geometry for the primary "create" action on every list page, so
 * Register New Member / Add Vendor / Add Transaction stay identical instead of
 * each page inventing its own height, radius, and label size.
 */
export const PRIMARY_ACTION_CLASSES =
  'inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-container px-6 font-label-lg text-label-lg text-on-primary-container transition-colors interactive-shadow hover:bg-primary-fixed disabled:cursor-not-allowed disabled:opacity-50';

/** Same box, outline treatment — for the secondary action beside it. */
export const SECONDARY_ACTION_CLASSES =
  'inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface px-6 font-label-lg text-label-lg text-primary transition-colors card-shadow hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50';

interface Ripple {
  x: number;
  y: number;
  size: number;
  key: number;
}

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Colour of the expanding circle. Defaults to a dark wash that reads on the lime container. */
  rippleColor?: string;
  /** Milliseconds the ripple takes to fade out. */
  durationMs?: number;
}

/**
 * A button that expands a circle from the click point. Ported from MagicUI's
 * ripple button rather than installed, since this project has no shadcn/MagicUI
 * registry set up and the component is self-contained.
 *
 * The ripple is decorative: it is driven by pointer coordinates, so keyboard
 * activation simply gets no ripple rather than one in an arbitrary spot. The
 * global prefers-reduced-motion rule already collapses the animation.
 */
export default function RippleButton({
  className = '',
  children,
  rippleColor = 'rgba(25, 30, 0, 0.18)',
  durationMs = 600,
  onClick,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    setRipples((prev) => [
      ...prev,
      {
        size,
        x: event.clientX - rect.left - size / 2,
        y: event.clientY - rect.top - size / 2,
        key: Date.now(),
      },
    ]);
    onClick?.(event);
  };

  // Retires each ripple once its animation is over. setState happens in the
  // timeout callback, never synchronously in the effect body.
  useEffect(() => {
    if (ripples.length === 0) return;
    const newest = ripples[ripples.length - 1];
    const timeout = setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.key !== newest.key));
    }, durationMs);
    return () => clearTimeout(timeout);
  }, [ripples, durationMs]);

  return (
    <button
      {...props}
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
    >
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      <span className="pointer-events-none absolute inset-0" aria-hidden="true">
        {ripples.map((ripple) => (
          <span
            key={ripple.key}
            className="absolute animate-rippling rounded-full opacity-30"
            style={{
              width: ripple.size,
              height: ripple.size,
              top: ripple.y,
              left: ripple.x,
              backgroundColor: rippleColor,
              animationDuration: `${durationMs}ms`,
            }}
          />
        ))}
      </span>
    </button>
  );
}
