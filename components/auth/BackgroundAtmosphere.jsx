import React from 'react';
import LucidePhysicsShapes from './LucidePhysicsShapes';

export default function BackgroundAtmosphere() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#F4F7F6]">
      {/* 4 Large Lucide React SVG Floating Shapes with Physics Bounce (Segitiga, Kubus, Phi, Asterisk) */}
      <LucidePhysicsShapes />

      {/* Subtle Dot Grid Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-35 pointer-events-none"></div>

      {/* Atmospheric Soft Glow Orbs for Depth */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-[#DAF39F] opacity-25 blur-[140px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-[#B9D9EB] opacity-35 blur-[140px] rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-32 left-1/3 w-[550px] h-[550px] bg-[#E9D1FD] opacity-20 blur-[140px] rounded-full pointer-events-none"></div>

      {/* Floating Paper-Plane Watermark Illustration */}
      <div className="hidden lg:block absolute right-16 bottom-12 opacity-20 hover:opacity-40 transition-opacity duration-700 pointer-events-none">
        <img
          src="/paper-plane.png"
          alt=""
          className="w-56 h-56 object-contain -rotate-12 filter drop-shadow-md"
        />
      </div>
    </div>
  );
}
