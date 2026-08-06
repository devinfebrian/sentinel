import React from 'react';

export interface AuthFooterLinkProps {
  text?: string;
  linkText?: string;
  onLinkClick?: () => void;
}

export default function AuthFooterLink({
  text = 'Need help?',
  linkText = 'Contact Admin',
  onLinkClick,
}: AuthFooterLinkProps) {
  return (
    <div className="mt-lg text-center">
      <p className="font-label-lg text-on-surface-variant">
        {text}{' '}
        <a
          href="#help"
          onClick={(e) => {
            e.preventDefault();
            if (onLinkClick) onLinkClick();
            else alert('Please contact your school administrator for account recovery support.');
          }}
          className="text-primary font-bold hover:underline transition-colors focus:outline-none"
        >
          {linkText}
        </a>
      </p>
    </div>
  );
}
