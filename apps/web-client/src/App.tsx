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
import { useAuth } from './components/contexts/AuthContext';
import { Home } from './components/client/Home';
import { ProviderDetail } from './components/client/ProviderDetail';

export default function App() {
  const { user: currentUser, isLoading } = useAuth();
  const userRole = currentUser?.role?.toLowerCase();
  const [currentView, setCurrentView] = useState('onboarding');
  const [userMode, setUserMode] = useState<UserMode>('client');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  
  useEffect(() => {
    if (currentUser) {
      const role = currentUser.role?.toString().toLowerCase();
      if (role === 'admin' || role === '3') {
          setCurrentView('admin-dashboard');
      } else if (role === 'provider' || role === '2') {
          setCurrentView('provider-dashboard');
          setUserMode('provider');
      } else {
          setCurrentView('home');
          setUserMode('client');
      }
    }
}, [currentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const handleModeChange = (mode: UserMode) => {
    setUserMode(mode);
    if (mode === 'provider') {
      setCurrentView('provider-dashboard');
    } else {
      setCurrentView('home');
    }
  };

  const handleProviderSelect = (providerId: string) => {
    setSelectedProviderId(providerId);
  };

  const renderView = () => {
    if (!currentUser) {
      switch (currentView) {
        case 'register':
          return <Register onViewChange={handleViewChange} />;
        case 'onboarding':
          return <Onboarding onViewChange={handleViewChange} />;
        case 'login':
        default:
          return <Login onViewChange={handleViewChange} />;
      }
    }

    switch (currentView) {
      //Client
      case 'home':
        return (
          <Home 
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

      //Provider
      case 'provider-dashboard':
        return <Dashboard currentUser={currentUser} onViewChange={handleViewChange} />;
      case 'provider-profile':
        return <ProviderProfile currentUser={currentUser} onViewChange={handleViewChange} />;
      case 'provider-plans':
        return <Plans onViewChange={handleViewChange} />;

      //Admin
      case 'admin-dashboard':
        if (userRole !== 'admin' && userRole !== '3') {
          setCurrentView('home');
          return <Home onViewChange={handleViewChange}
            onProviderSelect={handleProviderSelect} />;
        }
        return <AdminDashboard onViewChange={handleViewChange} />;
      case 'admin-users':
        if (userRole !== 'admin') {
          return <Home onViewChange={handleViewChange} onProviderSelect={handleProviderSelect} />;
        }
        return <AdminUsers currentUser={currentUser} onViewChange={handleViewChange} />;

      default:
        if (userRole === 'admin') return <AdminDashboard onViewChange={handleViewChange} />;
        if (userRole === 'provider') return <Dashboard currentUser={currentUser} onViewChange={handleViewChange} />;
        return <Home onViewChange={handleViewChange} onProviderSelect={handleProviderSelect} />;
    }
  };

  const isAuthPage = ['login', 'register', 'onboarding'].includes(currentView);
  const showNavigation = !isAuthPage && !!currentUser;

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
      
      <main>
        {renderView()}
      </main>

      <Toaster />
      {currentUser && (
        <button
          onClick={() => handleViewChange(userRole === 'admin' ? 'admin-dashboard' : 'home')}
          className="fixed bottom-4 right-4 w-12 h-12 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 flex items-center justify-center text-xs font-bold z-50"
          title="Panel de Control"
        >
          {currentUser.role?.charAt(0).toUpperCase() || 'U'}
        </button>
      )}
    </div>
  );
}