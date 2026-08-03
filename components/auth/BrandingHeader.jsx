import React from 'react';
import Logo from '../common/Logo';

export default function BrandingHeader({
  title = 'Eleva',
  subtitle = 'Manage your institution effortlessly.',
}) {
  return (
    <div className="flex flex-col items-center mb-6 text-center">
      <Logo size="md" />
      <h1 className="font-headline-lg text-3xl md:text-4xl font-extrabold text-on-background tracking-tight">
        {title}
      </h1>
      <p
        key={subtitle}
        className="font-body-md text-sm md:text-base text-on-surface-variant text-center mt-1.5 px-2 max-w-sm font-medium transition-all duration-300 animate-fade-in"
      >
        {subtitle}
      </p>
    </div>
  );
}
