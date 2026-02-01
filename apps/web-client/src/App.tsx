import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Dashboard } from './components/provider/Dashboard';
import { ProviderProfile } from './components/provider/ProviderProfile';
import { Plans } from './components/provider/Plans';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminUsers } from './components/admin/AdminUsers';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Onboarding } from './components/auth/Onboarding';
import { Toaster } from './components/ui/sonner';
import { type UserMode } from './types';
import type { User } from './services/userService';
import { useAuth } from './components/contexts/AuthContext';

export default function App() {
  const { user: currentUser, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('onboarding');
  const [userMode, setUserMode] = useState<UserMode>('client');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (isLoading) return <div>Cargando...</div>;

  // Handle view changes
  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  // Handle mode changes
  const handleModeChange = (mode: UserMode) => {
    setUserMode(mode);
    // Auto-switch view when changing mode
    if (mode === 'provider') {
      setCurrentView('provider-dashboard');
    } else {
      setCurrentView('home');
    }
  };

  // Handle provider selection
  const handleProviderSelect = (providerId: string) => {
    setSelectedProviderId(providerId);
  };

  // Render the current view
  const renderView = () => {
    const isAuthView = ['login', 'register', 'onboarding'].includes(currentView);
    if (!isAuthView && !currentUser) {
      return <Login onViewChange={handleViewChange} />;
    }

    switch (currentView) {
      // Auth views
      case 'login':
        return <Login onViewChange={handleViewChange} />;
      case 'register':
        return <Register onViewChange={handleViewChange} />;
      case 'onboarding':
        return <Onboarding onViewChange={handleViewChange} />;

      // Client views
      /*case 'home':
        return (
          <Home 
            onViewChange={handleViewChange}
            onProviderSelect={handleProviderSelect}
          />
        );
      case 'search':
        return (
          <SearchProviders
            onViewChange={handleViewChange}
            onProviderSelect={handleProviderSelect}
          />
        );
      case 'provider-detail':
        return (
          <ProviderDetail
            providerId={selectedProviderId}
            onViewChange={handleViewChange}
          />
        );
      case 'chat':
        return <Chat onViewChange={handleViewChange} />;
      case 'history':
        return <History onViewChange={handleViewChange} />;*/

      // Provider views
      case 'provider-dashboard':
        if (!currentUser) {
          return <Login onViewChange={handleViewChange} />;
        }
        return <Dashboard currentUser={currentUser!} onViewChange={handleViewChange} />;
      case 'provider-profile':
        return <ProviderProfile currentUser={currentUser!} onViewChange={handleViewChange} />;
      case 'provider-plans':
        return <Plans onViewChange={handleViewChange} />;

      // Admin views
      case 'admin-dashboard':
        //if (currentUser?.userType !== 'admin') return <Home onViewChange={handleViewChange} />;
        return <AdminDashboard onViewChange={handleViewChange} />;
      case 'admin-users':
        return <AdminUsers currentUser={currentUser!} onViewChange={handleViewChange} />;

      default:
        return <Login onViewChange={handleViewChange} />;
    }
  };

  const showNavigation = currentView !== 'login' && currentView !== 'register' && currentView !== 'onboarding';
  const showAdminButton = currentView !== 'login' && currentView !== 'register' && currentView !== 'onboarding';

  return (
    <div className="min-h-screen bg-white">
      {showNavigation && (
        <Navigation
          currentView={currentView}
          onViewChange={handleViewChange}
          userMode={userMode}
          onModeChange={handleModeChange}
          currentUser={currentUser!}
        />
      )}
      {renderView()}
      <Toaster />

      {/* Admin Access Button (for demo purposes) */}
      {showAdminButton && (
        <button
          onClick={() => handleViewChange('admin-dashboard')}
          className="fixed bottom-4 right-4 w-12 h-12 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 flex items-center justify-center text-xs font-bold z-50"
          title="Admin Panel"
        >
          A
        </button>
      )}
    </div>
  );
}