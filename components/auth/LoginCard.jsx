import React from 'react';
import RoleTabs from './RoleTabs';
import StaffLoginForm from './StaffLoginForm';
import StudentLoginForm from './StudentLoginForm';

export default function LoginCard({
  activeRole,
  onRoleChange,
  onLoginSubmit,
  onGoogleTokenSuccess,
  serverError,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0px_20px_50px_rgba(0,0,0,0.06)] p-6 md:p-8 transition-all backdrop-blur-sm relative z-10">
      {/* Role Navigation Tabs */}
      <RoleTabs activeRole={activeRole} onRoleChange={onRoleChange} />

      {/* Dynamic Role Form */}
      {activeRole === 'student' ? (
        <StudentLoginForm
          onSubmit={onLoginSubmit}
          serverError={serverError}
        />
      ) : (
        <StaffLoginForm
          onSubmit={onLoginSubmit}
          onGoogleTokenSuccess={onGoogleTokenSuccess}
          serverError={serverError}
        />
      )}
    </div>
  );
}
