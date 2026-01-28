import { useState, useEffect } from 'react';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Home } from './components/client/Home';
import { Navigation } from './Navigation';
import { Toaster } from 'sonner';
import { useAuth } from './components/contexts/AuthContext';

function App() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('login');
  const [userMode, setUserMode] = useState<'client' | 'provider'>('client');

  // Si el usuario se loguea exitosamente, cambiamos a la vista 'home'
  useEffect(() => {
    if (user) {
      setCurrentView('home');
    }
  }, [user]);

  // Pantalla de carga mínima para no romper el diseño mientras validamos el token
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isLoading) return null;

  return (
    <main className="w-screen min-h-screen overflow-x-hidden">
      <Toaster position="top-right" richColors />
      
      {!user ? (
        // MODO PÚBLICO: Solo Login o Registro (Diseño Figma)
        <>
          {currentView === 'login' && <Login onViewChange={setCurrentView} />}
          {currentView === 'register' && <Register onViewChange={setCurrentView} />}
        </>
      ) : (
        // MODO PRIVADO: Usuario autenticado
        <>
          <Navigation 
            currentView={currentView} 
            onViewChange={setCurrentView}
            userMode={userMode}
            onModeChange={setUserMode}
          />
          <div className="content">
            {currentView === 'home' && (
              <Home 
                onViewChange={setCurrentView} 
                onProviderSelect={(id) => console.log(id)} 
              />
            )}
            {/* Aquí puedes agregar las otras vistas del prototipo como Chat, History, etc. */}
          </div>
        </>
      )}
    </main>
  );
}

export default App;