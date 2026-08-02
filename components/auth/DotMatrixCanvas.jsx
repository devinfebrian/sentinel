'use client';

import React, { useEffect, useRef } from 'react';

// Generates local sample points for educational/math symbols
function getSymbolSamplePoints(type, size = 70) {
  const points = [];

  if (type === 'phi') {
    // Phi (Φ): Circle + Vertical Line
    const r = size * 0.42;
    const circlePoints = 32;
    for (let i = 0; i < circlePoints; i++) {
      const a = (i / circlePoints) * Math.PI * 2;
      points.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
    }
    const linePoints = 24;
    const h = size * 1.35;
    for (let i = 0; i < linePoints; i++) {
      points.push({ x: 0, y: -h / 2 + (i / (linePoints - 1)) * h });
    }
  } else if (type === 'asterisk') {
    // Asterisk (*): 8 radial arms
    const arms = 8;
    const pointsPerArm = 7;
    points.push({ x: 0, y: 0 });
    for (let a = 0; a < arms; a++) {
      const angle = (a / arms) * Math.PI * 2;
      for (let p = 1; p <= pointsPerArm; p++) {
        const dist = (p / pointsPerArm) * size * 0.55;
        points.push({ x: dist * Math.cos(angle), y: dist * Math.sin(angle) });
      }
    }
  } else if (type === 'pi') {
    // Pi (π): Top horizontal bar + 2 legs
    const w = size * 0.95;
    const h = size * 0.9;
    const barCount = 18;
    for (let i = 0; i < barCount; i++) {
      points.push({ x: -w / 2 + (i / (barCount - 1)) * w, y: -h / 2 });
    }
    const legCount = 14;
    for (let i = 1; i < legCount; i++) {
      const y = -heightFactor(i, legCount, h);
      // Left leg
      points.push({ x: -w * 0.28, y });
      // Right leg with slight curve
      const curve = i === legCount - 1 ? w * 0.12 : 0;
      points.push({ x: w * 0.28 + curve, y });
    }
  } else if (type === 'sigma') {
    // Sigma (Σ): 4 connected segments
    const w = size * 0.75;
    const h = size * 0.85;
    const count = 10;
    // Top bar
    for (let i = 0; i < count; i++) {
      points.push({ x: w / 2 - (i / count) * w, y: -h / 2 });
    }
    // Diagonal to center
    for (let i = 0; i < count; i++) {
      const t = i / count;
      points.push({ x: -w / 2 + t * (w / 2), y: -h / 2 + t * (h / 2) });
    }
    // Diagonal out to bottom right
    for (let i = 0; i < count; i++) {
      const t = i / count;
      points.push({ x: t * (w / 2), y: t * (h / 2) });
    }
    // Bottom bar
    for (let i = 0; i < count; i++) {
      points.push({ x: w / 2 - (i / count) * w, y: h / 2 });
    }
  } else if (type === 'infinity') {
    // Infinity (∞): Lemniscate of Bernoulli
    const count = 48;
    const a = size * 0.48;
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

function heightFactor(i, total, h) {
  return -h / 2 + (i / (total - 1)) * h;
}

export default function DotMatrixCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const gridSpacing = 22; // Distance between grid dots in px
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let cols = Math.ceil(width / gridSpacing) + 1;
    let rows = Math.ceil(height / gridSpacing) + 1;

    // Grid dots state array
    let gridDots = [];

    const initGrid = () => {
      cols = Math.ceil(width / gridSpacing) + 1;
      rows = Math.ceil(height / gridSpacing) + 1;
      gridDots = [];

      for (let r = 0; r < rows; r++) {
        const rowArray = [];
        for (let c = 0; c < cols; c++) {
          rowArray.push({
            x: c * gridSpacing,
            y: r * gridSpacing,
            intensity: 0,
            targetIntensity: 0,
            color: 'rgb(81, 101, 34)', // Default lit color
          });
        }
        gridDots.push(rowArray);
      }
    };

    initGrid();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initGrid();
    };

    window.addEventListener('resize', handleResize);

    // Color choices for lit shapes
    const themeColors = [
      { r: 81, g: 101, b: 34 },   // Lime Green (Primary)
      { r: 105, g: 87, b: 124 },  // Lavender (Secondary)
      { r: 114, g: 90, b: 54 },   // Warm Amber (Tertiary)
      { r: 40, g: 120, b: 200 },  // Sky Blue
    ];

    // Moving Shape Objects
    const shapes = [
      { type: 'phi', x: width * 0.2, y: height * 0.3, vx: 0.4, vy: 0.35, rot: 0, rotSpeed: 0.004, color: themeColors[0], points: getSymbolSamplePoints('phi', 85) },
      { type: 'asterisk', x: width * 0.8, y: height * 0.25, vx: -0.35, vy: 0.4, rot: 0, rotSpeed: -0.005, color: themeColors[1], points: getSymbolSamplePoints('asterisk', 95) },
      { type: 'pi', x: width * 0.15, y: height * 0.75, vx: 0.45, vy: -0.3, rot: 0, rotSpeed: 0.003, color: themeColors[2], points: getSymbolSamplePoints('pi', 80) },
      { type: 'sigma', x: width * 0.75, y: height * 0.8, vx: -0.4, vy: -0.35, rot: 0, rotSpeed: -0.004, color: themeColors[3], points: getSymbolSamplePoints('sigma', 85) },
      { type: 'infinity', x: width * 0.5, y: height * 0.45, vx: 0.3, vy: -0.4, rot: 0, rotSpeed: 0.002, color: themeColors[0], points: getSymbolSamplePoints('infinity', 100) },
    ];

    const glowRadius = 24; // Radius around shape strokes where dots light up

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Reset target intensity for all grid dots
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          gridDots[r][c].targetIntensity = 0;
        }
      }

      // 2. Move shapes and calculate lighting intensity on overlapping grid dots
      shapes.forEach((shape) => {
        // Move position
        shape.x += shape.vx;
        shape.y += shape.vy;
        shape.rot += shape.rotSpeed;

        // Bounce gently off boundaries
        const margin = 100;
        if (shape.x < margin || shape.x > width - margin) shape.vx *= -1;
        if (shape.y < margin || shape.y > height - margin) shape.vy *= -1;

        const cosR = Math.cos(shape.rot);
        const sinR = Math.sin(shape.rot);

        // Process transformed sample points of this shape
        shape.points.forEach((pt) => {
          // Rotate and translate local point
          const px = shape.x + (pt.x * cosR - pt.y * sinR);
          const py = shape.y + (pt.x * sinR + pt.y * cosR);

          // Find affected grid range
          const centerCol = Math.round(px / gridSpacing);
          const centerRow = Math.round(py / gridSpacing);

          const range = 2; // Check 5x5 grid cells around sample point
          for (let r = Math.max(0, centerRow - range); r <= Math.min(rows - 1, centerRow + range); r++) {
            for (let c = Math.max(0, centerCol - range); c <= Math.min(cols - 1, centerCol + range); c++) {
              const dot = gridDots[r][c];
              const dx = dot.x - px;
              const dy = dot.y - py;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < glowRadius) {
                const intensity = Math.pow(1 - dist / glowRadius, 1.6);
                if (intensity > dot.targetIntensity) {
                  dot.targetIntensity = intensity;
                  dot.color = shape.color;
                }
              }
            }
          }
        });
      });

      // 3. Smoothly update intensity & draw grid dots
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const dot = gridDots[r][c];

          // Smooth LED light turn on / fade decay
          if (dot.targetIntensity > dot.intensity) {
            dot.intensity += (dot.targetIntensity - dot.intensity) * 0.35; // Quick light up
          } else {
            dot.intensity += (dot.targetIntensity - dot.intensity) * 0.08; // Smooth fade out trail
          }

          ctx.beginPath();

          if (dot.intensity > 0.05) {
            // Lit LED Dot
            const radius = 1.3 + dot.intensity * 2.1; // Expands up to 3.4px
            ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);

            const { r, g, b } = dot.color;
            const alpha = 0.3 + dot.intensity * 0.7;
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;

            // Soft glowing halo
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${dot.intensity * 0.8})`;
            ctx.shadowBlur = 8 * dot.intensity;
            ctx.fill();
            ctx.shadowBlur = 0; // reset shadow for performance
          } else {
            // Unlit Static Grid Dot (Default background matrix dot)
            ctx.arc(dot.x, dot.y, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(203, 213, 225, 0.35)'; // Soft neutral slate dot
            ctx.fill();
          }
        }
      }

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
