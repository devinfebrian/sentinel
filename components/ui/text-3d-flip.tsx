'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAnimate, type ValueAnimationTransition } from 'motion/react';
import { cn } from '@/lib/utils';

// Adapted from Magic UI's `text-3d-flip`. The original only re-flips the
// same text on hover (front/back face render the same character — a reveal
// effect, not a content swap). This variant cycles through a list of full
// strings on an interval, flipping the whole row at once: everything
// rotates edge-on, the text underneath is swapped at that invisible
// midpoint, then it rotates back — same 3D mechanic, driving different
// content instead of the same content twice.

const ROTATION_MAP = {
  top: 'rotateX(90deg)',
  right: 'rotateY(90deg)',
  bottom: 'rotateX(-90deg)',
  left: 'rotateY(-90deg)',
} as const;

const DEFAULT_TRANSITION: ValueAnimationTransition = {
  type: 'spring',
  damping: 30,
  stiffness: 300,
};

export interface Text3DFlipHighlight {
  /** Text color for this entry's characters. */
  textClassName?: string;
  /** Background (+ implied padding/radius via the wrapper) behind this entry — the "highlighter" look. */
  bgClassName?: string;
}

export interface Text3DFlipProps {
  /** Strings to cycle through, in order, looping. */
  texts: string[];
  /** Milliseconds each string stays visible before flipping to the next. */
  interval?: number;
  className?: string;
  textClassName?: string;
  staggerDuration?: number;
  rotateDirection?: 'top' | 'right' | 'bottom' | 'left';
  /** Per-index override — every entry can carry its own ink and/or highlight background, not just one "the highlighted one" slot. */
  highlights?: Record<number, Text3DFlipHighlight>;
}

export function Text3DFlip({
  texts,
  interval = 2600,
  className,
  textClassName,
  staggerDuration = 0.03,
  rotateDirection = 'top',
  highlights,
}: Text3DFlipProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scope, animate] = useAnimate();
  const isAnimatingRef = useRef(false);
  const isMountedRef = useRef(false);

  const maxLength = useMemo(() => Math.max(...texts.map((t) => t.length)), [texts]);
  const activeText = texts[activeIndex];
  const chars = useMemo(
    () => activeText.padEnd(maxLength, ' ').split(''),
    [activeText, maxLength]
  );
  const activeHighlight = highlights?.[activeIndex];

  const rotationTransform = ROTATION_MAP[rotateDirection];

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const flipToNext = useCallback(async () => {
    if (isAnimatingRef.current || texts.length < 2) return;
    isAnimatingRef.current = true;

    try {
      // Closing: rotate the current text edge-on, staggered front-to-back.
      await animate(
        '.text-3d-flip-char',
        { transform: rotationTransform },
        { ...DEFAULT_TRANSITION, delay: (i: number) => i * staggerDuration }
      );

      if (!isMountedRef.current) return;
      setActiveIndex((i) => (i + 1) % texts.length);

      // Entry: rotate the new text back into place with the same spring +
      // stagger as the close, just reversed. This used to be an instant
      // `duration: 0` snap, which is why it read as having no animation.
      await animate(
        '.text-3d-flip-char',
        { transform: 'rotateX(0deg) rotateY(0deg)' },
        { ...DEFAULT_TRANSITION, delay: (i: number) => i * staggerDuration }
      );
    } finally {
      isAnimatingRef.current = false;
    }
  }, [animate, rotationTransform, staggerDuration, texts.length]);

  useEffect(() => {
    if (texts.length < 2) return;
    const id = setInterval(flipToNext, interval);
    return () => clearInterval(id);
  }, [flipToNext, interval, texts.length]);

  return (
    // The highlight background only wraps the real characters (`chars.slice(0, activeText.length)`);
    // the padEnd() filler chars render outside it, invisible — otherwise the box sizes to the
    // longest cycled string (e.g. "Finance Lead") even while showing a shorter one ("Bastion").
    <span className={cn('relative inline-flex items-center', className)} ref={scope}>
      <span
        className={cn(
          'inline-flex items-center rounded-lg px-2 py-0.5 transition-colors duration-300',
          activeHighlight?.bgClassName
        )}
      >
        {chars.slice(0, activeText.length).map((char, i) => (
          <span key={i} className="text-3d-flip-char inline-block" style={{ transformStyle: 'preserve-3d' }}>
            <span className={cn('inline-block whitespace-pre', activeHighlight?.textClassName ?? textClassName)}>
              {char}
            </span>
          </span>
        ))}
      </span>
      {chars.slice(activeText.length).map((char, i) => (
        <span
          key={activeText.length + i}
          aria-hidden="true"
          className="text-3d-flip-char invisible inline-block"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <span className="inline-block whitespace-pre">{char}</span>
        </span>
      ))}
    </span>
  );
}
