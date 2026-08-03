import React from 'react';

export default function RoleTabs({ activeRole, onRoleChange }) {
  const roles = [
    { id: 'staff', label: 'Staff & Educator', icon: 'badge' },
    { id: 'student', label: 'Student', icon: 'school' },
  ];

  return (
    <div className="bg-[#F1F3F2] p-1.5 rounded-xl flex gap-1 mb-6 border border-slate-200/60">
      {roles.map((role) => {
        const isActive = activeRole === role.id;
        return (
          <button
            key={role.id}
            type="button"
            onClick={() => onRoleChange(role.id)}
            className={`flex-1 py-2.5 px-3 rounded-lg font-label-lg text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
              isActive
                ? 'bg-white text-primary font-bold shadow-xs border border-slate-200/80'
                : 'text-on-surface-variant hover:text-primary hover:bg-white/40'
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] ${isActive ? 'filled' : ''}`}>
              {role.icon}
            </span>
            <span>{role.label}</span>
          </button>
        );
      })}
    </div>
  );
}
