'use client';

import React, { useCallback, useRef, useState } from 'react';

interface GridFollowCursorProps {
  /** Grid cell size in px */
  gridSize?: number;
  /** How many cells around cursor to highlight */
  highlightRadius?: number;
  className?: string;
}

export function GridFollowCursor({
  gridSize = 28,
  highlightRadius = 5,
  className = '',
}: GridFollowCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setMousePos(null);
  }, []);

  const spotlightPx = highlightRadius * gridSize;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Base grid — very faint */}
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="hero-grid-base"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke="rgba(87, 100, 0, 0.12)"
              strokeWidth="0.75"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid-base)" />
      </svg>

      {/* Highlighted grid near cursor — brighter, masked to a radial gradient */}
      {mousePos && (
        <>
          <svg
            className="absolute inset-0 h-full w-full transition-opacity duration-150"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              maskImage: `radial-gradient(circle ${spotlightPx}px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
              WebkitMaskImage: `radial-gradient(circle ${spotlightPx}px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
            }}
          >
            <defs>
              <pattern
                id="hero-grid-highlight"
                width={gridSize}
                height={gridSize}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                  fill="none"
                  stroke="rgba(87, 100, 0, 0.3)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid-highlight)" />
          </svg>

          {/* Soft glow behind cursor */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: spotlightPx * 2,
              height: spotlightPx * 2,
              left: mousePos.x - spotlightPx,
              top: mousePos.y - spotlightPx,
              background: `radial-gradient(circle, rgba(190, 207, 99, 0.08) 0%, transparent 70%)`,
            }}
          />
        </>
      )}
    </div>
  );
}
