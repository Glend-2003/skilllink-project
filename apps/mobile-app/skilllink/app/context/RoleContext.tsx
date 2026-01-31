import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RoleContextType {
  activeRole: 'client' | 'provider';
  setActiveRole: (role: 'client' | 'provider') => Promise<void>;
  isProvider: boolean;
  reloadProviderStatus: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRoleState] = useState<'client' | 'provider'>('client');
  const [isProvider, setIsProvider] = useState(false);

  useEffect(() => {
    loadActiveRole();
  }, []);

  const loadActiveRole = async () => {
    try {
      const savedRole = await AsyncStorage.getItem('activeRole');
      if (savedRole === 'provider' || savedRole === 'client') {
        setActiveRoleState(savedRole);
      }
      
      const profile = await AsyncStorage.getItem('userProfile');
      if (profile) {
        const parsedProfile = JSON.parse(profile);
        const userType = parsedProfile.userType?.toLowerCase();
        setIsProvider(userType === 'provider');
        console.log('🔍 RoleContext: userType =', parsedProfile.userType, 'isProvider =', userType === 'provider');
      }
    } catch (error) {
      console.error('Error loading active role:', error);
    }
  };

  const setActiveRole = async (role: 'client' | 'provider') => {
    try {
      await AsyncStorage.setItem('activeRole', role);
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
