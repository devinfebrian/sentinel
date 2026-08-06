'use client';

import { useMemo, type CSSProperties, type HTMLAttributes } from 'react';
import { motion, useReducedMotion } from 'motion/react';

// Vendored from Magic UI (`light-rays`). Adapted for this repo:
//  - no `cn` helper;
//  - the animation drops out under prefers-reduced-motion, since the global
//    rule in globals.css only neutralises CSS transitions, not Motion's
//    JS-driven ones;
//  - ray geometry is seeded rather than `Math.random()`, so the server and
//    client produce identical markup. Upstream sidesteps the mismatch by
//    generating rays in an effect after mount; a seed avoids both the
//    mismatch and the extra render.

interface LightRaysProps extends HTMLAttributes<HTMLDivElement> {
  count?: number;
  color?: string;
  blur?: number;
  speed?: number;
  length?: string;
  /** Change to reshuffle the ray layout. */
  seed?: number;
}

/** mulberry32 — small, fast, and good enough for scattering decoration. */
const makeRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type LightRay = {
  id: string;
  left: number;
  rotate: number;
  width: number;
  swing: number;
  delay: number;
  duration: number;
  intensity: number;
};

const createRays = (count: number, cycle: number, seed: number): LightRay[] => {
  if (count <= 0) return [];

  const random = makeRandom(seed);

  return Array.from({ length: count }, (_, index) => {
    const left = 8 + random() * 84;
    const rotate = -28 + random() * 56;
    const width = 160 + random() * 160;
    const swing = 0.8 + random() * 1.8;
    const delay = random() * cycle;
    const duration = cycle * (0.75 + random() * 0.5);
    const intensity = 0.6 + random() * 0.5;

    return {
      id: `${index}-${Math.round(left * 10)}`,
      left,
      rotate,
      width,
      swing,
      delay,
      duration,
      intensity,
    };
  });
};

function Ray({ left, rotate, width, swing, delay, duration, intensity }: LightRay) {
  return (
    <motion.div
      className="pointer-events-none absolute -top-[12%] left-[var(--ray-left)] h-[var(--light-rays-length)] w-[var(--ray-width)] origin-top -translate-x-1/2 rounded-full bg-linear-to-b from-[color-mix(in_srgb,var(--light-rays-color)_70%,transparent)] to-transparent opacity-0 mix-blend-screen blur-[var(--light-rays-blur)]"
      style={
        {
          '--ray-left': `${left}%`,
          '--ray-width': `${width}px`,
        } as CSSProperties
      }
      initial={{ rotate }}
      animate={{
        opacity: [0, intensity, 0],
        rotate: [rotate - swing, rotate + swing, rotate - swing],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
        repeatDelay: duration * 0.1,
      }}
    />
  );
}

export function LightRays({
  className,
  style,
  count = 7,
  color = 'rgba(160, 210, 255, 0.2)',
  blur = 36,
  speed = 14,
  length = '70vh',
  seed = 1,
  ...props
}: LightRaysProps) {
  const reduceMotion = useReducedMotion();
  const cycleDuration = Math.max(speed, 0.1);
  const rays = useMemo(
    () => createRays(count, cycleDuration, seed),
    [count, cycleDuration, seed]
  );

  return (
    <div
      aria-hidden="true"
      className={[
        'pointer-events-none absolute inset-0 isolate overflow-hidden rounded-[inherit]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        {
          '--light-rays-color': color,
          '--light-rays-blur': `${blur}px`,
          '--light-rays-length': length,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(circle at 20% 15%, color-mix(in srgb, var(--light-rays-color) 45%, transparent), transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(circle at 80% 10%, color-mix(in srgb, var(--light-rays-color) 35%, transparent), transparent 75%)',
          }}
        />
        {/* The static wash above still reads as light from overhead, so the
            reduced-motion case keeps the atmosphere and loses only the sweep. */}
        {!reduceMotion && rays.map((ray) => <Ray key={ray.id} {...ray} />)}
      </div>
    </div>
  );
}
