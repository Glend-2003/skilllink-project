import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'client' | 'provider';

interface RoleContextType {
  activeRole: Role;
  setActiveRole: (role: Role) => Promise<void>;
  isProvider: boolean;
  isAdmin: boolean;
  reloadProviderStatus: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRoleState] = useState<Role>('client');
  const [isProvider, setIsProvider] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadActiveRole();
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
        const userType = userData.userType?.toLowerCase();
        setIsProvider(userType === 'provider' || userType === 'admin');
        setIsAdmin(userType === 'admin');
        
        console.log('RoleContext loaded - userType:', userType, 'isProvider:', userType === 'provider' || userType === 'admin', 'isAdmin:', userType === 'admin');
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
