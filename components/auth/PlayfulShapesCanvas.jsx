'use client';

import React, { useEffect, useRef } from 'react';

export default function PlayfulShapesCanvas() {
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

    // Exactly 4 playful shapes positioned across screen
    const shapes = [
      {
        id: 'triangle',
        name: 'Segitiga',
        x: width * 0.18,
        y: height * 0.28,
        baseX: width * 0.18,
        baseY: height * 0.28,
        size: 90,
        vx: 0.3,
        vy: 0.25,
        rot: 0.1,
        rotSpeed: 0.006,
        floatFreq: 0.0015,
        floatAmp: 25,
      },
      {
        id: 'cube',
        name: 'Kubus',
        x: width * 0.82,
        y: height * 0.25,
        baseX: width * 0.82,
        baseY: height * 0.25,
        size: 100,
        vx: -0.25,
        vy: 0.3,
        rot: -0.2,
        rotSpeed: -0.004,
        floatFreq: 0.0018,
        floatAmp: 30,
      },
      {
        id: 'phi',
        name: 'Phi (Φ)',
        x: width * 0.16,
        y: height * 0.75,
        baseX: width * 0.16,
        baseY: height * 0.75,
        size: 95,
        vx: 0.35,
        vy: -0.2,
        rot: 0,
        rotSpeed: 0.003,
        floatFreq: 0.0012,
        floatAmp: 22,
      },
      {
        id: 'asterisk',
        name: 'Asterisk (*)',
        x: width * 0.84,
        y: height * 0.78,
        baseX: width * 0.84,
        baseY: height * 0.78,
        size: 95,
        vx: -0.3,
        vy: -0.25,
        rot: 0.4,
        rotSpeed: -0.005,
        floatFreq: 0.0016,
        floatAmp: 28,
      },
    ];

    let time = 0;

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      shapes.forEach((s) => {
        // Update floating movement
        s.x += s.vx;
        s.y += s.vy;
        s.rot += s.rotSpeed;

        // Soft bounce boundaries
        const margin = 120;
        if (s.x < margin || s.x > width - margin) s.vx *= -1;
        if (s.y < margin || s.y > height - margin) s.vy *= -1;

        // Wavy vertical float offset
        const offsetY = Math.sin(time * s.floatFreq * 2) * s.floatAmp;
        const drawX = s.x;
        const drawY = s.y + offsetY;

        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.rotate(s.rot);

        if (s.id === 'triangle') {
          // 1. Playful Rounded Triangle
          const size = s.size;
          const h = size * 0.9;
          const w = size;

          ctx.beginPath();
          const p1 = { x: 0, y: -h / 2 };
          const p2 = { x: w / 2, y: h / 2 };
          const p3 = { x: -w / 2, y: h / 2 };

          ctx.moveTo(0, -h / 2 + 12);
          ctx.arcTo(p2.x, p2.y, p3.x, p3.y, 20);
          ctx.arcTo(p3.x, p3.y, p1.x, p1.y, 20);
          ctx.arcTo(p1.x, p1.y, p2.x, p2.y, 20);
          ctx.closePath();

          ctx.fillStyle = 'rgba(218, 243, 159, 0.45)'; // Primary Lime pastel
          ctx.fill();
          ctx.strokeStyle = '#516522';
          ctx.lineWidth = 3.5;
          ctx.stroke();

          // Cute inner dot
          ctx.beginPath();
          ctx.arc(0, 8, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#516522';
          ctx.fill();
        } else if (s.id === 'cube') {
          // 2. Playful 3D Wireframe Cube
          const sz = s.size * 0.42;
          const dx = sz * 0.55;
          const dy = sz * 0.35;

          // Front Face
          ctx.beginPath();
          ctx.rect(-sz / 2 - dx / 2, -sz / 2 + dy / 2, sz, sz);
          ctx.fillStyle = 'rgba(233, 209, 253, 0.55)'; // Secondary Lavender
          ctx.fill();
          ctx.strokeStyle = '#69577c';
          ctx.lineWidth = 3.5;
          ctx.stroke();

          // Top Face
          ctx.beginPath();
          ctx.moveTo(-sz / 2 - dx / 2, -sz / 2 + dy / 2);
          ctx.lineTo(-sz / 2 + dx / 2, -sz / 2 - dy / 2);
          ctx.lineTo(sz / 2 + dx / 2, -sz / 2 - dy / 2);
          ctx.lineTo(sz / 2 - dx / 2, -sz / 2 + dy / 2);
          ctx.closePath();
          ctx.fillStyle = 'rgba(244, 230, 255, 0.7)';
          ctx.fill();
          ctx.stroke();

          // Right Face
          ctx.beginPath();
          ctx.moveTo(sz / 2 - dx / 2, -sz / 2 + dy / 2);
          ctx.lineTo(sz / 2 + dx / 2, -sz / 2 - dy / 2);
          ctx.lineTo(sz / 2 + dx / 2, sz / 2 - dy / 2);
          ctx.lineTo(sz / 2 - dx / 2, sz / 2 + dy / 2);
          ctx.closePath();
          ctx.fillStyle = 'rgba(215, 185, 245, 0.45)';
          ctx.fill();
          ctx.stroke();
        } else if (s.id === 'phi') {
          // 3. Playful Phi (Φ) Symbol
          const r = s.size * 0.38;
          const h = s.size * 1.15;

          // Outer Circle
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(185, 217, 235, 0.45)'; // Soft Sky Blue
          ctx.fill();
          ctx.strokeStyle = '#2b6cb0';
          ctx.lineWidth = 3.5;
          ctx.stroke();

          // Center Vertical Line
          ctx.beginPath();
          ctx.lineCap = 'round';
          ctx.moveTo(0, -h / 2);
          ctx.lineTo(0, h / 2);
          ctx.strokeStyle = '#2b6cb0';
          ctx.lineWidth = 4;
          ctx.stroke();

          // Top/bottom cap dots
          ctx.beginPath();
          ctx.arc(0, -h / 2, 4.5, 0, Math.PI * 2);
          ctx.arc(0, h / 2, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#2b6cb0';
          ctx.fill();
        } else if (s.id === 'asterisk') {
          // 4. Playful Asterisk Star (*)
          const spokes = 8;
          const outerR = s.size * 0.45;
          const innerR = s.size * 0.18;

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

          ctx.fillStyle = 'rgba(255, 222, 176, 0.55)'; // Warm Amber
          ctx.fill();
          ctx.strokeStyle = '#725a36';
          ctx.lineWidth = 3.5;
          ctx.stroke();

          // Cute tip dots
          for (let i = 0; i < spokes; i++) {
            const a = (i / spokes) * Math.PI * 2;
            const px = (outerR + 7) * Math.cos(a);
            const py = (outerR + 7) * Math.sin(a);
            ctx.beginPath();
            ctx.arc(px, py, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#725a36';
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
