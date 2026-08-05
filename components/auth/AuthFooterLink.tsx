import React from 'react';

export interface AuthFooterLinkProps {
  text?: string;
  linkText?: string;
  /** Where to reach whoever manages accounts. */
  href?: string;
}

/**
 * Plain text and a mailto link, so this stays a Server Component and needs no
 * click handler. The previous version popped an alert() telling people to
 * contact their "school administrator" — copy left over from the Eleva LMS.
 */
export default function AuthFooterLink({
  text = 'Trouble signing in?',
  linkText = 'Contact your Finance Lead',
  href = 'mailto:',
}: AuthFooterLinkProps) {
  return (
    <div className="mt-lg text-center">
      <p className="font-label-lg text-label-lg text-on-surface-variant">
        {text}{' '}
        <a
          href={href}
          className="text-primary font-bold hover:underline transition-colors focus:outline-none"
        >
          {linkText}
        </a>
      </p>
    </div>
  );
}
