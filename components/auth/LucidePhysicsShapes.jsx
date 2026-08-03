'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Triangle, Box, Asterisk, BookAIcon } from 'lucide-react';

// Custom Lucide-style Phi (Φ) SVG Icon
function PhiIcon({ size = 240, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="6.5" />
      <line x1="12" y1="1.5" x2="12" y2="22.5" />
      <circle cx="12" cy="1.5" r="0.75" fill="currentColor" />
      <circle cx="12" cy="22.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

export default function LucidePhysicsShapes() {
  const shapesRef = useRef([
    {
      id: 'triangle',
      name: 'Segitiga',
      iconComponent: Triangle,
      size: 260, // Large size in px
      radius: 130, // Bounding collision radius
      x: 0,
      y: 0,
      vx: 0.75,
      vy: 0.55,
      rot: 0,
      rotSpeed: 0.002,
      color: 'text-[#516522]', // Primary Lime Green
    },
    {
      id: 'box',
      name: 'Kubus 3D',
      iconComponent: Box,
      size: 280, // Large size in px
      radius: 140,
      x: 0,
      y: 0,
      vx: -0.65,
      vy: 0.7,
      rot: 0.2,
      rotSpeed: -0.0018,
      color: 'text-[#69577c]', // Secondary Lavender
    },
    {
      id: 'book',
      name: 'Buku',
      iconComponent: BookAIcon,
      size: 270, // Large size in px
      radius: 135,
      x: 0,
      y: 0,
      vx: 0.7,
      vy: -0.6,
      rot: -0.1,
      rotSpeed: 0.0015,
      color: 'text-[#2b6cb0]', // Sky Blue
    },
    {
      id: 'asterisk',
      name: 'Asterisk (*)',
      iconComponent: Asterisk,
      size: 280, // Large size in px
      radius: 140,
      x: 0,
      y: 0,
      vx: -0.6,
      vy: -0.65,
      rot: 0.3,
      rotSpeed: -0.0025,
      color: 'text-[#725a36]', // Warm Amber
    },
  ]);

  const [renderStates, setRenderStates] = useState([]);

  useEffect(() => {
    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const shapes = shapesRef.current;

    // Initial position distribution across screen
    shapes[0].x = width * 0.22;
    shapes[0].y = height * 0.3;
    shapes[1].x = width * 0.78;
    shapes[1].y = height * 0.28;
    shapes[2].x = width * 0.24;
    shapes[2].y = height * 0.74;
    shapes[3].x = width * 0.76;
    shapes[3].y = height * 0.74;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const updatePhysics = () => {
      // 1. Position Update & Boundary Bouncing
      shapes.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.rot += s.rotSpeed;

        if (s.x - s.radius < 0) {
          s.x = s.radius;
          s.vx = Math.abs(s.vx);
        } else if (s.x + s.radius > width) {
          s.x = width - s.radius;
          s.vx = -Math.abs(s.vx);
        }

        if (s.y - s.radius < 0) {
          s.y = s.radius;
          s.vy = Math.abs(s.vy);
        } else if (s.y + s.radius > height) {
          s.y = height - s.radius;
          s.vy = -Math.abs(s.vy);
        }
      });

      // 2. Shape-to-Shape Elastic Collision (Zero Overlapping)
      for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
          const s1 = shapes[i];
          const s2 = shapes[j];
          const dx = s2.x - s1.x;
          const dy = s2.y - s1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = s1.radius + s2.radius;

          if (dist < minDist && dist > 0) {
            // Overlap separation
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            s1.x -= nx * (overlap * 0.5);
            s1.y -= ny * (overlap * 0.5);
            s2.x += nx * (overlap * 0.5);
            s2.y += ny * (overlap * 0.5);

            // Elastic velocity bounce
            const kx = s1.vx - s2.vx;
            const ky = s1.vy - s2.vy;
            const p = nx * kx + ny * ky;

            s1.vx -= p * nx;
            s1.vy -= p * ny;
            s2.vx += p * nx;
            s2.vy += p * ny;
          }
        }
      }

      setRenderStates(
        shapes.map((s) => ({
          id: s.id,
          Icon: s.iconComponent,
          size: s.size,
          x: s.x - s.radius,
          y: s.y - s.radius,
          rot: s.rot,
          color: s.color,
        }))
      );

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    updatePhysics();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {renderStates.map((item) => {
        const { id, Icon, size, x, y, rot, color } = item;
        return (
          <div
            key={id}
            className="absolute top-0 left-0 transition-transform will-change-transform opacity-20"
            style={{
              transform: `translate3d(${x}px, ${y}px, 0) rotate(${rot}rad)`,
              width: `${size}px`,
              height: `${size}px`,
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <Icon size={size * 0.9} className={`${color} stroke-[1.4]`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
