'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'motion/react';

// Vendored from Magic UI (`magic-card`). Adapted for this repo: no `cn`
// helper, and the `next-themes` dependency is dropped along with the dark
// branch — globals.css declares `color-scheme: light` with no dark variant.
// Defaults are the app's own surface/outline tokens rather than raw hex, so a
// palette change flows through without touching this file.

interface MagicCardProps {
  children?: React.ReactNode;
  className?: string;
  /** Radius of the cursor-following spotlight, in px. */
  gradientSize?: number;
  /** Fill of the spotlight itself. */
  gradientColor?: string;
  gradientOpacity?: number;
  /** The two hues the lit section of the border runs between. */
  gradientFrom?: string;
  gradientTo?: string;
}

export function MagicCard({
  children,
  className,
  gradientSize = 220,
  gradientColor = 'var(--color-primary-container)',
  gradientOpacity = 0.5,
  gradientFrom = 'var(--color-primary)',
  gradientTo = 'var(--color-primary-fixed-dim)',
}: MagicCardProps) {
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);
  const gradientSizeRef = useRef(gradientSize);

  useEffect(() => {
    gradientSizeRef.current = gradientSize;
  }, [gradientSize]);

  // Park the spotlight off-canvas so the border sits at its resting colour.
  const reset = useCallback(() => {
    const off = -gradientSizeRef.current;
    mouseX.set(off);
    mouseY.set(off);
  }, [mouseX, mouseY]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    // A pointer that leaves the window never fires pointerleave on the card,
    // so the spotlight would stay stuck where it was last seen.
    const handleGlobalPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) reset();
    };
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') reset();
    };

    window.addEventListener('pointerout', handleGlobalPointerOut);
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('pointerout', handleGlobalPointerOut);
      window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [reset]);

  const border = useMotionTemplate`
    linear-gradient(var(--color-surface-container-lowest) 0 0) padding-box,
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientFrom},
      ${gradientTo},
      var(--color-outline-variant) 100%
    ) border-box
  `;

  const spotlight = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientColor},
      transparent 100%
    )
  `;

  return (
    <motion.div
      className={[
        'group/magic relative isolate overflow-hidden rounded-[inherit] border border-transparent',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={{ background: border }}
    >
      <div className="absolute inset-px z-20 rounded-[inherit] bg-surface-container-lowest" />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-px z-30 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/magic:opacity-100"
        style={{ background: spotlight, opacity: gradientOpacity }}
      />

      <div className="relative z-40 h-full">{children}</div>
    </motion.div>
  );
}
