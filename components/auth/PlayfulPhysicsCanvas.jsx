'use client';

import React, { useEffect, useRef } from 'react';

export default function PlayfulPhysicsCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // 4 Large Shapes with Elastic Collision Bounding Radii
    const shapes = [
      {
        id: 'triangle',
        name: 'Segitiga',
        radius: 140, // Large collision radius (diameter 280px)
        x: width * 0.22,
        y: height * 0.3,
        vx: 0.8,
        vy: 0.6,
        mass: 140 * 140,
        rot: 0.1,
        rotSpeed: 0.002,
        strokeColor: 'rgba(81, 101, 34, 0.22)',   // Primary Lime Green
        fillColor: 'rgba(218, 243, 159, 0.08)',
        accentColor: 'rgba(81, 101, 34, 0.30)',
      },
      {
        id: 'cube',
        name: 'Kubus 3D',
        radius: 160, // Large collision radius (diameter 320px)
        x: width * 0.78,
        y: height * 0.28,
        vx: -0.7,
        vy: 0.75,
        mass: 160 * 160,
        rot: -0.2,
        rotSpeed: -0.0018,
        strokeColor: 'rgba(105, 87, 124, 0.22)', // Secondary Lavender
        fillColor: 'rgba(233, 209, 253, 0.08)',
        accentColor: 'rgba(105, 87, 124, 0.30)',
      },
      {
        id: 'phi',
        name: 'Phi (Φ)',
        radius: 145, // Large collision radius (diameter 290px)
        x: width * 0.25,
        y: height * 0.72,
        vx: 0.75,
        vy: -0.65,
        mass: 145 * 145,
        rot: 0.05,
        rotSpeed: 0.0015,
        strokeColor: 'rgba(43, 108, 176, 0.22)',  // Sky Blue
        fillColor: 'rgba(185, 217, 235, 0.08)',
        accentColor: 'rgba(43, 108, 176, 0.30)',
      },
      {
        id: 'asterisk',
        name: 'Asterisk (*)',
        radius: 155, // Large collision radius (diameter 310px)
        x: width * 0.75,
        y: height * 0.75,
        vx: -0.65,
        vy: -0.7,
        mass: 155 * 155,
        rot: 0.3,
        rotSpeed: -0.002,
        strokeColor: 'rgba(114, 90, 54, 0.22)',  // Warm Amber
        fillColor: 'rgba(255, 222, 176, 0.08)',
        accentColor: 'rgba(114, 90, 54, 0.30)',
      },
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Update Positions & Screen Wall Collisions
      shapes.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.rot += s.rotSpeed;

        // Left/Right Wall Bounce
        if (s.x - s.radius < 0) {
          s.x = s.radius;
          s.vx = Math.abs(s.vx);
        } else if (s.x + s.radius > width) {
          s.x = width - s.radius;
          s.vx = -Math.abs(s.vx);
        }

        // Top/Bottom Wall Bounce
        if (s.y - s.radius < 0) {
          s.y = s.radius;
          s.vy = Math.abs(s.vy);
        } else if (s.y + s.radius > height) {
          s.y = height - s.radius;
          s.vy = -Math.abs(s.vy);
        }
      });

      // 2. Shape-to-Shape Elastic Collision Detection & Overlap Resolution
      for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
          const s1 = shapes[i];
          const s2 = shapes[j];

          const dx = s2.x - s1.x;
          const dy = s2.y - s1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = s1.radius + s2.radius;

          if (dist < minDist && dist > 0) {
            // Collision detected! Prevent overlap sticking
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            // Separate shapes proportionally to prevent overlapping
            s1.x -= nx * (overlap * 0.5);
            s1.y -= ny * (overlap * 0.5);
            s2.x += nx * (overlap * 0.5);
            s2.y += ny * (overlap * 0.5);

            // Calculate 2D Elastic Collision Bouncing Physics
            const kx = s1.vx - s2.vx;
            const ky = s1.vy - s2.vy;
            const p = (2 * (nx * kx + ny * ky)) / (s1.mass + s2.mass);

            s1.vx -= p * s2.mass * nx;
            s1.vy -= p * s2.mass * ny;
            s2.vx += p * s1.mass * nx;
            s2.vy += p * s1.mass * ny;
          }
        }
      }

      // 3. Render Large Low-Opacity Shapes
      shapes.forEach((s) => {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot);

        if (s.id === 'triangle') {
          // 1. Large Playful Rounded Triangle
          const size = s.radius * 1.8;
          const h = size * 0.9;
          const w = size;

          ctx.beginPath();
          const p1 = { x: 0, y: -h / 2 };
          const p2 = { x: w / 2, y: h / 2 };
          const p3 = { x: -w / 2, y: h / 2 };

          ctx.moveTo(0, -h / 2 + 18);
          ctx.arcTo(p2.x, p2.y, p3.x, p3.y, 28);
          ctx.arcTo(p3.x, p3.y, p1.x, p1.y, 28);
          ctx.arcTo(p1.x, p1.y, p2.x, p2.y, 28);
          ctx.closePath();

          ctx.fillStyle = s.fillColor;
          ctx.fill();
          ctx.strokeStyle = s.strokeColor;
          ctx.lineWidth = 4;
          ctx.stroke();

          // Accent Inner Dot
          ctx.beginPath();
          ctx.arc(0, 10, 8, 0, Math.PI * 2);
          ctx.fillStyle = s.accentColor;
          ctx.fill();
        } else if (s.id === 'cube') {
          // 2. Large Playful 3D Isometric Cube
          const sz = s.radius * 0.9;
          const dx = sz * 0.55;
          const dy = sz * 0.35;

          // Front Face
          ctx.beginPath();
          ctx.rect(-sz / 2 - dx / 2, -sz / 2 + dy / 2, sz, sz);
          ctx.fillStyle = s.fillColor;
          ctx.fill();
          ctx.strokeStyle = s.strokeColor;
          ctx.lineWidth = 4;
          ctx.stroke();

          // Top Face
          ctx.beginPath();
          ctx.moveTo(-sz / 2 - dx / 2, -sz / 2 + dy / 2);
          ctx.lineTo(-sz / 2 + dx / 2, -sz / 2 - dy / 2);
          ctx.lineTo(sz / 2 + dx / 2, -sz / 2 - dy / 2);
          ctx.lineTo(sz / 2 - dx / 2, -sz / 2 + dy / 2);
          ctx.closePath();
          ctx.fillStyle = 'rgba(244, 230, 255, 0.12)';
          ctx.fill();
          ctx.stroke();

          // Right Face
          ctx.beginPath();
          ctx.moveTo(sz / 2 - dx / 2, -sz / 2 + dy / 2);
          ctx.lineTo(sz / 2 + dx / 2, -sz / 2 - dy / 2);
          ctx.lineTo(sz / 2 + dx / 2, sz / 2 - dy / 2);
          ctx.lineTo(sz / 2 - dx / 2, sz / 2 + dy / 2);
          ctx.closePath();
          ctx.fillStyle = 'rgba(215, 185, 245, 0.06)';
          ctx.fill();
          ctx.stroke();
        } else if (s.id === 'phi') {
          // 3. Large Playful Phi (Φ) Symbol
          const r = s.radius * 0.7;
          const h = s.radius * 2.1;

          // Circle
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fillStyle = s.fillColor;
          ctx.fill();
          ctx.strokeStyle = s.strokeColor;
          ctx.lineWidth = 4;
          ctx.stroke();

          // Vertical Line
          ctx.beginPath();
          ctx.lineCap = 'round';
          ctx.moveTo(0, -h / 2);
          ctx.lineTo(0, h / 2);
          ctx.strokeStyle = s.strokeColor;
          ctx.lineWidth = 4.5;
          ctx.stroke();

          // Top/Bottom cap dots
          ctx.beginPath();
          ctx.arc(0, -h / 2, 6, 0, Math.PI * 2);
          ctx.arc(0, h / 2, 6, 0, Math.PI * 2);
          ctx.fillStyle = s.accentColor;
          ctx.fill();
        } else if (s.id === 'asterisk') {
          // 4. Large Playful Asterisk (*)
          const spokes = 8;
          const outerR = s.radius * 0.85;
          const innerR = s.radius * 0.32;

          ctx.beginPath();
          for (let i = 0; i < spokes * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const a = (i / (spokes * 2)) * Math.PI * 2;
            const px = r * Math.cos(a);
            const py = r * Math.sin(a);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();

          ctx.fillStyle = s.fillColor;
          ctx.fill();
          ctx.strokeStyle = s.strokeColor;
          ctx.lineWidth = 4;
          ctx.stroke();

          // Tip dots
          for (let i = 0; i < spokes; i++) {
            const a = (i / spokes) * Math.PI * 2;
            const px = (outerR + 10) * Math.cos(a);
            const py = (outerR + 10) * Math.sin(a);
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fillStyle = s.accentColor;
            ctx.fill();
          }
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
    />
  );
}
