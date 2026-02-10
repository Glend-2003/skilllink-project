import { Menu, User, MessageCircle, History, LayoutDashboard, Settings, LogOut, Home, Search as SearchIcon, Wrench } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { useAuth } from '../context/AuthContext';
import RoleSwitcher from './RoleSwitcher';

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isProvider = user?.userType === 'provider';

  const clientMenuItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/search', label: 'Buscar', icon: SearchIcon },
    { path: '/chat', label: 'Mensajes', icon: MessageCircle },
    { path: '/my-requests', label: 'Historial', icon: History },
  ];

  const providerMenuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/provider/services', label: 'Mis Servicios', icon: Wrench },
    { path: '/chat', label: 'Mensajes', icon: MessageCircle },
    { path: '/my-requests', label: 'Solicitudes', icon: History },
  ];

  const menuItems = isProvider ? providerMenuItems : clientMenuItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-between px-6 py-4 bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-8">
          <h1 
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent cursor-pointer"
            onClick={() => navigate('/')}
          >
            SkillLink
          </h1>
          <div className="flex gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={isCurrentPath(item.path) ? 'default' : 'ghost'}
                  onClick={() => navigate(item.path)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <RoleSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            title="Mi Perfil"
          >
            <Avatar className="cursor-pointer w-8 h-8">
              <AvatarImage src="" alt={user?.email || 'Usuario'} />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b sticky top-0 z-50 shadow-sm">
        <h1 
          className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent cursor-pointer"
          onClick={() => navigate('/')}
        >
          SkillLink
        </h1>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Menú</SheetTitle>
              <SheetDescription>
                Navega por la aplicación
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <Avatar>
                  <AvatarImage src="" alt={user?.email || 'Usuario'} />
                  <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user?.email || 'Usuario'}</p>
                  <p className="text-sm text-slate-600">{isProvider ? 'Proveedor' : 'Cliente'}</p>
                </div>
              </div>

              <div className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      variant={isCurrentPath(item.path) ? 'default' : 'ghost'}
                      onClick={() => navigate(item.path)}
                      className="w-full justify-start gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="mb-4">
                  <RoleSwitcher />
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2 text-slate-600"
                  onClick={() => navigate('/profile')}
                >
                  <User className="w-4 h-4" />
                  Mi Perfil
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2 text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </>
  );
}
