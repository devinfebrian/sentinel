'use client';

import React, { useEffect, useRef } from 'react';

// Helper to generate dot points for educational mathematical/scientific symbols
function generateSymbolDots(symbolType, size = 60) {
  const points = [];

  if (symbolType === 'phi') {
    // Phi (Φ): Circle + Vertical Line
    const r = size * 0.4;
    const circleDotsCount = 28;
    for (let i = 0; i < circleDotsCount; i++) {
      const angle = (i / circleDotsCount) * Math.PI * 2;
      points.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
    }
    const lineDotsCount = 20;
    const height = size * 1.3;
    for (let i = 0; i < lineDotsCount; i++) {
      const y = -height / 2 + (i / (lineDotsCount - 1)) * height;
      points.push({ x: 0, y });
    }
  } else if (symbolType === 'asterisk') {
    // Asterisk (*): 8-pointed radial star
    const spokes = 8;
    const dotsPerSpoke = 5;
    points.push({ x: 0, y: 0 });
    for (let s = 0; s < spokes; s++) {
      const angle = (s / spokes) * Math.PI * 2;
      for (let d = 1; d <= dotsPerSpoke; d++) {
        const dist = (d / dotsPerSpoke) * size * 0.55;
        points.push({ x: dist * Math.cos(angle), y: dist * Math.sin(angle) });
      }
    }
  } else if (symbolType === 'pi') {
    // Pi (π): Top horizontal bar + 2 vertical legs
    const width = size * 0.9;
    const height = size * 0.9;
    const barDots = 14;
    for (let i = 0; i < barDots; i++) {
      const x = -width / 2 + (i / (barDots - 1)) * width;
      points.push({ x, y: -height / 2 });
    }
    const legDots = 10;
    for (let i = 1; i < legDots; i++) {
      const y = -height / 2 + (i / (legDots - 1)) * height;
      // Left leg
      points.push({ x: -width * 0.28, y });
      // Right leg with slight curve at bottom
      const curve = i === legDots - 1 ? width * 0.1 : 0;
      points.push({ x: width * 0.28 + curve, y });
    }
  } else if (symbolType === 'sigma') {
    // Sigma (Σ): Top bar, diagonal in, diagonal out, bottom bar
    const w = size * 0.7;
    const h = size * 0.8;
    const segDots = 8;
    // Top bar
    for (let i = 0; i < segDots; i++) {
      points.push({ x: w / 2 - (i / segDots) * w, y: -h / 2 });
    }
    // Diagonal to center
    for (let i = 0; i < segDots; i++) {
      const t = i / segDots;
      points.push({ x: -w / 2 + t * (w / 2), y: -h / 2 + t * (h / 2) });
    }
    // Diagonal out to bottom right
    for (let i = 0; i < segDots; i++) {
      const t = i / segDots;
      points.push({ x: t * (w / 2), y: t * (h / 2) });
    }
    // Bottom bar
    for (let i = 0; i < segDots; i++) {
      points.push({ x: w / 2 - (i / segDots) * w, y: h / 2 });
    }
  } else if (symbolType === 'infinity') {
    // Infinity (∞): Lemniscate of Bernoulli
    const count = 36;
    const a = size * 0.45;
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const denom = 1 + Math.sin(t) * Math.sin(t);
      const x = (a * Math.cos(t)) / denom;
      const y = (a * Math.sin(t) * Math.cos(t)) / denom;
      points.push({ x, y });
    }
  }

  return points;
}

export default function DotConstellationCanvas() {
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

    // Color palette matching Eleva theme (lime green, lavender, soft blue, warm amber)
    const colors = [
      'rgba(81, 101, 34, 0.45)',   // Primary lime green
      'rgba(105, 87, 124, 0.40)',  // Secondary lavender
      'rgba(114, 90, 54, 0.40)',   // Warm tertiary amber
      'rgba(59, 130, 246, 0.35)',  // Soft sky blue
    ];

    // Create 6 floating constellation shapes placed strategically across the background
    const symbolsList = ['phi', 'asterisk', 'pi', 'sigma', 'infinity', 'asterisk'];

    const constellations = symbolsList.map((type, idx) => {
      const size = Math.random() * 30 + 65; // size between 65px - 95px
      return {
        type,
        x: (0.15 + (idx * 0.16) % 0.8) * width + (Math.random() - 0.5) * 100,
        y: (0.2 + Math.floor(idx / 3) * 0.5) * height + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.003,
        scale: 1,
        pulseOffset: Math.random() * Math.PI * 2,
        pulseSpeed: 0.015 + Math.random() * 0.01,
        color: colors[idx % colors.length],
        dots: generateSymbolDots(type, size),
        dotRadius: 2.2 + Math.random() * 0.8,
      };
    });

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Render each constellation shape
      constellations.forEach((c) => {
        // Move position
        c.x += c.vx;
        c.y += c.vy;

        // Bounce gently off bounds
        const margin = 80;
        if (c.x < margin || c.x > width - margin) c.vx *= -1;
        if (c.y < margin || c.y > height - margin) c.vy *= -1;

        // Update rotation and breathing pulse
        c.rotation += c.rotationSpeed;
        const currentOpacity = 0.5 + 0.35 * Math.sin(time * c.pulseSpeed * 50 + c.pulseOffset);
        const currentScale = 1 + 0.05 * Math.sin(time * c.pulseSpeed * 30);

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);
        ctx.scale(currentScale, currentScale);

        // Draw connecting subtle constellation lines between close dots
        ctx.strokeStyle = c.color.replace(/[\d\.]+\)$/, `${currentOpacity * 0.25})`);
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (let i = 0; i < c.dots.length; i++) {
          for (let j = i + 1; j < c.dots.length; j++) {
            const dx = c.dots[i].x - c.dots[j].x;
            const dy = c.dots[i].y - c.dots[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            // Connect nearby dots within threshold
            if (dist < 26) {
              ctx.moveTo(c.dots[i].x, c.dots[i].y);
              ctx.lineTo(c.dots[j].x, c.dots[j].y);
            }
          }
        }
        ctx.stroke();

        // Draw individual glowing dots
        c.dots.forEach((dot) => {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, c.dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = c.color.replace(/[\d\.]+\)$/, `${currentOpacity})`);
          ctx.shadowColor = c.color;
          ctx.shadowBlur = 6;
          ctx.fill();
        });

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
