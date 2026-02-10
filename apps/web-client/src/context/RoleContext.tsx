import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants/Config';

type Role = 'client' | 'provider';

interface RoleContextType {
  activeRole: Role;
  setActiveRole: (role: Role) => Promise<void>;
  isProvider: boolean;
  isAdmin: boolean;
  reloadProviderStatus: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

function parseJwtRoles(token?: string): string[] {
  if (!token) return [];
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return [];
    const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, '=');
    const json = atob(padded);
    const payload = JSON.parse(json);

    const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      ?? payload['role'];

    if (Array.isArray(roles)) {
      return roles.map((r) => String(r).toLowerCase());
    }
    if (typeof roles === 'string') {
      return [roles.toLowerCase()];
    }
  } catch (error) {
    console.warn('Failed to parse roles from token:', error);
  }
  return [];
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRoleState] = useState<Role>('client');
  const [isProvider, setIsProvider] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Cargar al montar
  useEffect(() => {
    loadActiveRole();
  }, []);

  // Escuchar cambios en userData (ej: cuando se loguea)
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('Storage changed, reloading RoleContext');
      loadActiveRole();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // También escuchar un evento custom que se disparará desde login
    window.addEventListener('userDataChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userDataChanged', handleStorageChange);
    };
  }, []);

  const loadActiveRole = async () => {
    try {
      const savedRole = localStorage.getItem('activeRole');
      if (savedRole === 'provider' || savedRole === 'client') {
        setActiveRoleState(savedRole);
      }
      // Read from 'userData' which is set by AuthContext on login
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        let userType = userData.userType?.toLowerCase()?.trim();
        const providerStatus = userData.providerStatus;
        const tokenRoles = parseJwtRoles(userData.token);

        if (tokenRoles.includes('admin')) {
          userType = 'admin';
        } else if (!userType && tokenRoles.includes('provider')) {
          userType = 'provider';
        }
        
        console.log('Raw userData from storage:', userData);
        console.log('Processed userType:', userType, 'tokenRoles:', tokenRoles);
        
        // Si userType es 'provider', se asume que ya fue aprobado por el backend
        // Si userType es 'admin', también tiene permisos de proveedor
        const isApprovedProvider = userType === 'provider' || userType === 'admin';
        
        setIsProvider(isApprovedProvider);
        setIsAdmin(userType === 'admin');
        
        // If user is an approved provider, set activeRole to 'provider' by default
        if (isApprovedProvider && userType === 'provider') {
          setActiveRoleState('provider');
          localStorage.setItem('activeRole', 'provider');
        } else if (userType === 'admin') {
          // Admin puede ver proveedor pero por defecto cliente
          setActiveRoleState('client');
          localStorage.setItem('activeRole', 'client');
        } else {
          setActiveRoleState('client');
          localStorage.setItem('activeRole', 'client');
        }
        
        console.log('RoleContext loaded - userType:', userType, 'isApprovedProvider:', isApprovedProvider, 'isAdmin:', userType === 'admin');
      }
    } catch (error) {
      console.error('Error loading active role:', error);
    }
  };

  const setActiveRole = async (role: Role) => {
    try {
      localStorage.setItem('activeRole', role);
      setActiveRoleState(role);
    } catch (error) {
      console.error('Error saving active role:', error);
    }
  };

  return (
    <RoleContext.Provider value={{ activeRole, setActiveRole, isProvider, isAdmin, reloadProviderStatus: loadActiveRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
