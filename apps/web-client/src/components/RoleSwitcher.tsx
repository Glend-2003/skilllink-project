import React from 'react';
import { useRole } from '../context/RoleContext';
import './RoleSwitcher.css';

export default function RoleSwitcher() {
  const { activeRole, setActiveRole, isProvider } = useRole();

  if (!isProvider) {
    return null;
  }

  return (
    <div className="role-switcher">
      <button
        className={`role-button ${activeRole === 'client' ? 'active' : ''}`}
        onClick={() => setActiveRole('client')}
      >
        Cliente
      </button>
      <button
        className={`role-button ${activeRole === 'provider' ? 'active' : ''}`}
        onClick={() => setActiveRole('provider')}
      >
        Proveedor
      </button>
    </div>
  );
}
