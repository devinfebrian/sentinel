'use client';

import React, { useCallback, useEffect, useRef, type ComponentPropsWithoutRef } from 'react';
import { useReducedMotion } from 'motion/react';

// Vendored from Magic UI (`particles`). Adapted for this repo:
//  - no `cn` helper;
//  - the pointer is tracked in a ref rather than React state. Upstream calls
//    setState on every mousemove, which re-renders the component dozens of
//    times a second for a value only the canvas loop reads;
//  - under prefers-reduced-motion the field is drawn once and left static,
//    so the texture survives but the drift and the cursor pull do not.

interface ParticlesProps extends ComponentPropsWithoutRef<'div'> {
  quantity?: number;
  /** Higher = less pull toward the cursor. */
  staticity?: number;
  /** Higher = slower easing toward the cursor. */
  ease?: number;
  size?: number;
  color?: string;
  /** Constant drift, in px per frame. */
  vx?: number;
  vy?: number;
  /** Peak opacity of a particle. Upstream's ceiling is 0.7. */
  maxAlpha?: number;
}

type Circle = {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
};

function hexToRgb(hex: string): [number, number, number] {
  let value = hex.replace('#', '');

  if (value.length === 3) {
    value = value
      .split('')
      .map((char) => char + char)
      .join('');
  }

  const int = parseInt(value, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

const remap = (value: number, start1: number, end1: number, start2: number, end2: number) => {
  const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
  return remapped > 0 ? remapped : 0;
};

export function Particles({
  className,
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  color = '#ffffff',
  vx = 0,
  vy = 0,
  maxAlpha = 0.7,
  ...props
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const mouse = useRef({ x: 0, y: 0 });
  const canvasSize = useRef({ w: 0, h: 0 });
  const rafId = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  const rgb = hexToRgb(color);
  const rgbKey = rgb.join(', ');

  const circleParams = useCallback((): Circle => {
    const alphaFloor = Math.min(0.1, maxAlpha);
    return {
      x: Math.floor(Math.random() * canvasSize.current.w),
      y: Math.floor(Math.random() * canvasSize.current.h),
      translateX: 0,
      translateY: 0,
      size: Math.floor(Math.random() * 2) + size,
      alpha: 0,
      targetAlpha: parseFloat(
        (Math.random() * (maxAlpha - alphaFloor) + alphaFloor).toFixed(2)
      ),
      dx: (Math.random() - 0.5) * 0.1,
      dy: (Math.random() - 0.5) * 0.1,
      magnetism: 0.1 + Math.random() * 4,
    };
  }, [maxAlpha, size]);

  const drawCircle = useCallback(
    (circle: Circle, dpr: number) => {
      const ctx = contextRef.current;
      if (!ctx) return;

      ctx.translate(circle.translateX, circle.translateY);
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.size, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(${rgbKey}, ${circle.alpha})`;
      ctx.fill();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },
    [rgbKey]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    contextRef.current = ctx;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvasSize.current.w = container.offsetWidth;
      canvasSize.current.h = container.offsetHeight;

      canvas.width = canvasSize.current.w * dpr;
      canvas.height = canvasSize.current.h * dpr;
      canvas.style.width = `${canvasSize.current.w}px`;
      canvas.style.height = `${canvasSize.current.h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      circles.current = Array.from({ length: quantity }, circleParams);
    };

    const clear = () => ctx.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);

    // Static pass: particles sit at full opacity where they were seeded.
    const drawStatic = () => {
      clear();
      for (const circle of circles.current) {
        drawCircle({ ...circle, alpha: circle.targetAlpha }, dpr);
      }
    };

    const animate = () => {
      clear();

      circles.current.forEach((circle, i) => {
        // Fade a particle out as it approaches any edge, so none of them
        // visibly pop in or out at the boundary.
        const edges = [
          circle.x + circle.translateX - circle.size,
          canvasSize.current.w - circle.x - circle.translateX - circle.size,
          circle.y + circle.translateY - circle.size,
          canvasSize.current.h - circle.y - circle.translateY - circle.size,
        ];
        const closestEdge = Math.min(...edges);
        const edgeFade = parseFloat(remap(closestEdge, 0, 20, 0, 1).toFixed(2));

        if (edgeFade > 1) {
          circle.alpha = Math.min(circle.alpha + 0.02, circle.targetAlpha);
        } else {
          circle.alpha = circle.targetAlpha * edgeFade;
        }

        circle.x += circle.dx + vx;
        circle.y += circle.dy + vy;
        circle.translateX +=
          (mouse.current.x / (staticity / circle.magnetism) - circle.translateX) / ease;
        circle.translateY +=
          (mouse.current.y / (staticity / circle.magnetism) - circle.translateY) / ease;

        drawCircle(circle, dpr);

        const escaped =
          circle.x < -circle.size ||
          circle.x > canvasSize.current.w + circle.size ||
          circle.y < -circle.size ||
          circle.y > canvasSize.current.h + circle.size;

        if (escaped) circles.current[i] = circleParams();
      });

      rafId.current = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const { w, h } = canvasSize.current;
      const x = event.clientX - rect.left - w / 2;
      const y = event.clientY - rect.top - h / 2;
      if (x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2) {
        mouse.current = { x, y };
      }
    };

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        if (reduceMotion) drawStatic();
      }, 200);
    };

    resize();
    if (reduceMotion) {
      drawStatic();
    } else {
      window.addEventListener('pointermove', handlePointerMove);
      animate();
    }
    window.addEventListener('resize', handleResize);

    return () => {
      if (rafId.current != null) window.cancelAnimationFrame(rafId.current);
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [circleParams, drawCircle, ease, quantity, reduceMotion, staticity, vx, vy]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={['pointer-events-none', className].filter(Boolean).join(' ')}
      {...props}
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}
