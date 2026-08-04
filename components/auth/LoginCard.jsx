import React from 'react';
import StaffLoginForm from './StaffLoginForm';

export default function LoginCard({
  onLoginSubmit,
  onGoogleTokenSuccess,
  serverError,
}) {
  return (
    <StaffLoginForm
      onSubmit={onLoginSubmit}
      onGoogleTokenSuccess={onGoogleTokenSuccess}
      serverError={serverError}
    />
  );
}
