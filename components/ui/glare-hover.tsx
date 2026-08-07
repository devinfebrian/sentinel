'use client';

import type { ComponentProps, CSSProperties } from 'react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

// Vendored from Magic UI (`glare-hover`). Adapted: `background` defaults to
// `transparent` instead of `#000` so it composes with an existing panel
// background rather than painting over it, and `width`/`height` default to
// `100%` since every caller here wraps a full-size card, not an inline chip.

type Color = `#${string}`;
type RGBA = `rgba(${number},${number},${number},${number})`;

export interface GlareHoverProps extends ComponentProps<'div'> {
  width?: string;
  height?: string;
  background?: string;
  /** Glare highlight as `#rrggbb` or `#rgb`; parsed to `rgba` for the gradient. */
  color?: Color;
  /** Opacity applied to the glare color when converting hex to `rgba` (0-1). */
  opacity?: number;
  /** Gradient angle in degrees. */
  angle?: number;
  /** Glare tile size as a percentage of the element. */
  size?: number;
  /** Transition duration for the glare sweep in milliseconds. */
  duration?: number;
  /** When true, the glare transition only runs on hover (no animation until pointer enters). */
  playOnce?: boolean;
}

function parseHEX(color: Color, opacity: number): RGBA | Color {
  const hex = color.replace('#', '');
  const parse = (h: string) => Number.parseInt(h, 16);
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    return `rgba(${parse(hex.slice(0, 2))},${parse(hex.slice(2, 4))},${parse(hex.slice(4, 6))},${opacity})`;
  }
  if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    return `rgba(${parse(hex[0] + hex[0])},${parse(hex[1] + hex[1])},${parse(hex[2] + hex[2])},${opacity})`;
  }
  return color;
}

export function GlareHover({
  background = 'transparent',
  children,
  color = '#ffffff',
  opacity = 0.5,
  angle = -45,
  size = 250,
  duration = 650,
  playOnce = false,
  className,
  style,
  width = '100%',
  height = '100%',
  ...props
}: GlareHoverProps) {
  const rgba = useMemo(() => parseHEX(color, opacity), [color, opacity]);

  const cssVars = {
    '--gh-angle': `${angle}deg`,
    '--gh-duration': `${duration}ms`,
    '--gh-size': `${size}%`,
    '--gh-rgba': rgba,
    background,
    width,
    height,
    ...style
  } as CSSProperties;

  return (
    <div
      {...props}
      className={cn(
        'relative grid size-fit place-items-center overflow-hidden bg-transparent',
        "before:pointer-events-none before:absolute before:inset-0 before:z-10 before:bg-no-repeat before:content-['']",
        'before:[background-image:linear-gradient(var(--gh-angle),transparent_60%,var(--gh-rgba)_70%,transparent,transparent_100%)]',
        'before:[background-size:var(--gh-size)_var(--gh-size),100%_100%]',
        'before:[background-position:-100%_-100%,0_0]',
        !playOnce && 'before:transition-[background-position] before:duration-[var(--gh-duration)] before:ease-in-out',
        playOnce && 'before:transition-none hover:before:transition-[background-position] hover:before:duration-[var(--gh-duration)]',
        'hover:before:[background-position:100%_100%,0_0]',
        className
      )}
      style={cssVars}
    >
      {children}
    </div>
  );
}
