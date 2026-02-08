import React from 'react';

export default function RoleSwitcher({ roles, value, onChange }: { roles: string[]; value: string; onChange: (role: string) => void }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      {roles.map(role => (
        <option key={role} value={role}>{role}</option>
      ))}
    </select>
  );
}
