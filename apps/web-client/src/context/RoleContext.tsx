import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'client' | 'provider';

interface RoleContextType {
  activeRole: Role;
  setActiveRole: (role: Role) => Promise<void>;
  isProvider: boolean;
  reloadProviderStatus: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRoleState] = useState<Role>('client');
  const [isProvider, setIsProvider] = useState(false);

  useEffect(() => {
    loadActiveRole();
  }, []);

  const loadActiveRole = async () => {
    try {
      const savedRole = localStorage.getItem('activeRole');
      if (savedRole === 'provider' || savedRole === 'client') {
        setActiveRoleState(savedRole);
      }
      const profile = localStorage.getItem('userProfile');
      if (profile) {
        const parsedProfile = JSON.parse(profile);
        const userType = parsedProfile.userType?.toLowerCase();
        setIsProvider(userType === 'provider');
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
    <RoleContext.Provider value={{ activeRole, setActiveRole, isProvider, reloadProviderStatus: loadActiveRole }}>
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
