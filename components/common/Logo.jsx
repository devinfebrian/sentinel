import React from 'react';

export default function Logo({ size = 'md', className = '' }) {
  const imgSizes = {
    sm: 'w-9 h-9',
    md: 'w-14 h-14',
    lg: 'w-18 h-18',
  };

  return (
    <div className={`mb-3 flex items-center justify-center transition-transform hover:scale-105 ${className}`}>
      <img
        src="/paper-plane.png"
        alt="Eleva Logo"
        className={`${imgSizes[size]} object-contain filter drop-shadow-xs`}
      />
    </div>
  );
}
